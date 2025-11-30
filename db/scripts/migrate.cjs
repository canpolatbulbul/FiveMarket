// db/scripts/migrate.cjs
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://fivemarket:fivemarket@localhost:5432/fivemarket";
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function runMigration(client, file) {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations(name) VALUES($1) ON CONFLICT DO NOTHING",
      [file]
    );
    await client.query("COMMIT");
    console.log("✅ migrated:", file);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ failed:", file, e.message);
    throw e;
  }
}

async function main() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log("No migrations directory found, skipping.");
    return;
  }
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await ensureTable(client);
    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.name));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort((a, b) => a.localeCompare(b));

    for (const f of files) {
      if (!applied.has(f)) await runMigration(client, f);
      else console.log("↷ already applied:", f);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
