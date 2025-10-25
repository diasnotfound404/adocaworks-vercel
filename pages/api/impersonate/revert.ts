import type { NextApiRequest, NextApiResponse } from 'next';
import { cookieName } from '../../../lib/serverImpersonation';

/**
 * POST /api/impersonate/revert
 * Clears the impersonation cookie
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const cookieNameV = cookieName();
  res.setHeader('Set-Cookie', `${cookieNameV}=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`);
  return res.status(200).json({ ok: true, message: 'Impersonation cleared' });
}
