import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIG_DIR = path.resolve(__dirname, '..', 'migrations');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const run = async () => {
  const client = await pool.connect();
  try {
    const files = fs.readdirSync(MIG_DIR).filter(f=>f.endsWith('.sql')).sort();
    for (const f of files) {
      const sql = fs.readFileSync(path.join(MIG_DIR, f), 'utf8');
      console.log('→ applying', f);
      await client.query(sql);
    }
    console.log('✓ migrations applied');
  } finally {
    client.release();
    await pool.end();
  }
};
run().catch(err => { console.error(err); process.exit(1); });
