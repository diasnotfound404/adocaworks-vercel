import type { NextApiRequest, NextApiResponse } from 'next';
import { encryptPayload, cookieName } from '../../lib/serverImpersonation';

/**
 * POST /api/impersonate
 * Body: { targetUserId: string, targetRole: string }
 *
 * Protection:
 * - Option A (recommended): Set env IMPERSONATION_ADMIN_SECRET (random string). The request
 *   must include header 'x-impersonation-secret' with that value.
 * - Option B: Implement server-side check by validating the calling user's session is an admin
 *   (not implemented here because Supabase specifics vary). See README.
 *
 * Response:
 * - sets HttpOnly cookie with encrypted payload { userId, role, issuedAt, expiresAt }
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' });

  // Simple protection via admin secret
  const secret = process.env.IMPERSONATION_ADMIN_SECRET;
  const header = req.headers['x-impersonation-secret'] as string | undefined;
  if (!secret || header !== secret) {
    return res.status(403).json({ ok: false, message: 'Missing or invalid admin secret. See README.' });
  }

  const { targetUserId, targetRole } = req.body ?? {};
  if (!targetUserId) return res.status(400).json({ ok: false, message: 'targetUserId required' });

  const now = Date.now();
  const expiresMs = 1000 * 60 * 60; // 1 hour
  const payload = {
    userId: String(targetUserId),
    role: String(targetRole ?? 'client'),
    issuedAt: now,
    expiresAt: now + expiresMs
  };

  const token = encryptPayload(payload);
  const cookieNameV = cookieName();

  // Set cookie
  res.setHeader('Set-Cookie', [
    `${cookieNameV}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${Math.floor(expiresMs/1000)}; SameSite=Lax; Secure`
  ]);
  return res.status(200).json({ ok: true, message: 'Impersonation started', payload: { userId: payload.userId, role: payload.role } });
}
