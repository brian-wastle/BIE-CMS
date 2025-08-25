import { Pool } from 'pg';
import argon2 from 'argon2';

const email = process.env.ADMIN_EMAIL!;
const password = process.env.ADMIN_PASSWORD!;
if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.');
  process.exit(1);
}

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  await pool.query(`
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    ON CONFLICT (email) DO NOTHING
  `, [email, hash]);
  console.log(`Admin ensured: ${email}`);
  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
