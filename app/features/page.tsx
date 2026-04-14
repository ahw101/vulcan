"use client";
import Nav from "@/components/Nav";

const FEATURE_SECTIONS = [
  {
    tag:"AI Models", title:"Every frontier model, one place",
    desc:"Vulcan AI integrates 18+ models from Anthropic, OpenAI, Google, xAI, DeepSeek, Mistral, and more. Switch mid-conversation without losing context.",
    items:["Claude Sonnet 4.6, Opus 4.6, Haiku 4.5","GPT-5, GPT-5.4, GPT-5 Mini","Gemini 3 Pro, Gemini 3 Flash","Grok 4 Fast, DeepSeek V3.2","Mistral Small 4, Qwen 3.5 Flash","Free models: Trinity Large, LFM 1.2B"],
  },
  {
    tag:"Conversations", title:"Memory that actually works",
    desc:"Every conversation is saved in your browser with its full title, message count, and date. Switch between sessions instantly.",
    items:["Auto-generated conversation titles","Full message history preserved","Switch between any past conversation","Delete individual conversations","Persistent across browser sessions","No cloud storage — fully private"],
  },
  {
    tag:"Customisation", title:"Your AI, your way",
    desc:"Set custom instructions that apply to every conversation. Change themes to match your mood. Pick your preferred model as default.",
    items:["System prompt instructions","4 built-in themes (Dark, Light, Midnight, Warm)","Model default preference","Instruction examples: tone, language, persona","Instant theme switching","Settings synced locally"],
  },
  {
    tag:"Output", title:"Beautiful rendering",
    desc:"AI responses render with full markdown support. Code blocks include syntax highlighting. Tables, lists, blockquotes — all perfectly formatted.",
    items:["Full GFM markdown support","Syntax-highlighted code blocks","Table rendering","Blockquote formatting","Inline code and links","LaTeX-style text elements"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="marketing-bg">
      <div className="marketing-hero-glow" />
      <Nav />
      <section className="section">
        <div className="marketing-container" style={{ textAlign:"center" }}>
          <div className="section-tag">Features</div>
          <h1 className="page-title">Packed with features,<br/>not clutter</h1>
          <p className="page-subtitle" style={{ margin:"16px auto 0" }}>Every feature in Vulcan AI was chosen deliberately. Nothing superfluous. Everything essential.</p>
        </div>
      </section>
      {FEATURE_SECTIONS.map((s, i) => (
        <section className="section-sm" key={s.tag} style={{ borderTop:"1px solid var(--border)" }}>
          <div className="marketing-container">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
              <div style={{ order: i%2===1 ? 2 : 1 }}>
                <div className="section-tag">{s.tag}</div>
                <h2 style={{ fontSize:"clamp(20px,3.5vw,30px)", fontWeight:800, color:"var(--text-1)", marginBottom:14, letterSpacing:"-.02em", lineHeight:1.2 }}>{s.title}</h2>
                <p style={{ fontSize:14.5, color:"var(--text-2)", lineHeight:1.75, marginBottom:24 }}>{s.desc}</p>
              </div>
              <div style={{ order: i%2===1 ? 1 : 2 }}>
                <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
                  {s.items.map(item => (
                    <div key={item} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="var(--accent-l)" strokeWidth="2.5"><polyline points="2 6 5 9 10 3"/></svg>
                      <span style={{ fontSize:13.5, color:"var(--text-1)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
      <footer className="marketing-footer">Vulcan AI © 2025 — by ahw101</footer>
    </div>
  );
}
