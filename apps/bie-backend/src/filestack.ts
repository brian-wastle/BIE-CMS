import crypto from 'crypto';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// --- Config ---
const API_KEY      = process.env.FILESTACK_API_KEY!;
const APP_SECRET   = process.env.FILESTACK_APP_SECRET!;
const WEBHOOK_SEC  = process.env.FILESTACK_WEBHOOK_SECRET || APP_SECRET;
const EXPIRY_SEC   = Number(process.env.FILESTACK_POLICY_EXPIRY_SEC || 900);

// Utility: base64(json) without padding differences
function b64(json: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(json)).toString('base64');
}

// HMAC-SHA256
function sign(policyB64: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(policyB64).digest('hex');
}

/**
 * 1) Issue short-lived policy+signature for the browser SDK.
 *    Never expose APP_SECRET to the client; only return policy+signature.
 */
router.get('/policy', (_req: Request, res: Response) => {
  const expiryEpoch = Math.floor(Date.now() / 1000) + EXPIRY_SEC;

  // Restrict as tightly as you can for your use case.
  // Allowed "call" ops: pick, store, read, convert, remove, write, etc.
  const policy = {
    expiry: expiryEpoch,
    call: ['pick', 'store', 'read'],
    // Optional: restrict mimetypes and size
    // handle: '*', // omit to allow new stores
    // maxSize: 25_000_000, // 25 MB
    // mimetypes: ['image/*','video/*']
  };

  const policyB64 = b64(policy);
  const signature = sign(policyB64, APP_SECRET);

  res.json({
    apiKey: API_KEY,
    policy: policyB64,
    signature,
    expiresAt: expiryEpoch,
  });
});

/**
 * 2) Webhook receiver (e.g. "upload.complete").
 *    Set this URL in Filestack dev portal.
 *    Verifies HMAC header and returns 204 quickly.
 */
router.post('/webhook', express.raw({ type: '*/*' }), (req: Request, res: Response) => {
  // Filestack sends `Filestack-Signature: sha256=<hex>`
  const sigHeader = req.get('Filestack-Signature') || '';
  const [, hexFromHeader] = sigHeader.split('sha256=');

  const computed = crypto
    .createHmac('sha256', WEBHOOK_SEC)
    .update(req.body) // raw body
    .digest('hex');

  if (!hexFromHeader || !crypto.timingSafeEqual(Buffer.from(hexFromHeader), Buffer.from(computed))) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  try {
    const evt = JSON.parse(req.body.toString());
    // Example: persist to DB
    // evt.data contains handle, size, filename, mimetype, url, etc.
    // await db.media.insert({ handle: evt.data.handle, ... })
    // Tip: do side work async / fire-and-forget queue.
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  // Respond fast; Filestack expects 2xx.
  return res.status(204).end();
});

/**
 * 3) Proxy metadata (optional).
 *    Frontend can just call CDN `https://cdn.filestackcontent.com/metadata/<handle>`,
 *    but proxying lets you enforce auth.
 */
router.get('/metadata/:handle', async (req: Request, res: Response) => {
  const { handle } = req.params;

  // If your files require security, include policy/signature here as query params.
  const url = `https://cdn.filestackcontent.com/metadata/${encodeURIComponent(handle)}`;

  const r = await fetch(url);
  if (!r.ok) return res.status(r.status).send(await r.text());
  const json = await r.json();
  res.json(json);
});

/**
 * 4) Delete by handle (server-side, auth-gated).
 *    Requires policy with 'remove' and a valid signature.
 */
router.delete('/:handle', express.json(), async (req: Request, res: Response) => {
  // TODO: check your session/roles before allowing deletes
  const { handle } = req.params;

  const policy = {
    expiry: Math.floor(Date.now() / 1000) + 60, // 60s for one delete
    call: ['remove'],
    handle: handle,
  };
  const policyB64 = b64(policy);
  const signature = sign(policyB64, APP_SECRET);

  const resp = await fetch(`https://www.filestackapi.com/api/file/${handle}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Filestack-Api-Key': API_KEY,
      'Filestack-Security': JSON.stringify({ policy: policyB64, signature }),
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    return res.status(resp.status).send(text);
    }
  return res.status(204).end();
});

export default router;
