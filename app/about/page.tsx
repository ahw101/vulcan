"use client";
import Nav, { VulcanLogo } from "@/components/Nav";

export default function AboutPage() {
  return (
    <div className="marketing-bg">
      <div className="marketing-hero-glow" />
      <Nav />
      <section className="section">
        <div className="marketing-container" style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}><VulcanLogo size={56} /></div>
            <div className="section-tag">About</div>
            <h1 className="page-title" style={{ fontSize:"clamp(28px,4.5vw,44px)" }}>Built for people who<br/>think with AI</h1>
          </div>
          <div className="card" style={{ marginBottom:20 }}>
            <h2 style={{ fontWeight:700, fontSize:18, color:"var(--text-1)", marginBottom:12 }}>The story</h2>
            <p style={{ fontSize:14.5, color:"var(--text-2)", lineHeight:1.85, marginBottom:16 }}>
              Vulcan AI was built by ahw101 out of frustration with the fragmented AI landscape. Different models require different subscriptions, different interfaces, different habits. We believed there was a better way.
            </p>
            <p style={{ fontSize:14.5, color:"var(--text-2)", lineHeight:1.85 }}>
              Vulcan AI is a single, unified interface that gives you access to all the frontier AI models without the friction. One sign-in, one beautiful interface, all the intelligence you need.
            </p>
          </div>
          <div className="card" style={{ marginBottom:20 }}>
            <h2 style={{ fontWeight:700, fontSize:18, color:"var(--text-1)", marginBottom:12 }}>Our philosophy</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { title:"Simplicity over complexity", desc:"The best tool is the one you actually use. Vulcan AI gets out of your way and lets the AI do the work." },
                { title:"Privacy by default", desc:"Your conversations are stored locally. We don't train on your data. What you discuss stays with you." },
                { title:"Fair access", desc:"AI shouldn't be only for people who can afford expensive subscriptions. Vulcan AI is free, always." },
              ].map(p => (
                <div key={p.title} style={{ padding:"14px 0", borderTop:"1px solid var(--border)" }}>
                  <h3 style={{ fontWeight:600, fontSize:14, color:"var(--text-1)", marginBottom:5 }}>{p.title}</h3>
                  <p style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.65 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2 style={{ fontWeight:700, fontSize:18, color:"var(--text-1)", marginBottom:12 }}>The team</h2>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--accent-s)", border:"2px solid var(--accent-l)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>👤</div>
              <div>
                <p style={{ fontWeight:700, fontSize:15, color:"var(--text-1)" }}>ahw101</p>
                <p style={{ fontSize:13, color:"var(--text-2)" }}>Creator & developer · Vulcan AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="marketing-footer">Vulcan AI © 2025 — by ahw101</footer>
    </div>
  );
}
