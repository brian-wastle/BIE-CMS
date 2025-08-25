import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRouter from '../src/auth.js'; // or './auth.js' if JS build

const app = express();

// this will be your public-facing server, so harden it a bit
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false })); // simple default; tune later
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ---- Your API lives here (served directly on this port)
app.use('/api/auth', authRouter);
// Add other API routes here, BEFORE the proxy
app.get('/api/admin/health', (_req, res) => res.json({ ok: true }));

// ---- Everything else → proxy to SSR server (port 4100)
const SSR_TARGET = process.env.SSR_TARGET ?? 'http://127.0.0.1:4100';

app.use(
  '/',
  createProxyMiddleware({
    target: SSR_TARGET,
    changeOrigin: false,   // same-site, keep Host header
    xfwd: true,            // set X-Forwarded-* so SSR can know proto/ip if needed
    // ws: true,            // enable if you ever add websockets
  })
);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Gateway/API listening on http://localhost:${PORT} (proxy → ${SSR_TARGET})`);
});