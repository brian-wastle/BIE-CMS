import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authRouter from '../src/auth.js'; // or './auth.js' if JS build

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false })); // simple default; tune later
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRouter);

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
  console.log(`Gateway/API listening on http://localhost:${PORT} (proxy → ${SSR_TARGET})`);
});