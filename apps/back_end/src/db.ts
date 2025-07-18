import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
});

export const query = (text: string, params?: any[]) =>
  pool.query(text, params);
