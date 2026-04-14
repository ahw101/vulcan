"use client";
import Nav from "@/components/Nav";
import { useState } from "react";

const FAQS = [
  { q:"What is Vulcan AI?", a:"Vulcan AI is a unified AI chat interface that gives you access to 18+ leading AI models — including Claude, GPT-5, Gemini, Grok, and DeepSeek — all from one beautiful interface." },
  { q:"Is Vulcan AI free?", a:"Yes, completely. You start with 100 credits and regenerate 100 more every 2 hours automatically. No subscription, no credit card." },
  { q:"How do credits work?", a:"Credits determine which AI models you can use. Free models cost 0 credits. Lite models cost 2–5. Standard models 8–12. Premium 15–25. You regenerate 100 credits automatically every 2 hours, up to a maximum of 500." },
  { q:"Is my data private?", a:"Yes. Conversations are stored only in your browser's local storage. We don't store or train on your conversations." },
  { q:"Which AI models are available?", a:"Vulcan AI currently offers Claude Sonnet 4.6, Claude Opus 4.6, Claude Haiku 4.5, GPT-5, GPT-5.4, GPT-5 Mini, Gemini 3 Pro, Gemini 3 Flash, Grok 4 Fast, DeepSeek V3.2, Mistral Small 4, Qwen 3.5 Flash, and several free models." },
  { q:"Can I switch models mid-conversation?", a:"You can change your default model in Settings at any time. New messages will use whichever model is selected." },
  { q:"What are custom instructions?", a:"Custom instructions let you tell the AI how to behave in every conversation. For example: 'Always respond concisely', 'You are a senior software engineer', or 'Speak informally'." },
  { q:"Why does a sign-in screen sometimes appear?", a:"When accessing certain AI models for the first time, a brief authentication step may be required to activate the connection. This is safe — you can use Google, Apple, or email. It only happens once per session." },
  { q:"Can I delete my conversations?", a:"Yes. Hover over any conversation in the sidebar and click the delete icon. All data is local so it's instantly removed." },
  { q:"Is there a mobile app?", a:"Not currently. Vulcan AI works great in mobile browsers though." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", marginBottom:8 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"var(--surface)", border:"none", cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontSize:14.5, fontWeight:600, color:"var(--text-1)", fontFamily:"'Inter',sans-serif" }}>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" style={{ flexShrink:0, marginLeft:16, transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ padding:"0 20px 16px", background:"var(--surface)" }}>
          <p style={{ fontSize:14, color:"var(--text-2)", lineHeight:1.75 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="marketing-bg">
      <div className="marketing-hero-glow" />
      <Nav />
      <section className="section">
        <div className="marketing-container" style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div className="section-tag">FAQ</div>
            <h1 className="page-title">Common questions</h1>
            <p className="page-subtitle" style={{ margin:"16px auto 0" }}>Everything you need to know about Vulcan AI.</p>
          </div>
          <div>{FAQS.map(f => <FAQItem key={f.q} {...f} />)}</div>
        </div>
      </section>
      <footer className="marketing-footer">Vulcan AI © 2025 — by ahw101</footer>
    </div>
  );
}
