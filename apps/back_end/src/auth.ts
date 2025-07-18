import { Router } from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const AUTH_TTL = 1000 * 60 * 60 * 6; // 6 hour token cookie

// Fake DB
const users = new Map<string, string>();
users.set('demo@bie.dev', await argon2.hash('demo'));

router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password)          return res.status(400).json({ error: 'Missing fields' });
  if (users.has(email))             return res.status(409).json({ error: 'User exists' });

  /* 1. store pw hash */
  const hash = await argon2.hash(password);
  users.set(email, hash);

  const token = jwt.sign({ sub: email }, JWT_SECRET, { expiresIn: AUTH_TTL });
  res.cookie('access', token, {
    httpOnly : true,
    sameSite : 'lax',
    maxAge   : AUTH_TTL
  });

  res.sendStatus(201); // New user added/client's request was successful
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const pwHash = users.get(email);
  if (!pwHash || !(await argon2.verify(pwHash, password))) {
    return res.status(401).json({ error: 'Bad credentials' });
  }

  const token = jwt.sign({ sub: email }, JWT_SECRET, { expiresIn: AUTH_TTL });
  res.cookie('access', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: AUTH_TTL * 1000,
  });
  res.sendStatus(204);
});

router.get('/me', (req, res) => {
  try {
    const token = req.cookies['access'];
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    res.json({ email: payload.sub });
  } catch (e) {
    res.status(401).json({ error: 'Unauthenticated' });
  }
});

export default router;
