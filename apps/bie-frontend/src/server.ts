import 'dotenv/config';
import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
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

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

const API_TARGET = process.env['API_TARGET'] ?? 'http://localhost:4000';
const REFRESH_COOKIE_NAME = 'refresh_token';

type HeadersWithGetSetCookie = Headers & { getSetCookie?: () => string[] };

function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as HeadersWithGetSetCookie;
  if (typeof headers.getSetCookie === 'function') {
    return headers.getSetCookie();
  }
  const single = headers.get('set-cookie');
  return single ? [single] : [];
}

function forwardSetCookies(response: Response, res: express.Response): string[] {
  const cookies = getSetCookieHeaders(response);
  for (const cookie of cookies) {
    res.append('set-cookie', cookie);
  }
  return cookies;
}

function parseCookieHeader(header?: string) {
  const jar: Record<string, string> = {};
  if (!header) {
    return jar;
  }
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const name = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    if (name) {
      jar[name] = value;
    }
  }
  return jar;
}

function serializeCookieJar(jar: Record<string, string>) {
  return Object.entries(jar)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}

function mergeCookieHeader(existing: string | undefined, setCookieHeaders: string[]) {
  const jar = parseCookieHeader(existing);
  for (const header of setCookieHeaders) {
    const [pair] = header.split(';');
    if (!pair) {
      continue;
    }
    const idx = pair.indexOf('=');
    if (idx === -1) {
      continue;
    }
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (name) {
      jar[name] = value;
    }
  }
  return serializeCookieJar(jar);
}

function hasRefreshCookie(cookieHeader: string) {
  if (!cookieHeader) {
    return false;
  }
  return cookieHeader.split(';').some((part) => part.trim().startsWith(`${REFRESH_COOKIE_NAME}=`));
}

function buildCookieHeader(cookieHeader: string): HeadersInit | undefined {
  return cookieHeader ? { cookie: cookieHeader } : undefined;
}

const protectedPaths = ['/author', '/upload', '/drafts'];
app.use(protectedPaths, async (req, res, next) => {
  let cookieHeader = typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
  try {
    const meResponse = await fetch(`${API_TARGET}/api/auth/me`, {
      headers: buildCookieHeader(cookieHeader)
    });
    if (meResponse.ok) {
      forwardSetCookies(meResponse, res);
      return next();
    }

    if (meResponse.status === 401 && hasRefreshCookie(cookieHeader)) {
      const refreshResponse = await fetch(`${API_TARGET}/api/auth/refresh`, {
        method: 'POST',
        headers: buildCookieHeader(cookieHeader)
      });
      if (refreshResponse.ok) {
        const refreshCookies = forwardSetCookies(refreshResponse, res);
        if (refreshCookies.length) {
          cookieHeader = mergeCookieHeader(cookieHeader, refreshCookies);
        }
        const retryResponse = await fetch(`${API_TARGET}/api/auth/me`, {
          headers: buildCookieHeader(cookieHeader)
        });
        if (retryResponse.ok) {
          forwardSetCookies(retryResponse, res);
          return next();
        }
      }
    }
  } catch (err) {
    console.error('SSR auth check failed', err);
  }
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
