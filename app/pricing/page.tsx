"use client";
import Nav from "@/components/Nav";
import { useRouter } from "next/navigation";

const MODEL_TIERS = [
  { tier:"Free", cost:"0 credits", models:["Trinity Large Preview","LFM 1.2B Instruct"], color:"var(--green)" },
  { tier:"Lite", cost:"2–5 credits", models:["Claude Haiku 4.5","GPT-5 Mini / Nano","Gemini 3 Flash","Qwen 3.5 Flash","Mistral Small 4"], color:"var(--accent-l)" },
  { tier:"Standard", cost:"8–12 credits", models:["Claude Sonnet 4.6","GPT-5","GPT-5.4","Gemini 3 Pro","DeepSeek V3.2","Grok 4 Fast"], color:"var(--yellow)" },
  { tier:"Premium", cost:"15–25 credits", models:["Claude Opus 4.6","GPT-5.4 Pro","GPT-5.2 Pro"], color:"#f472b6" },
];

const FAQS = [
  { q:"Do credits expire?", a:"No. Credits never expire. They accumulate up to a maximum of 500." },
  { q:"What happens if I run out?", a:"You can still use Free tier models at no credit cost. Paid tier models will be locked until you regenerate." },
  { q:"Can I get more credits?", a:"Credits regenerate automatically — 100 every 2 hours. No purchases needed." },
  { q:"Is there a paid plan?", a:"Not currently. Vulcan AI is completely free to use." },
];

export default function PricingPage() {
  const router = useRouter();
  return (
    <div className="marketing-bg">
      <div className="marketing-hero-glow" />
      <Nav />
      <section className="section">
        <div className="marketing-container" style={{ textAlign:"center" }}>
          <div className="section-tag">Pricing</div>
          <h1 className="page-title">Free. Always.</h1>
          <p className="page-subtitle" style={{ margin:"16px auto 0" }}>
            Vulcan AI is completely free. You start with 100 credits and regenerate 100 more every 2 hours, up to 500 maximum.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="marketing-container">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, maxWidth:700, margin:"0 auto" }}>
            <div className="card" style={{ textAlign:"center", borderColor:"rgba(124,58,237,0.4)", boxShadow:"0 0 30px rgba(124,58,237,0.1)" }}>
              <div style={{ fontSize:40, fontWeight:800, color:"var(--accent-l)", marginBottom:4 }}>100</div>
              <div style={{ fontSize:13, color:"var(--text-2)", marginBottom:12 }}>credits to start</div>
              <div style={{ fontSize:12, color:"var(--text-3)" }}>Instant — no card needed</div>
            </div>
            <div className="card" style={{ textAlign:"center" }}>
              <div style={{ fontSize:40, fontWeight:800, color:"var(--green)", marginBottom:4 }}>+100</div>
              <div style={{ fontSize:13, color:"var(--text-2)", marginBottom:12 }}>every 2 hours</div>
              <div style={{ fontSize:12, color:"var(--text-3)" }}>Up to 500 max balance</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="marketing-container">
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <h2 className="page-title" style={{ fontSize:"clamp(20px,3.5vw,32px)" }}>Credit costs per model</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
            {MODEL_TIERS.map(t => (
              <div key={t.tier} className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <span style={{ fontWeight:700, fontSize:15, color:"var(--text-1)" }}>{t.tier}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:t.color, background:"rgba(255,255,255,0.05)", padding:"3px 9px", borderRadius:99, border:`1px solid ${t.color}40` }}>{t.cost}</span>
                </div>
                {t.models.map(m => (
                  <div key={m} style={{ fontSize:12.5, color:"var(--text-2)", padding:"5px 0", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:t.color, display:"inline-block", flexShrink:0 }}/>
                    {m}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="marketing-container" style={{ maxWidth:680, margin:"0 auto" }}>
          <h2 className="page-title" style={{ fontSize:"clamp(20px,3.5vw,28px)", textAlign:"center", marginBottom:32 }}>Frequently asked</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {FAQS.map(f => (
              <div key={f.q} className="card" style={{ padding:"18px 22px" }}>
                <p style={{ fontWeight:600, fontSize:14, color:"var(--text-1)", marginBottom:6 }}>{f.q}</p>
                <p style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.65 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ textAlign:"center" }}>
        <div className="marketing-container">
          <button className="btn btn-primary" style={{ padding:"14px 40px", fontSize:15 }} onClick={() => router.push("/sign-in")}>Start for free</button>
        </div>
      </section>
      <footer className="marketing-footer">Vulcan AI © 2025 — by ahw101</footer>
    </div>
  );
}
