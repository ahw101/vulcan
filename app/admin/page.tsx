"use client";
import { useState, useEffect, useCallback } from "react";
import {
  loadCreditData, saveCreditData, setCreditsAdmin, refreshCredits,
  MAX_CREDITS, CreditData, REGEN_INTERVAL_MS,
} from "@/lib/credits";
import { VulcanLogo } from "@/components/Nav";

const ADMIN_PASSWORD = "vulcan-admin-2025";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [creditData, setCreditData] = useState<CreditData>({ credits: 0, lastRegen: Date.now() });
  const [creditInput, setCreditInput] = useState("");
  const [regenInput, setRegenInput] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [convos, setConvos] = useState<{ id: string; title: string; msgCount: number }[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  const showMsg = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2500);
  };

  const loadData = useCallback(() => {
    const data = refreshCredits();
    setCreditData(data);
    setCreditInput(String(data.credits));
    try {
      const raw = localStorage.getItem("nexus_convos") ?? "[]";
      const parsed = JSON.parse(raw);
      setConvos(parsed.map((c: any) => ({ id: c.id, title: c.title, msgCount: c.messages?.length ?? 0 })));
    } catch {}
    try {
      const s = localStorage.getItem("nexus_settings");
      if (s) setSettings(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else { setPwError(true); }
  };

  const applyCredits = () => {
    const val = parseInt(creditInput);
    if (isNaN(val) || val < 0 || val > MAX_CREDITS) { showMsg("Invalid value (0–500)", false); return; }
    const updated = setCreditsAdmin(val);
    setCreditData(updated);
    showMsg(`Credits set to ${val}`);
  };

  const setRegenTime = () => {
    const mins = parseFloat(regenInput);
    if (isNaN(mins) || mins < 0) { showMsg("Invalid minutes", false); return; }
    const newLastRegen = Date.now() - REGEN_INTERVAL_MS + mins * 60 * 1000;
    const data = loadCreditData();
    saveCreditData({ ...data, lastRegen: newLastRegen });
    loadData();
    showMsg(`Next regen in ${mins} minute(s)`);
  };

  const clearAllConvos = () => {
    if (!confirm("Delete all conversations? This cannot be undone.")) return;
    localStorage.removeItem("nexus_convos");
    loadData();
    showMsg("All conversations cleared");
  };

  const resetCredits = () => {
    setCreditsAdmin(100);
    loadData();
    showMsg("Credits reset to 100");
  };

  // ── Login screen ──
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0814" }}>
        <div style={{ background: "#151228", border: "1px solid #2a2450", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 380, boxShadow: "0 12px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <VulcanLogo size={36} />
            <div>
              <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 18, color: "#f0effe", textAlign: "center", marginBottom: 2 }}>Admin Panel</h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#564f7a", textAlign: "center" }}>Vulcan AI — Restricted access</p>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#a09cb8", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>Admin password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter password…"
              style={{ width: "100%", background: "#1c1836", border: `1px solid ${pwError ? "#f87171" : "#2a2450"}`, borderRadius: 8, color: "#f0effe", fontSize: 14, padding: "10px 12px", outline: "none", fontFamily: "'Inter',sans-serif" }}
            />
            {pwError && <p style={{ fontSize: 12, color: "#f87171", marginTop: 5, fontFamily: "'Inter',sans-serif" }}>Incorrect password</p>}
          </div>
          <button
            onClick={handleLogin}
            style={{ width: "100%", padding: "11px", background: "#7c3aed", border: "none", borderRadius: 8, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}
          >
            Access admin panel
          </button>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ──
  return (
    <div style={{ minHeight: "100vh", background: "#0a0814", fontFamily: "'Inter',sans-serif", color: "#f0effe", padding: "0 0 60px" }}>
      {/* Topbar */}
      <div style={{ borderBottom: "1px solid #2a2450", background: "#0f0c1e", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <VulcanLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f0effe" }}>Vulcan AI</span>
          <span style={{ fontSize: 11, color: "#564f7a", padding: "2px 8px", background: "#1c1836", border: "1px solid #2a2450", borderRadius: 99 }}>Admin</span>
        </div>
        <button onClick={() => setAuthed(false)} style={{ fontSize: 12, color: "#564f7a", background: "none", border: "none", cursor: "pointer" }}>Lock panel</button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Notification */}
        {msg && (
          <div style={{ position: "fixed", top: 70, right: 24, padding: "12px 20px", background: msg.ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", border: `1px solid ${msg.ok ? "#34d399" : "#f87171"}`, borderRadius: 10, color: msg.ok ? "#34d399" : "#f87171", fontSize: 13, fontWeight: 500, zIndex: 999 }}>
            {msg.text}
          </div>
        )}

        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-.02em" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "#564f7a", marginBottom: 32 }}>Manage the current browser session</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Current credits", value: creditData.credits, sub: `/ ${MAX_CREDITS} max` },
            { label: "Conversations", value: convos.length, sub: "saved locally" },
            { label: "Total messages", value: convos.reduce((a, c) => a + c.msgCount, 0), sub: "across all chats" },
          ].map(s => (
            <div key={s.label} style={{ background: "#151228", border: "1px solid #2a2450", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: "#564f7a", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#8b5cf6", letterSpacing: "-.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#564f7a", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Credits control */}
          <div style={{ background: "#151228", border: "1px solid #2a2450", borderRadius: 14, padding: "22px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#f0effe" }}>Set credits</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="number" min={0} max={500}
                value={creditInput}
                onChange={e => setCreditInput(e.target.value)}
                style={{ flex: 1, background: "#1c1836", border: "1px solid #352f62", borderRadius: 8, color: "#f0effe", fontSize: 14, padding: "9px 12px", outline: "none" }}
              />
              <button onClick={applyCredits} style={{ padding: "9px 18px", background: "#7c3aed", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Apply</button>
            </div>
            <button onClick={resetCredits} style={{ fontSize: 12, color: "#8b5cf6", background: "none", border: "1px solid #352f62", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>Reset to 100</button>
          </div>

          {/* Regen timer */}
          <div style={{ background: "#151228", border: "1px solid #2a2450", borderRadius: 14, padding: "22px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#f0effe" }}>Force regen (set minutes until next)</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="number" min={0}
                value={regenInput}
                onChange={e => setRegenInput(e.target.value)}
                placeholder="Minutes…"
                style={{ flex: 1, background: "#1c1836", border: "1px solid #352f62", borderRadius: 8, color: "#f0effe", fontSize: 14, padding: "9px 12px", outline: "none" }}
              />
              <button onClick={setRegenTime} style={{ padding: "9px 18px", background: "#7c3aed", border: "none", borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Set</button>
            </div>
            <p style={{ fontSize: 11, color: "#564f7a" }}>Set to 0 to trigger regen immediately on next page load</p>
          </div>
        </div>

        {/* Conversations */}
        <div style={{ background: "#151228", border: "1px solid #2a2450", borderRadius: 14, padding: "22px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f0effe" }}>Saved conversations ({convos.length})</h2>
            <button onClick={clearAllConvos} style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>Clear all</button>
          </div>
          {convos.length === 0 ? (
            <p style={{ fontSize: 13, color: "#564f7a" }}>No conversations saved.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {convos.map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#1c1836", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "#a09cb8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{c.title}</span>
                  <span style={{ fontSize: 11, color: "#564f7a" }}>{c.msgCount} msg{c.msgCount !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings viewer */}
        <div style={{ background: "#151228", border: "1px solid #2a2450", borderRadius: 14, padding: "22px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#f0effe", marginBottom: 14 }}>Current settings</h2>
          <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#a09cb8", background: "#0f0c1e", border: "1px solid #2a2450", borderRadius: 8, padding: "14px", overflow: "auto", maxHeight: 200 }}>
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
