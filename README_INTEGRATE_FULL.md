# aDocaWorks — Full Impersonation Package (server + client)
## What this provides
This package implements a secure-ish server-side impersonation flow suitable for staging and controlled environments, plus a client UI:
- `components/AccountSwitcher.tsx` — UI to request/start/revert impersonation (supports dev localStorage and server mode).
- `lib/impersonation.ts` — client helpers (fallbacks and server current endpoint).
- `lib/serverImpersonation.ts` — server helpers to encrypt/decrypt HttpOnly cookie payload.
- `pages/api/impersonate` — POST endpoint to start impersonation (sets HttpOnly encrypted cookie).
- `pages/api/impersonate/revert` — POST endpoint to clear impersonation cookie.
- `pages/api/impersonate/current` — GET endpoint to read current impersonation (used by client).
- `types/impersonation.d.ts` — example types.

## How it works (high level)
1. Admin uses the AccountSwitcher (server mode) or an admin panel to POST `/api/impersonate` with `{ targetUserId, targetRole }`
2. Server validates the caller (via `IMPERSONATION_ADMIN_SECRET` header OR you can implement a Supabase admin check).
3. Server encrypts `{ userId, role, issuedAt, expiresAt }` and writes it into an HttpOnly cookie.
4. Server and client can read `/api/impersonate/current` to know active impersonation.
5. Reverting clears the cookie.

## Env vars you MUST set on Vercel
- `IMPERSONATION_ADMIN_SECRET` — a strong random string. The front-end dev UI will include this via the `x-impersonation-secret` header (for convenience).
  - IMPORTANT: Don't hardcode it in client code. You can call the API from server-side admin panel (server-rendered form) so the secret isn't exposed.
- `IMPERSONATION_COOKIE_SECRET` — base64 32-byte key. You can generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- (optional) `IMPERSONATION_COOKIE_NAME` — default `aw_impersonation`
- (optional) `NEXT_PUBLIC_IMPERSONATION_MODE` — set to `server` to default the client UI to server mode

## Security notes & integration checklist (READ NOW)
- This flow **does not** change your Supabase auth session. It only tells *your server and UI* to behave as if acting on behalf of another user. You MUST:
  - On **every** sensitive server-side action (payments, changing account data, payouts, invoices, etc) verify the actual authenticated user and apply RLS rules. If impersonation should allow real server calls as the impersonated user, implement a safe token swap using Supabase's secure admin APIs and audit trails.
  - Log every impersonation start/revert with admin user id, timestamp, target user id and reason.
  - Limit who can call `/api/impersonate` — prefer server-to-server calls or protect with short-lived admin sessions.
  - Rotate `IMPERSONATION_COOKIE_SECRET` periodically.
- If you want *real* impersonation at the Supabase level (i.e., server returns a short-lived access token for the impersonated user), I can generate that flow too — it requires:
  - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel
  - Implementing server-side call to Supabase Admin to create a custom token / session for the target user
  - Proper auditing and RLS adjustments

## How to integrate quickly
1. Copy the files into your repo (components/, lib/, pages/api/...).
2. Add `AccountSwitcher` to `pages/_app.tsx` or `app/layout.tsx`:
```tsx
import AccountSwitcher from '@/components/AccountSwitcher';
function MyApp({ Component, pageProps }) {
  return <>
    <Component {...pageProps} />
    <AccountSwitcher />
  </>;
}
export default MyApp;
```
3. Set env vars on Vercel (IMPERSONATION_ADMIN_SECRET, IMPERSONATION_COOKIE_SECRET).
4. Use an admin-only server page to call `/api/impersonate` with header `x-impersonation-secret: <IMPERSONATION_ADMIN_SECRET>` (do NOT call it directly from client code that exposes the secret).
   - For quick testing only: you can call it from the AccountSwitcher in server mode if you temporarily set the secret in client env — **DO NOT** do this in production.

## Example: making server code respect impersonation
In any API route where you want to respect impersonation:
```ts
import { parseImpersonationCookie } from '@/lib/serverImpersonation';
export default function handler(req, res) {
  const impersonation = parseImpersonationCookie(req as any);
  if (impersonation) {
    // Use impersonation.userId and impersonation.role for UI-level rendering
    // But ALWAYS verify the real authenticated user separately.
  }
}
```

## Need me to implement the full Supabase token-swap flow?
Say the word and I'll create another ZIP that:
- Uses SUPABASE_SERVICE_ROLE_KEY to call Supabase Admin and generate a short-lived token for the target user
- Logs audit entries to a `impersonation_audit` table
- Implements automatic login switch (sign out current and sign in as target) with safety checks
