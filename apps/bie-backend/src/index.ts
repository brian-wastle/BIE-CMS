import 'dotenv/config';
import express from 'express';
import helmet, { type HelmetOptions } from 'helmet';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRouter from './auth.js';
import filestackRouter from './filestack.js';
import pagesRouter from './pages.js';
import { query } from './db.js';

const normalizeOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
};

const isProduction = process.env.NODE_ENV === 'production';
const filestackCdnOrigin = normalizeOrigin(process.env.FILESTACK_CDN_BASE ?? 'https://cdn.filestackcontent.com');
const filestackScriptOrigin = normalizeOrigin(process.env.FILESTACK_SCRIPT_SRC ?? 'https://static.filestackapi.com');
const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: isProduction
    ? {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "base-uri": ["'self'"],
          "form-action": ["'self'"],
          "frame-ancestors": ["'self'"],
          "frame-src": ["'self'"],
          "object-src": ["'none'"],
          "script-src": ["'self'", filestackScriptOrigin],
          "style-src": ["'self'", 'https://fonts.googleapis.com'],
          "font-src": ["'self'", 'https://fonts.gstatic.com', 'data:'],
          "img-src": ["'self'", 'data:', 'blob:', filestackCdnOrigin],
          "media-src": ["'self'", 'blob:', filestackCdnOrigin],
          "connect-src": ["'self'", filestackCdnOrigin, filestackScriptOrigin, 'https://www.filestackapi.com'],
          "upgrade-insecure-requests": [],
        },
      }
    : false,
};

const app = express();
app.set('trust proxy', 1);
app.use(helmet(helmetOptions));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/healthz', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch (error) {
    console.error('Healthcheck failed', error);
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

// API Routes
app.use('/api/auth', authRouter);           // Login/Auth
app.use('/api/media', filestackRouter);     // Filestack media
app.use('/api/pages', pagesRouter);         // Pages API

// SSR Proxy
const SSR_TARGET = process.env.SSR_TARGET ?? 'http://127.0.0.1:4100';

app.use(
  '/',
  createProxyMiddleware({
    target: SSR_TARGET,
    changeOrigin: false,
    xfwd: true,
  })
);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`Gateway/API listening on http://localhost:${PORT} (proxy -> ${SSR_TARGET})`);
});
