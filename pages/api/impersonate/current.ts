import type { NextApiRequest, NextApiResponse } from 'next';
import { parseImpersonationCookie } from '../../../lib/serverImpersonation';

/**
 * GET /api/impersonate/current
 * Returns current impersonation if present (server reads cookie and returns JSON).
 */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const imp = parseImpersonationCookie(req as any);
  if (!imp) return res.status(200).json({ ok: true, impersonation: null });
  // Optional: validate expiration
  if (imp.expiresAt && Date.now() > imp.expiresAt) {
    return res.status(200).json({ ok: true, impersonation: null });
  }
  return res.status(200).json({ ok: true, impersonation: { userId: imp.userId, role: imp.role } });
}
