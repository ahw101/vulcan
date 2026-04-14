"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Nav, { VulcanLogo } from "@/components/Nav";

const STATS = [
  { value: "18+", label: "AI Models" },{ value: "200K", label: "Context window" },{ value: "4", label: "Themes" },{ value: "∞", label: "Conversations" },
];
const FEATURES = [
  { icon: "✦", title: "18+ AI Models", desc: "Claude, GPT-5, Gemini, Grok, DeepSeek and more — all from one interface." },
  { icon: "◈", title: "Full memory", desc: "Every conversation saved locally. Pick up exactly where you left off." },
  { icon: "⟨/⟩", title: "Markdown & code", desc: "Code blocks, tables, headers — everything renders beautifully." },
  { icon: "⚙", title: "Customisable", desc: "Custom instructions, themes, and your preferred model." },
  { icon: "⚡", title: "Credits system", desc: "Fair usage with auto-regenerating credits every 2 hours." },
  { icon: "🔐", title: "Secure auth", desc: "Powered by Clerk. Your sessions are always protected." },
];

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="marketing-bg">
      <div className="marketing-hero-glow" />
      <Nav />
      <section className="section hero-grid" style={{ textAlign:"center", paddingTop:100, paddingBottom:100 }}>
        <div className="marketing-container">
          {mounted && <>
            <div className="anim-fade-up" style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
              <div className="anim-float"><VulcanLogo size={72} /></div>
            </div>
            <div className="anim-fade-up delay-1">
              <div className="section-tag" style={{ marginBottom:20 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:"#34d399",display:"inline-block",boxShadow:"0 0 6px #34d399" }}/>
                All systems online
              </div>
              <h1 className="page-title" style={{ marginBottom:20 }}>
                Intelligence,<br/><span style={{ color:"#8b5cf6" }}>redefined.</span>
              </h1>
              <p className="page-subtitle" style={{ margin:"0 auto 40px" }}>
                Vulcan AI brings together the world's best AI models in a single, beautifully designed interface. Fast, private, and endlessly customisable.
              </p>
            </div>
            <div className="anim-fade-up delay-2" style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", marginBottom:16 }}>
              <button className="btn btn-primary" style={{ padding:"14px 36px", fontSize:15, fontWeight:700 }} onClick={() => router.push("/sign-in")}>
                Start for free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button className="btn btn-ghost" onClick={() => router.push("/why-us")}>Learn more</button>
            </div>
            <p className="anim-fade-up delay-3" style={{ fontSize:12, color:"var(--text-3)" }}>No credit card required · 100 free credits to start</p>
          </>}
        </div>
      </section>

      <div style={{ borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", background:"var(--surface)", padding:"32px 0" }}>
        <div className="marketing-container">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:24, textAlign:"center" }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize:"clamp(24px,4vw,36px)", fontWeight:800, color:"#8b5cf6", letterSpacing:"-.02em" }}>{s.value}</div>
                <div style={{ fontSize:12, color:"var(--text-3)", marginTop:4, textTransform:"uppercase", letterSpacing:".08em", fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="marketing-container">
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div className="section-tag">Features</div>
            <h2 className="page-title" style={{ fontSize:"clamp(24px,4vw,38px)" }}>Everything you need</h2>
            <p className="page-subtitle" style={{ margin:"12px auto 0" }}>Built for power users who want the best AI experience.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:16 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card">
                <div className="card-icon">{f.icon}</div>
                <h3 style={{ fontWeight:700, fontSize:15, color:"var(--text-1)", marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ textAlign:"center" }}>
        <div className="marketing-container">
          <div style={{ background:"var(--surface)", border:"1px solid var(--border-2)", borderRadius:24, padding:"60px 40px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 60% at 50% 50%,rgba(124,58,237,.08) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"relative" }}>
              <h2 className="page-title" style={{ fontSize:"clamp(22px,4vw,36px)", marginBottom:12 }}>Ready to get started?</h2>
              <p style={{ color:"var(--text-2)", marginBottom:28, fontSize:15 }}>Join thousands of users already using Vulcan AI.</p>
              <button className="btn btn-primary" style={{ padding:"14px 40px", fontSize:15, fontWeight:700 }} onClick={() => router.push("/sign-in")}>
                Create free account
              </button>
            </div>
          </div>
        </div>
      </section>
      <footer className="marketing-footer">Vulcan AI © 2025 — by ahw101</footer>
    </div>
  );
}
