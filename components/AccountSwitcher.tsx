import React, { useEffect, useState } from 'react';

/**
 * AccountSwitcher
 *
 * Lightweight component to quickly switch between roles (e.g. 'client' and 'freelancer') in the UI.
 * Intended for development / testing only.
 *
 * How it works:
 * - Saves the chosen role in localStorage under the key "adocaworks_impersonate_role".
 * - Reloads the page so your app can read that value and adapt UI (see lib/impersonation.ts).
 *
 * IMPORTANT:
 * - This client-only approach does NOT change server-side permissions or Supabase auth.
 * - Do NOT enable in production without securing it (see README_INTEGRATE.md).
 */

const STORAGE_KEY = "adocaworks_impersonate_role";

const AccountSwitcher: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setRole(saved);
  }, []);

  const switchTo = (r: string | null) => {
    if (typeof window === "undefined") return;
    if (r === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, r);
    }
    // quick reload so the app picks up the change
    window.location.reload();
  };

  if (!visible) return null;

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
      minWidth: 180,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong>Switcher</strong>
        <button onClick={() => setVisible(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ marginBottom: 6 }}>Current: <em>{role ?? "real user"}</em></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => switchTo("client")} style={{ padding: "6px 8px", cursor: "pointer" }}>Client</button>
          <button onClick={() => switchTo("freelancer")} style={{ padding: "6px 8px", cursor: "pointer" }}>Freelancer</button>
          <button onClick={() => switchTo(null)} style={{ padding: "6px 8px", cursor: "pointer" }}>Reset</button>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#666" }}>
        Dev-only switcher. Use with caution.
      </div>
    </div>
  );
};

export default AccountSwitcher;
