import 'dotenv/config';
import { Pool } from 'pg';
import argon2 from 'argon2';

function req(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing ${key} in .env`);
  return v;
}

const pool = new Pool({ connectionString: req('DATABASE_URL') });

async function main() {
  const email = req('ADMIN_EMAIL');
  const pass = req('ADMIN_PASSWORD');
  const username = req('ADMIN_DISPLAYNAME').trim().toLowerCase();
  const firstName = req('ADMIN_FIRST_NAME').trim();
  const lastName = req('ADMIN_LAST_NAME').trim();

  const hash = await argon2.hash(pass, { type: argon2.argon2id });

  await pool.query(
    `INSERT INTO users (email, password_hash, username, first_name, last_name)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           username = COALESCE(EXCLUDED.username, users.username),
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name`,
    [email, hash, username, firstName, lastName]
  );

  console.log(`Admin added: ${username}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => pool.end());