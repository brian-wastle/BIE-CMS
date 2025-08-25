import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
app.set('trust proxy', 1); // safe if you later put Nginx/Caddy in front
const angularApp = new AngularNodeAppEngine();

// Optional: keep API same-origin by proxying to your backend (adjust target port)
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:4000', // Express API
  changeOrigin: false,
  xfwd: true,
}));

// Serve static files from /browser
app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

// Server-side guard: never render /author if not logged in
app.use(cookieParser());
const JWT_SECRET = process.env['JWT_SECRET'] || 'dev-only-secret'; // set real secret in prod
app.use('/author', (req, res, next) => {
  const token = req.cookies?.['access_token'];
  if (!token) return res.redirect(302, '/login');
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.redirect(302, '/login');
  }
});

// Handle all other requests by rendering the Angular application.
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// Start the server if this module is the main entry point.
if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] || 4100);
  app.listen(port, () => {
    console.log(`SSR server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
