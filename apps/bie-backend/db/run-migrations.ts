import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localDir = path.join(__dirname, 'migrations'); // for running script from backend root dir
const monoDir  = path.resolve(process.cwd(), 'apps/bie-backend/db/migrations'); // for running script from repo root dir
const MIGRATIONS_DIR = fs.existsSync(localDir) ? localDir : monoDir;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      checksum TEXT NOT NULL
    )
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const name = file;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const checksum = crypto.createHash('sha256').update(sql).digest('hex');

    const { rows } = await pool.query(`SELECT checksum FROM _migrations WHERE name=$1`, [name]);
    if (rows.length) {
      if (rows[0].checksum !== checksum) {
        throw new Error(`Checksum mismatch for ${name}. File changed after being applied.`);
      }
      console.log(`✓ ${name} (already applied)`);
      continue;
    }

    console.log(`→ Applying ${name} ...`);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(`INSERT INTO _migrations(name, checksum) VALUES ($1, $2)`, [name, checksum]);
      await client.query('COMMIT');
      console.log(`✓ ${name}`);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
