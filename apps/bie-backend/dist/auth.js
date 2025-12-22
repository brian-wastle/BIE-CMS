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
const JWT_SECRET = process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
};
function signAccessToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: `${ACCESS_TTL_MIN}m`,
    });
}
function newRefreshTokenSecret() {
    return crypto.randomBytes(32).toString('hex');
}
function formatRefreshCookieValue(id, secret) {
    return `v2.${id}.${secret}`;
}
function parseRefreshCookie(raw) {
    if (typeof raw !== 'string' || !raw.startsWith('v2.')) {
        return null;
    }
    const parts = raw.split('.');
    if (parts.length !== 3) {
        return null;
    }
    const [, tokenId, secret] = parts;
    if (!tokenId || !secret) {
        return null;
    }
    return { tokenId, secret };
}
// NOTE: hash with argon2id explicitly (good defaults; tune later if needed)
async function hashPassword(plain) {
    return argon2.hash(plain, { type: argon2.argon2id });
}
async function verifyPassword(plain, hash) {
    return argon2.verify(hash, plain);
}
async function issueRefreshToken(userId) {
    const secret = newRefreshTokenSecret();
    const hash = await argon2.hash(secret, { type: argon2.argon2id });
    const res = await pool.query(`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' days')::interval)
     RETURNING id, expires_at`, [userId, hash, REFRESH_TTL_DAYS]);
    const row = res.rows[0];
    return {
        id: row.id,
        cookieValue: formatRefreshCookieValue(row.id, secret),
        expiresAt: row.expires_at,
    };
}
async function loadRefreshTokenRow(tokenId, opts = {}) {
    const where = ['id = $1'];
    if (!opts.includeRevoked) {
        where.push('revoked_at IS NULL');
    }
    if (!opts.includeExpired) {
        where.push('expires_at > now()');
    }
    const { rows } = await pool.query(`SELECT * FROM refresh_tokens WHERE ${where.join(' AND ')} LIMIT 1`, [tokenId]);
    return rows[0] ?? null;
}
async function findValidLegacyRefresh(userId, token) {
    const { rows } = await pool.query(`SELECT * FROM refresh_tokens
     WHERE user_id=$1 AND revoked_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC`, [userId]);
    for (const row of rows) {
        const ok = await argon2.verify(row.token_hash, token);
        if (ok)
            return row;
    }
    return null;
}
async function rotateRefreshToken(oldRow) {
    const next = await issueRefreshToken(oldRow.user_id);
    await pool.query(`UPDATE refresh_tokens SET revoked_at=now(), replaced_by=$1 WHERE id=$2`, [next.id, oldRow.id]);
    return next;
}
async function revokeRefreshToken(tokenId) {
    await pool.query(`UPDATE refresh_tokens SET revoked_at=now() WHERE id=$1`, [tokenId]);
}
router.use(cookieParser());
// Register (argon2id)
router.post('/register', async (req, res) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const { email, password } = parse.data;
    const hash = await hashPassword(password);
    try {
        const r = await pool.query(`INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`, [email, hash]);
        res.status(201).json({ id: r.rows[0].id, email: r.rows[0].email });
    }
    catch (e) {
        const msg = /duplicate key/.test(e.message) ? 'Email already in use' : 'Error';
        res.status(400).json({ error: msg });
    }
});
// Login (argon2 verify)
router.post('/login', async (req, res) => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid payload' });
    const { email, password } = parse.data;
    const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    const user = rows[0];
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const access = signAccessToken({ id: user.id, email: user.email });
    const refresh = await issueRefreshToken(user.id);
    res
        .cookie('access_token', access, { ...cookieOpts, maxAge: ACCESS_TTL_MIN * 60 * 1000 })
        .cookie('refresh_token', refresh.cookieValue, { ...cookieOpts, maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000 })
        .json({ ok: true });
});
// Refresh + Logout unchanged (already argon2 for token hashes)
router.post('/refresh', async (req, res) => {
    const refreshCookie = req.cookies['refresh_token'];
    if (!refreshCookie) {
        return res.status(401).json({ error: 'No refresh token' });
    }
    const parsed = parseRefreshCookie(refreshCookie);
    let tokenRow = null;
    if (parsed) {
        tokenRow = await loadRefreshTokenRow(parsed.tokenId);
        if (!tokenRow) {
            return res.status(401).json({ error: 'Invalid refresh' });
        }
        const matches = await argon2.verify(tokenRow.token_hash, parsed.secret);
        if (!matches) {
            await revokeRefreshToken(tokenRow.id);
            return res.status(401).json({ error: 'Invalid refresh' });
        }
    }
    else {
        const accessMaybe = req.cookies['access_token'];
        let userId = null;
        if (accessMaybe) {
            try {
                userId = jwt.decode(accessMaybe)?.sub ?? null;
            }
            catch {
                userId = null;
            }
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unknown session' });
        }
        tokenRow = await findValidLegacyRefresh(userId, refreshCookie);
        if (!tokenRow) {
            return res.status(401).json({ error: 'Invalid refresh' });
        }
    }
    if (!tokenRow) {
        return res.status(401).json({ error: 'Invalid refresh' });
    }
    const userId = tokenRow.user_id;
    const nextRefresh = await rotateRefreshToken(tokenRow);
    const { rows: urows } = await pool.query(`SELECT id, email FROM users WHERE id=$1`, [userId]);
    const user = urows[0];
    if (!user) {
        return res.status(401).json({ error: 'Unknown user' });
    }
    const newAccess = signAccessToken({ id: user.id, email: user.email });
    res
        .cookie('access_token', newAccess, { ...cookieOpts, maxAge: ACCESS_TTL_MIN * 60 * 1000 })
        .cookie('refresh_token', nextRefresh.cookieValue, { ...cookieOpts, maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000 })
        .json({ ok: true });
});
router.post('/logout', async (req, res) => {
    const refresh = req.cookies['refresh_token'];
    if (refresh) {
        const parsed = parseRefreshCookie(refresh);
        if (parsed) {
            const row = await loadRefreshTokenRow(parsed.tokenId, { includeExpired: true });
            if (row) {
                const matches = await argon2.verify(row.token_hash, parsed.secret);
                if (matches) {
                    await revokeRefreshToken(row.id);
                }
            }
        }
        else {
            const accessMaybe = req.cookies['access_token'];
            let userId = null;
            if (accessMaybe) {
                try {
                    userId = jwt.decode(accessMaybe)?.sub ?? null;
                }
                catch {
                    userId = null;
                }
            }
            if (userId) {
                const row = await findValidLegacyRefresh(userId, refresh);
                if (row) {
                    await revokeRefreshToken(row.id);
                }
            }
        }
    }
    res
        .clearCookie('access_token', { path: '/' })
        .clearCookie('refresh_token', { path: '/' })
        .json({ ok: true });
});
export function requireAccess(req, res, next) {
    const token = req.cookies['access_token'];
    if (!token)
        return res.status(401).json({ error: 'No token' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.sub, email: payload.email };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid/expired token' });
    }
}
router.get('/me', requireAccess, async (req, res) => {
    try {
        const { user } = req;
        const { rows } = await pool.query(`SELECT id, email, username, first_name, last_name, display_name FROM user_public WHERE id=$1`, [user.id]);
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
    }
    catch (error) {
        console.error('Failed to load user profile', error);
        return res.status(500).json({ error: 'Failed to load user profile' });
    }
});
export default router;
