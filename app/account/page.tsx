"use client";
import { useClerk, useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Nav, { VulcanLogo } from "@/components/Nav";
import {
  refreshCredits, msUntilNextRegen, formatCountdown,
  MAX_CREDITS, REGEN_AMOUNT, REGEN_INTERVAL_MS, CreditData, MODEL_COSTS,
} from "@/lib/credits";

export default function AccountPage() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [creditData, setCreditData] = useState<CreditData>({ credits: 0, lastRegen: Date.now() });
  const [countdown, setCountdown] = useState(0);

  const refresh = useCallback(() => {
    const data = refreshCredits();
    setCreditData(data);
    setCountdown(msUntilNextRegen());
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1000);
    return () => clearInterval(t);
  }, [refresh]);

  const creditPct = Math.min(100, (creditData.credits / MAX_CREDITS) * 100);
  const barColor = creditPct > 60 ? "var(--green)" : creditPct > 25 ? "var(--yellow)" : "var(--red)";

  const MODEL_TIERS = [
    { tier: "Free", cost: "0 credits", examples: ["Trinity Large Preview", "LFM 1.2B"], color: "var(--green)" },
    { tier: "Lite", cost: "2–5 credits", examples: ["Claude Haiku 4.5", "GPT-5 Mini", "Gemini 3 Flash"], color: "var(--accent-l)" },
    { tier: "Standard", cost: "8–12 credits", examples: ["Claude Sonnet 4.6", "GPT-5", "DeepSeek V3.2"], color: "var(--yellow)" },
    { tier: "Premium", cost: "15–25 credits", examples: ["Claude Opus 4.6", "GPT-5.4 Pro"], color: "#f472b6" },
  ];

  return (
    <div className="marketing-bg">
      <div className="marketing-hero-glow" />
      <Nav />

      <section style={{ padding: "60px 0" }}>
        <div className="marketing-container" style={{ maxWidth: 760, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-.02em", marginBottom: 4 }}>
                Your account
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-2)" }}>
                {user?.emailAddresses?.[0]?.emailAddress ?? "Loading…"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <UserButton />
              <button
                className="btn btn-danger"
                onClick={() => signOut(() => router.push("/"))}
                style={{ fontWeight: 600 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          </div>

          {/* Credits card */}
          <div className="card" style={{ marginBottom: 16, borderColor: "rgba(124,58,237,0.3)", boxShadow: "0 0 40px rgba(124,58,237,0.08)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div className="section-tag" style={{ marginBottom: 8 }}>Credits</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: barColor, letterSpacing: "-.03em", lineHeight: 1 }}>
                    {creditData.credits}
                  </span>
                  <span style={{ fontSize: 16, color: "var(--text-3)" }}>/ {MAX_CREDITS}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Next +{REGEN_AMOUNT} in</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-l)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatCountdown(countdown)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden", marginBottom: 16 }}>
              <div style={{
                height: "100%", borderRadius: 99, background: barColor,
                width: `${creditPct}%`, transition: "width 0.5s ease",
                boxShadow: `0 0 8px ${barColor}`,
              }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                { label: "Balance", value: `${creditData.credits} credits` },
                { label: "Max balance", value: `${MAX_CREDITS} credits` },
                { label: "Regen rate", value: `${REGEN_AMOUNT} / 2hrs` },
              ].map(item => (
                <div key={item.label} style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model tiers */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-1)", marginBottom: 16 }}>Credit costs per model tier</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
              {MODEL_TIERS.map(t => (
                <div key={t.tier} style={{ background: "var(--surface-2)", borderRadius: 10, padding: "14px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>{t.tier}</span>
                    <span style={{ fontSize: 11, color: t.color, fontWeight: 700 }}>{t.cost}</span>
                  </div>
                  {t.examples.map(m => (
                    <div key={m} style={{ fontSize: 11.5, color: "var(--text-3)", marginBottom: 3, paddingLeft: 8, borderLeft: `2px solid ${t.color}40` }}>{m}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text-1)", marginBottom: 14 }}>Quick actions</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={() => router.push("/chat")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Open chat
              </button>
              <button className="btn btn-ghost" onClick={() => router.push("/pricing")}>View pricing info</button>
              <button
                className="btn btn-danger"
                style={{ marginLeft: "auto" }}
                onClick={() => signOut(() => router.push("/"))}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out of Vulcan AI
              </button>
            </div>
          </div>
        </div>
      </section>
      <footer className="marketing-footer">Vulcan AI © 2025 — by ahw101</footer>
    </div>
  );
}
