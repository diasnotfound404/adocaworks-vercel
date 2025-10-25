/**
 * Client helper to read local dev impersonation (localStorage) and to expose a
 * unified function getActiveRole().
 *
 * Priority:
 * - If server has set an HttpOnly impersonation cookie, the server should
 *   inject the value into pageProps or a dedicated endpoint `/api/impersonation/current`.
 * - Otherwise fallback to client localStorage dev-mode.
 */

export const STORAGE_KEY = "adocaworks_impersonate_role";

export function getLocalImpersonation(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

/**
 * Example: fetch server-side current impersonation (if your server exposes it).
 * If you implement pages/api/impersonate/current, call it here.
 */
export async function getServerImpersonation(): Promise<{ userId?: string | null; role?: string | null } | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch('/api/impersonate/current');
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getActiveImpersonation(): Promise<{ userId?: string | null; role?: string | null }> {
  const server = await getServerImpersonation();
  if (server) return server;
  const local = getLocalImpersonation();
  return { userId: null, role: local };
}
