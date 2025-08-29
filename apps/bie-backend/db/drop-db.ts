import 'dotenv/config';
import { Pool } from 'pg';
import { URL } from 'url';

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to drop DB in production.');
  process.exit(1);
}

const SUPER_URL = process.env.PG_SUPER_URL || 'postgresql://postgres@localhost:5432/postgres';
const u = new URL(process.env.DATABASE_URL!);
const dbName = u.pathname.replace(/^\//, '') || 'postgres';

(async () => {
  const pool = new Pool({ connectionString: SUPER_URL });
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`SHOW server_version_num`);
    const v = parseInt(rows[0].server_version_num, 10);
    if (v >= 130000) {
      await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    } else {
      await client.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1`,
        [dbName]
      );
      await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    }
    console.log(`Dropped database ${dbName}`);
  } finally {
    client.release();
    await pool.end();
  }
})().catch(e => { console.error(e); process.exit(1); });