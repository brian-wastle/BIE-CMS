import 'dotenv/config';
import { Pool } from 'pg';
import { URL } from 'url';

if (process.env.NODE_ENV === 'production') {
    console.error('DB cannot create new tables in production environment.');
    process.exit(1);
}

const SUPER_URL = process.env.PG_SUPER_URL || 'postgresql://postgres@localhost:5432/postgres';
const u = new URL(process.env.DATABASE_URL!);
const dbName = u.pathname.replace(/^\//, '') || 'postgres';

(async () => {
    const pool = new Pool({ connectionString: SUPER_URL });
    const client = await pool.connect();
    try {
        const query = await client.query(`
        CREATE TABLE media (
            id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            handle        text UNIQUE NOT NULL,
            filename      text NOT NULL,
            mime_type     text NOT NULL,
            size_bytes    integer NOT NULL,
            width         integer,
            height        integer,
            alt_text      text,
            owner_user_id uuid,
            created_at    timestamptz NOT NULL DEFAULT now(),
            is_deleted    boolean NOT NULL DEFAULT false
            );

        `);
        console.log(`Media table created`);
    } finally {
        client.release();
        await pool.end();
    }
})().catch(e => { console.error(e); process.exit(1); });