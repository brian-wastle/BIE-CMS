import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import cookieParser from 'cookie-parser';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((_req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

// SSR auth gate
app.use(cookieParser());

const API_TARGET = process.env['API_TARGET'] ?? 'http://localhost:4000';

const protectedPaths = ['/author', '/gate']; // TODO: Switch in prod
app.use(protectedPaths, async (req, res, next) => {
  try {
    const r = await fetch(`${API_TARGET}/api/auth/me`, {
      headers: { cookie: req.headers.cookie || '' }
    });
    if (r.ok) return next();
  } catch { }
  return res.redirect(302, '/login');
});

const angularApp = new AngularNodeAppEngine();
app.all('*', (req, res, next) => {
  angularApp.handle(req)
    .then((response) => response ? writeResponseToNodeResponse(response, res) : next())
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] || 4100);
  app.listen(port, () => {
    console.log(`SSR listening on http://localhost:${port}`);
  });
}

// For Angular CLI/dev tooling:
export const reqHandler = createNodeRequestHandler(app);
