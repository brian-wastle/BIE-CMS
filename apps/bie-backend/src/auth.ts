import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import crypto from 'crypto';
import { Pool } from 'pg';
import { z } from 'zod';

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const ACCESS_TTL_MIN = parseInt(process.env.ACCESS_TOKEN_TTL_MIN || '15', 10);
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '30', 10);
const JWT_SECRET = process.env.JWT_SECRET!;

const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = {
  httpOnly: true as const,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
};

function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: `${ACCESS_TTL_MIN}m`,
  });
}

function newRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

// NOTE: hash with argon2id explicitly (good defaults; tune later if needed)
async function hashPassword(plain: string) {
  return argon2.hash(plain, { type: argon2.argon2id });
}
async function verifyPassword(plain: string, hash: string) {
  return argon2.verify(hash, plain);
}

async function storeRefreshToken(userId: string, token: string) {
  const hash = await argon2.hash(token, { type: argon2.argon2id });
  const res = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)
     RETURNING id, expires_at`,
    [userId, hash, REFRESH_TTL_DAYS]
  );
  return { id: res.rows[0].id as string, expiresAt: res.rows[0].expires_at as string };
}

async function findValidRefresh(userId: string, token: string) {
  const { rows } = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE user_id=$1 AND revoked_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC`,
    [userId]
  );
  for (const row of rows) {
    const ok = await argon2.verify(row.token_hash, token);
    if (ok) return row;
  }
  return null;
}

async function rotateRefreshToken(oldRow: any, userId: string) {
  const token = newRefreshToken();
  const { id: newId } = await storeRefreshToken(userId, token);
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at=now(), replaced_by=$1 WHERE id=$2`,
    [newId, oldRow.id]
  );
  return { token, id: newId };
}

router.use(cookieParser());

// Register (argon2id)
router.post('/register', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parse.data;
  const hash = await hashPassword(password);
  try {
    const r = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`,
      [email, hash]
    );
    res.status(201).json({ id: r.rows[0].id, email: r.rows[0].email });
  } catch (e: any) {
    const msg = /duplicate key/.test(e.message) ? 'Email already in use' : 'Error';
    res.status(400).json({ error: msg });
  }
});

// Login (argon2 verify)
router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid payload' });

  const { email, password } = parse.data;
  const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const access = signAccessToken({ id: user.id, email: user.email });
  const refresh = newRefreshToken();
  await storeRefreshToken(user.id, refresh);

  res
    .cookie('access_token', access, { ...cookieOpts, maxAge: ACCESS_TTL_MIN * 60 * 1000 })
    .cookie('refresh_token', refresh, { ...cookieOpts, maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000 })
    .json({ ok: true });
});

// Refresh + Logout unchanged (already argon2 for token hashes)
router.post('/refresh', async (req, res) => {
  const refresh = req.cookies['refresh_token'];
  if (!refresh) return res.status(401).json({ error: 'No refresh token' });

  const accessMaybe = req.cookies['access_token'];
  let userId: string | null = null;
  if (accessMaybe) { try { userId = (jwt.decode(accessMaybe) as any)?.sub ?? null; } catch {} }
  if (!userId) return res.status(401).json({ error: 'Unknown session' });

  const row = await findValidRefresh(userId, refresh);
  if (!row) return res.status(401).json({ error: 'Invalid refresh' });

  const { token: newRefresh } = await rotateRefreshToken(row, userId);

  const { rows: urows } = await pool.query(`SELECT id, email FROM users WHERE id=$1`, [userId]);
  const user = urows[0];
  const newAccess = signAccessToken({ id: user.id, email: user.email });

  res
    .cookie('access_token', newAccess, { ...cookieOpts, maxAge: ACCESS_TTL_MIN * 60 * 1000 })
    .cookie('refresh_token', newRefresh, { ...cookieOpts, maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000 })
    .json({ ok: true });
});

router.post('/logout', async (req, res) => {
  const refresh = req.cookies['refresh_token'];
  if (refresh) {
    const accessMaybe = req.cookies['access_token'];
    let userId: string | null = null;
    if (accessMaybe) { try { userId = (jwt.decode(accessMaybe) as any)?.sub ?? null; } catch {} }
    if (userId) {
      const row = await findValidRefresh(userId, refresh);
      if (row) await pool.query(`UPDATE refresh_tokens SET revoked_at=now() WHERE id=$1`, [row.id]);
    }
  }
  res.clearCookie('access_token', { path: '/' })
     .clearCookie('refresh_token', { path: '/' })
     .json({ ok: true });
});

export function requireAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.cookies['access_token'];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

router.get('/me', requireAccess, async (req, res) => {
  try {
    const { user } = req as any;
    const { rows } = await pool.query(
      `SELECT id, email, username, first_name, last_name, display_name FROM user_public WHERE id=$1`,
      [user.id]
    );
    const row = rows[0];
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        id: row.id,
        email: row.email,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        displayName: row.display_name,
      },
    });
  } catch (error) {
    console.error('Failed to load user profile', error);
    return res.status(500).json({ error: 'Failed to load user profile' });
  }
});

export default router;







