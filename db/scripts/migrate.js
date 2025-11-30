import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIG_DIR = path.resolve(__dirname, "..", "migrations");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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
  const sql = fs.readFileSync(path.join(MIG_DIR, file), "utf8");
  await client.query("BEGIN");
  try {
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations(name) VALUES($1) ON CONFLICT DO NOTHING",
      [file]
    );
    await client.query("COMMIT");
    console.log("migrated:", file);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("failed:", file, e.message);
    throw e;
  }
}

async function main() {
  if (!fs.existsSync(MIG_DIR)) {
    console.log("No migrations directory found, skipping.");
    return;
  }
  const client = await pool.connect();
  try {
    await ensureTable(client);
    const { rows } = await client.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.name));
    const files = fs
      .readdirSync(MIG_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const f of files) {
      if (!applied.has(f)) await runMigration(client, f);
      else console.log("already applied:", f);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
