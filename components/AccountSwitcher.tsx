import React, { useEffect, useState } from 'react';

/**
 * AccountSwitcher (Full)
 *
 * Supports two modes:
 * 1) DEV local mode: toggles localStorage (fast, client-only)
 * 2) SERVER mode: calls /api/impersonate to request server-side impersonation (HttpOnly cookie)
 *
 * To enable server mode set NEXT_PUBLIC_IMPERSONATION_MODE = "server" in your Vercel env.
 *
 * Requirements for server mode:
 * - An admin must call this endpoint (server validates using IMPERSONATION_ADMIN_SECRET or admin check)
 * - Server sets an HttpOnly encrypted cookie that backend code can read and respect
 *
 * Security: this component is a convenience UI. Server must still enforce permissions.
 */

const STORAGE_KEY = "adocaworks_impersonate_role";

async function callServerImpersonate(action: 'start'|'revert', payload?: any) {
  const url = action === 'start' ? '/api/impersonate' : '/api/impersonate/revert';
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return resp.json().catch(() => ({}));
}

export default function AccountSwitcher() {
  const [mode, setMode] = useState<'dev'|'server'>('dev');
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const env = typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_IMPERSONATION_MODE : undefined;
    if (env === 'server') setMode('server');
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    setRole(saved);
  }, []);

  const devSwitch = (r: string | null) => {
    if (typeof window === "undefined") return;
    if (r === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, r);
    window.location.reload();
  };

  const serverStart = async () => {
    setStatus('loading');
    if (!userId) { setStatus('missing user id'); return; }
    // payload can include targetRole and targetUserId
    const payload = { targetUserId: userId, targetRole: role || 'client' };
    const res = await callServerImpersonate('start', payload);
    setStatus(res?.message ?? 'done');
    if (res?.ok) window.location.reload();
  };

  const serverRevert = async () => {
    setStatus('loading');
    const res = await callServerImpersonate('revert');
    setStatus(res?.message ?? 'done');
    if (res?.ok) window.location.reload();
  };

  return (
    <div style={{
      position: "fixed",
      right: 16,
      bottom: 16,
      zIndex: 9999,
      background: "white",
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      minWidth: 220,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong>Impersonation</strong>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ marginBottom: 6 }}>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} style={{ marginLeft: 8 }}>
            <option value="dev">dev (local)</option>
            <option value="server">server (http-only cookie)</option>
          </select>
        </div>

        {mode === 'dev' ? (
          <div>
            <div style={{ marginBottom: 6 }}>Current: <em>{role ?? 'real user'}</em></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => devSwitch('client')}>Client</button>
              <button onClick={() => devSwitch('freelancer')}>Freelancer</button>
              <button onClick={() => devSwitch(null)}>Reset</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 6 }}>
              Target role:
              <select value={role ?? 'client'} onChange={(e) => setRole(e.target.value)} style={{ marginLeft: 8 }}>
                <option value="client">client</option>
                <option value="freelancer">freelancer</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div style={{ marginBottom: 8 }}>
              Target userId:<br/>
              <input placeholder="user-uuid-or-id" value={userId ?? ''} onChange={(e) => setUserId(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={serverStart}>Start</button>
              <button onClick={serverRevert}>Revert</button>
            </div>

            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              <div>Status: {status ?? 'idle'}</div>
              <div>Server mode requires env var IMPERSONATION_ADMIN_SECRET or server admin check.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
