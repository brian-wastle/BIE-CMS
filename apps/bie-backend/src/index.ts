import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRouter from './auth.js';
import filestackRouter from './filestack.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false })); // TODO: tuning
app.use('/api/media/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);           // Login/Auth
app.use('/api/media', filestackRouter);     // Filestack media & webhooks

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
