/**
 * Server-side impersonation helpers
 *
 * - Uses symmetric encryption (AES-256-GCM) to encrypt an impersonation payload
 *   that is stored inside an HttpOnly cookie.
 * - Requires env vars:
 *    - IMPERSONATION_COOKIE_SECRET (32 bytes base64)  <-- important
 *    - IMPERSONATION_COOKIE_NAME (optional, default: 'aw_impersonation')
 *
 * Security notes:
 * - The cookie is only as secure as your secret; rotate regularly.
 * - Server must still verify every sensitive action against the real authenticated user.
 */

import crypto from 'crypto';
import { NextApiRequest } from 'next';

const COOKIE_NAME = process.env.IMPERSONATION_COOKIE_NAME ?? 'aw_impersonation';
const SECRET_B64 = process.env.IMPERSONATION_COOKIE_SECRET ?? '';

function getKey(): Buffer {
  if (!SECRET_B64) throw new Error('IMPERSONATION_COOKIE_SECRET not set');
  const key = Buffer.from(SECRET_B64, 'base64');
  if (key.length !== 32) throw new Error('IMPERSONATION_COOKIE_SECRET must be 32 bytes base64');
  return key;
}

export function encryptPayload(payload: object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const text = JSON.stringify(payload);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptPayload(token: string): any | null {
  try {
    const b = Buffer.from(token, 'base64');
    const iv = b.slice(0, 12);
    const tag = b.slice(12, 28);
    const enc = b.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    const out = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(out.toString('utf8'));
  } catch (e) {
    return null;
  }
}

export function parseImpersonationCookie(req: NextApiRequest): any | null {
  const raw = req.cookies[COOKIE_NAME] ?? req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE_NAME+'='))?.split('=')[1];
  if (!raw) return null;
  return decryptPayload(decodeURIComponent(raw));
}

export function cookieName() { return COOKIE_NAME; }
