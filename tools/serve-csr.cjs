// Minimal static file server for the built browser bundle.
// Serves dist/bie-frontend/browser/browser on PORT/CSR_PORT (default 4200).

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');

const csrRoot = path.resolve(__dirname, '../dist/bie-frontend/browser/browser');
const fallbackFile = path.join(csrRoot, 'index.csr.html');
const port = Number(process.env.CSR_PORT || process.env.PORT || 4200);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

async function pathExists(target) {
  try {
    const stats = await fs.stat(target);
    return stats;
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

async function respondWithFile(filePath, res, { allowSpaFallback } = {}) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream'
    };
    if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    }
    res.writeHead(200, headers);
    res.end(data);
  } catch (err) {
    if (err && err.code === 'ENOENT' && allowSpaFallback) {
      return respondWithFallback(res);
    }
    console.error('CSR server failed to read file', filePath, err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
}

async function respondWithFallback(res) {
  try {
    const data = await fs.readFile(fallbackFile);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch (err) {
    console.error('CSR fallback missing', fallbackFile, err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('CSR build missing. Run npm run build:front first.');
  }
}

async function handleRequest(req, res) {
  const { url = '/' } = req;
  const host = req.headers.host || 'localhost';
  let pathname;
  try {
    const requestUrl = new URL(url, `http://${host}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    pathname = '/';
  }

  if (pathname === '/' || pathname === '') {
    return respondWithFallback(res);
  }

  let safePath = path.normalize(pathname);
  if (safePath.startsWith('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let target = path.join(csrRoot, safePath);
  if (!target.startsWith(csrRoot)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const stats = await pathExists(target);
  if (stats && stats.isDirectory()) {
    target = path.join(target, 'index.html');
  }

  if (!stats || (stats && stats.isDirectory())) {
    return respondWithFile(target, res, { allowSpaFallback: true });
  }

  return respondWithFile(target, res, { allowSpaFallback: true });
}

async function ensureBuild() {
  const rootStats = await pathExists(csrRoot);
  if (!rootStats) {
    console.error(`CSR bundle not found at ${csrRoot}. Run "npm run build:front" first.`);
    process.exit(1);
  }
  const fallbackExists = await pathExists(fallbackFile);
  if (!fallbackExists) {
    console.error(`Fallback file missing at ${fallbackFile}. Rebuild the frontend app.`);
    process.exit(1);
  }
}

async function start() {
  await ensureBuild();
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error('CSR server request error', err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
    });
  });

  server.listen(port, () => {
    console.log(`CSR bundle server listening on http://localhost:${port}`);
    console.log(`Serving static files from ${csrRoot}`);
  });
}

start().catch((err) => {
  console.error('Failed to start CSR server', err);
  process.exit(1);
});
