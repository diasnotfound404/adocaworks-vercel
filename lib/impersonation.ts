/**
 * lib/impersonation.ts
 *
 * Helper to read the impersonation role from localStorage (client) and to expose
 * a single function getImpersonatedRole() that your app can use when deciding UI.
 *
 * Usage (client):
 *   import { getImpersonatedRole } from '@/lib/impersonation';
 *   const role = getImpersonatedRole(); // 'client' | 'freelancer' | null
 *
 * Example integration:
 * - In your auth/session provider (where you derive user role), call getImpersonatedRole()
 *   and if non-null, use it to override the role shown in UI.
 *
 * Notes:
 * - This is a client-only override. Server-side security must still use Supabase/RLS.
 */

export const STORAGE_KEY = "adocaworks_impersonate_role";

export function getImpersonatedRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return null;
    return v;
  } catch (e) {
    return null;
  }
}
