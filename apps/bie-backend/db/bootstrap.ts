import 'dotenv/config';
import { Pool } from 'pg';
import { URL } from 'url';

function ident(name: string) {
  return `"${name.replace(/"/g, '""')}"`;
}
function lit(val: string) {
  return `'${val.replace(/'/g, "''")}'`;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in env.');
  process.exit(1);
}

// Parse desired app user/pass and db from DATABASE_URL
const u = new URL(DATABASE_URL);
if (!u.username || u.username.includes('<')) {
  console.error('Please set a real DB user in DATABASE_URL (e.g., cms_auth).');
  process.exit(1);
}
const appUser = decodeURIComponent(u.username);
const appPass = decodeURIComponent(u.password || '');
const dbName = u.pathname.replace(/^\//, '') || 'postgres';

// Superuser connection for bootstrap (override with PG_SUPER_URL if needed)
const SUPER_URL =
  process.env.PG_SUPER_URL ||
  // works on most local installs
  'postgresql://postgres@localhost:5432/postgres';

async function main() {
  const pool = new Pool({ connectionString: SUPER_URL });
  const client = await pool.connect();
  try {
    // Create role if missing
    const roleExists = await client.query(
      'SELECT 1 FROM pg_roles WHERE rolname = $1',
      [appUser]
    );
    if (roleExists.rowCount === 0) {
      console.log(`→ Creating role ${appUser}`);
      await client.query(
        `CREATE ROLE ${ident(appUser)} LOGIN PASSWORD ${lit(appPass)}`
      );
    } else {
      // keep password fresh in dev so you can change it via .env
      console.log(`→ Role ${appUser} exists; ensuring password is set`);
      await client.query(
        `ALTER ROLE ${ident(appUser)} WITH PASSWORD ${lit(appPass)}`
      );
    }

    // Create database if missing
    const dbExists = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );
    if (dbExists.rowCount === 0) {
      console.log(`→ Creating database ${dbName} owned by ${appUser}`);
      await client.query(
        `CREATE DATABASE ${ident(dbName)} OWNER ${ident(appUser)} TEMPLATE template1 ENCODING 'UTF8'`
      );
    } else {
      console.log(`→ Database ${dbName} exists; ensuring owner is ${appUser}`);
      await client.query(
        `ALTER DATABASE ${ident(dbName)} OWNER TO ${ident(appUser)}`
      );
    }
    console.log('✓ Bootstrap done.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
