import 'dotenv/config';
import { Pool } from 'pg';
import argon2 from 'argon2';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

async function main() {
  const email = process.env.ADMIN_EMAIL!;
  const pass  = process.env.ADMIN_PASSWORD!;
  const hash  = await argon2.hash(pass, { type: argon2.argon2id });

  await pool.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash, updated_at = now()`,
    [email, hash]
  );

  console.log(`✓ Admin upserted with email ${email}`);
}
main().catch(e => { console.error(e); process.exit(1); });