import pg from 'pg';
import 'dotenv/config';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export async function query(text, params){ return pool.query(text, params); }
export async function getClient(){ return pool.connect(); }
