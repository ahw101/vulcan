"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ── Types ─────────────────────────────────────────────────────── */

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: Date;
}

interface Settings {
  systemPrompt: string;
  theme: "dark" | "light" | "midnight" | "warm";
  model: string;
}

/* ── Models — exact IDs from puter.js docs ──────────────────── */
const MODELS = [
  // Anthropic
  { id: "anthropic/claude-sonnet-4-6",   label: "Claude Sonnet 4.6",   provider: "Anthropic", badge: "⭐ Best" },
  { id: "anthropic/claude-opus-4-6",     label: "Claude Opus 4.6",     provider: "Anthropic", badge: "" },
  { id: "anthropic/claude-haiku-4-5",    label: "Claude Haiku 4.5",    provider: "Anthropic", badge: "Fast" },
  // OpenAI
  { id: "openai/gpt-5",                  label: "GPT-5",               provider: "OpenAI",    badge: "" },
  { id: "openai/gpt-5-mini",             label: "GPT-5 Mini",          provider: "OpenAI",    badge: "Fast" },
  { id: "openai/gpt-5.4",                label: "GPT-5.4",             provider: "OpenAI",    badge: "New" },
  { id: "openai/gpt-5.4-mini",           label: "GPT-5.4 Mini",        provider: "OpenAI",    badge: "Fast" },
  // Google
  { id: "google/gemini-3-pro-preview",   label: "Gemini 3 Pro",        provider: "Google",    badge: "" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash",      provider: "Google",    badge: "Fast" },
  { id: "google/gemma-4-31b-it",         label: "Gemma 4 31B",         provider: "Google",    badge: "Free" },
  // DeepSeek
  { id: "deepseek/deepseek-v3.2",        label: "DeepSeek V3.2",       provider: "DeepSeek",  badge: "" },
  { id: "deepseek/deepseek-chat-v3.1",   label: "DeepSeek V3.1",       provider: "DeepSeek",  badge: "" },
  // Mistral
  { id: "mistralai/mistral-small-2603",  label: "Mistral Small 4",     provider: "Mistral",   badge: "" },
  // xAI
  { id: "x-ai/grok-4-fast",             label: "Grok 4 Fast",         provider: "xAI",       badge: "" },
  // Meta / Qwen
  { id: "qwen/qwen3.5-flash-02-23",      label: "Qwen3.5 Flash",       provider: "Qwen",      badge: "Fast" },
  // Free models
  { id: "arcee-ai/trinity-large-preview:free", label: "Trinity Large",  provider: "Arcee AI",  badge: "Free" },
  { id: "liquid/lfm-2.5-1.2b-instruct:free",   label: "LFM 1.2B",       provider: "Liquid AI", badge: "Free" },
];

const THEMES: { id: Settings["theme"]; label: string; preview: string }[] = [
  { id: "dark",     label: "Dark",     preview: "linear-gradient(135deg, #0d0f14 50%, #1e2130 50%)" },
  { id: "light",    label: "Light",    preview: "linear-gradient(135deg, #f8f9fc 50%, #ffffff 50%)" },
  { id: "midnight", label: "Midnight", preview: "linear-gradient(135deg, #000000 50%, #0f1018 50%)" },
  { id: "warm",     label: "Warm",     preview: "linear-gradient(135deg, #100e0c 50%, #231e19 50%)" },
];

const DEFAULT_SETTINGS: Settings = { systemPrompt: "", theme: "dark", model: "anthropic/claude-sonnet-4-6" };

import { refreshCredits, deductCredits, getModelCost, formatCountdown, msUntilNextRegen, MAX_CREDITS } from "@/lib/credits";
import Link from "next/link";
declare global { interface Window { puter: any; } }
function uid() { return Math.random().toString(36).slice(2, 10); }
function titleFromMsg(msg: string) { const t = msg.trim().replace(/\n+/g, " "); return t.length > 46 ? t.slice(0, 46) + "…" : t; }

/* ── Extract text from any puter.js response shape ─────────── */
function extractText(resp: any): string {
  if (typeof resp === "string") return resp;
  // Streamed chunk
  if (resp?.text) return resp.text;
  // Standard message wrapper
  const content = resp?.message?.content ?? resp?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => c?.text ?? c?.content ?? "").filter(Boolean).join("");
  }
  return JSON.stringify(resp);
}

/* ── Main component ─────────────────────────────────────────── */
export default function ChatPage() {
  const { user } = useUser();
  const [puterReady, setPuterReady] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [noticeDone, setNoticeDone] = useState(false);
  const [credits, setCredits] = useState(0);
  const [creditCountdown, setCreditCountdown] = useState(0);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load from storage
  useEffect(() => {
    try {
      const s = localStorage.getItem("nexus_settings"); if (s) setSettings(JSON.parse(s));
      const c = localStorage.getItem("nexus_convos");
      if (c) {
        const revived: Conversation[] = JSON.parse(c).map((cv: any) => ({
          ...cv, createdAt: new Date(cv.createdAt),
          messages: cv.messages.map((m: any) => ({ ...m, ts: new Date(m.ts) })),
        }));
        setConvos(revived);
        if (revived.length > 0) setActiveId(revived[0].id);
      }
    } catch {}
  }, []);

  useEffect(() => { document.documentElement.setAttribute("data-theme", settings.theme); }, [settings.theme]);
  useEffect(() => { try { localStorage.setItem("nexus_settings", JSON.stringify(settings)); } catch {} }, [settings]);

  // Credits refresh every second
  useEffect(() => {
    const tick = () => {
      const data = refreshCredits();
      setCredits(data.credits);
      setCreditCountdown(msUntilNextRegen());
    };
    tick();
    const t = setInterval(tick, 2000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { try { localStorage.setItem("nexus_convos", JSON.stringify(convos)); } catch {} }, [convos]);

  // Wait for AI
  useEffect(() => {
    const check = () => { if (window.puter?.ai?.chat) { setPuterReady(true); } else { setTimeout(check, 400); } };
    check();
  }, []);

  // Show notice after 1.5s if not ready
  useEffect(() => {
    if (puterReady || noticeDone) return;
    const t = setTimeout(() => { if (!puterReady) setShowNotice(true); }, 1500);
    return () => clearTimeout(t);
  }, [puterReady, noticeDone]);
  useEffect(() => { if (puterReady) setShowNotice(false); }, [puterReady]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeId, streamText, loading]);

  const activeConvo = convos.find(c => c.id === activeId) ?? null;
  const activeModel = MODELS.find(m => m.id === settings.model) ?? MODELS[0];

  const newConvo = useCallback(() => {
    const id = uid();
    setConvos(prev => [{ id, title: "New conversation", messages: [], createdAt: new Date() }, ...prev]);
    setActiveId(id); setInput(""); setErrorMsg(null); setStreamText("");
  }, []);

  const deleteConvo = useCallback((id: string) => {
    setConvos(prev => {
      const next = prev.filter(c => c.id !== id);
      if (activeId === id) setActiveId(next.length > 0 ? next[0].id : null);
      return next;
    });
  }, [activeId]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !puterReady) return;
    setErrorMsg(null);

    let currentId = activeId;
    if (!currentId) {
      const id = uid();
      setConvos(prev => [{ id, title: titleFromMsg(text), messages: [], createdAt: new Date() }, ...prev]);
      setActiveId(id); currentId = id;
    }

    const userMsg: Msg = { id: uid(), role: "user", content: text, ts: new Date() };
    setConvos(prev => prev.map(c => {
      if (c.id !== currentId) return c;
      const updated = { ...c, messages: [...c.messages, userMsg] };
      if (c.title === "New conversation") updated.title = titleFromMsg(text);
      return updated;
    }));
    setInput(""); setLoading(true); setStreamText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const convo = convos.find(c => c.id === currentId);
    const history = [...(convo?.messages ?? []), userMsg].map(m => ({ role: m.role, content: m.content }));
    const msgs = settings.systemPrompt
      ? [{ role: "user", content: `[System: ${settings.systemPrompt}]\n\n${history[0].content}` }, ...history.slice(1)]
      : history;

    let full = "";
    try {
      // Try streaming
      try {
        const stream = await window.puter.ai.chat(msgs, { model: settings.model, stream: true });
        for await (const chunk of stream) {
          const piece = extractText(chunk);
          if (piece) { full += piece; setStreamText(full); }
        }
      } catch (streamErr: any) {
        // Streaming failed — try non-streaming
        full = "";
        setStreamText("");
        try {
          const resp = await window.puter.ai.chat(msgs, { model: settings.model });
          full = extractText(resp);
        } catch (noStreamErr: any) {
          // Last resort: try default model
          const resp = await window.puter.ai.chat(msgs);
          full = extractText(resp);
        }
      }

      if (!full) full = "*(No response received)*";
      // Deduct credits
      const cost = getModelCost(settings.model);
      const updated = deductCredits(cost);
      setCredits(updated.credits);
      setConvos(prev => prev.map(c => c.id === currentId
        ? { ...c, messages: [...c.messages, { id: uid(), role: "assistant", content: full, ts: new Date() }] }
        : c
      ));
    } catch (e: any) {
      console.error("AI error:", e);
      setErrorMsg(`Error: ${e?.message ?? "Something went wrong. Please try again."}`);
    } finally {
      setStreamText(""); setLoading(false);
    }
  }, [input, loading, puterReady, activeId, convos, settings]);

  // Direct send with explicit text (for suggestion buttons)
  const sendText = useCallback(async (text: string) => {
    setInput(text);
    // Use a small timeout to let state settle, then trigger via the textarea
    setTimeout(async () => {
      if (!puterReady || loading) return;
      setErrorMsg(null);
      let currentId = activeId;
      if (!currentId) {
        const id = uid();
        setConvos(prev => [{ id, title: titleFromMsg(text), messages: [], createdAt: new Date() }, ...prev]);
        setActiveId(id); currentId = id;
      }
      const userMsg: Msg = { id: uid(), role: "user", content: text, ts: new Date() };
      setConvos(prev => prev.map(c => {
        if (c.id !== currentId) return c;
        const updated = { ...c, messages: [...c.messages, userMsg] };
        if (c.title === "New conversation") updated.title = titleFromMsg(text);
        return updated;
      }));
      setInput(""); setLoading(true); setStreamText("");
      const convo = convos.find(c => c.id === currentId);
      const history = [...(convo?.messages ?? []), userMsg].map(m => ({ role: m.role, content: m.content }));
      const msgs = settings.systemPrompt
        ? [{ role: "user", content: `[System: ${settings.systemPrompt}]\n\n${history[0].content}` }, ...history.slice(1)]
        : history;
      let full = "";
      try {
        try {
          const stream = await window.puter.ai.chat(msgs, { model: settings.model, stream: true });
          for await (const chunk of stream) { const piece = extractText(chunk); if (piece) { full += piece; setStreamText(full); } }
        } catch {
          setStreamText("");
          const resp = await window.puter.ai.chat(msgs, { model: settings.model });
          full = extractText(resp);
        }
        if (!full) full = "*(No response)*";
        const cost2 = getModelCost(settings.model);
        const upd2 = deductCredits(cost2);
        setCredits(upd2.credits);
        setConvos(prev => prev.map(c => c.id === currentId
          ? { ...c, messages: [...c.messages, { id: uid(), role: "assistant", content: full, ts: new Date() }] } : c));
      } catch (e: any) { setErrorMsg(`Error: ${e?.message ?? "Something went wrong."}`); }
      finally { setStreamText(""); setLoading(false); }
    }, 20);
  }, [puterReady, loading, activeId, convos, settings]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  return (
    <div data-theme={settings.theme} style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>

      {/* ── NOTICE MODAL ── */}
      {showNotice && !noticeDone && (
        <div className="overlay" onClick={() => { setNoticeDone(true); setShowNotice(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ padding: "28px 26px 0" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-s)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 5 }}>Complete sign-in to access AI models</h2>
                  <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65 }}>
                    A short sign-in step is required to activate the models. It's completely safe — you can use Google, Apple, or email.
                  </p>
                </div>
              </div>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "🔒", text: "Your credentials are never stored by us" },
                  { icon: "✓",  text: "Sign in once — stays active for your session" },
                  { icon: "⚡", text: "Instantly unlocks all available AI models" },
                ].map(item => (
                  <div key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "18px 26px 24px" }}>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }}
                onClick={() => { setNoticeDone(true); setShowNotice(false); }}>
                Got it, continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {settingsOpen && (
        <div className="overlay" onClick={() => setSettingsOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Settings</h2>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Personalise your experience</p>
              </div>
              <button className="btn-icon" onClick={() => setSettingsOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: "22px 22px 6px", display: "flex", flexDirection: "column", gap: 26 }}>

              {/* Custom instructions */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Custom instructions</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 9, lineHeight: 1.6 }}>
                  Tell the AI how to behave in every conversation. Examples: "Speak like a pirate", "Always reply in bullet points", "You are a senior software engineer".
                </p>
                <textarea className="settings-input" rows={4}
                  placeholder="e.g. Always respond concisely. Speak in a friendly tone."
                  value={settings.systemPrompt}
                  onChange={e => setSettings(s => ({ ...s, systemPrompt: e.target.value }))}
                />
              </div>

              <div className="divider"/>

              {/* Models */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>AI Model</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10, lineHeight: 1.6 }}>
                  Some models may show a brief sign-in prompt the first time — this is safe and normal.
                </p>

                {/* Group by provider */}
                {["Anthropic","OpenAI","Google","DeepSeek","Mistral","xAI","Qwen","Arcee AI","Liquid AI"].map(provider => {
                  const group = MODELS.filter(m => m.provider === provider);
                  if (!group.length) return null;
                  return (
                    <div key={provider} style={{ marginBottom: 14 }}>
                      <p style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>{provider}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {group.map(m => {
                          const active = settings.model === m.id;
                          return (
                            <button key={m.id} onClick={() => setSettings(s => ({ ...s, model: m.id }))} style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "9px 13px", background: active ? "var(--accent-s)" : "var(--surface-2)",
                              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                              borderRadius: 8, cursor: "pointer", transition: "all 0.13s", textAlign: "left",
                            }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--accent)" : "var(--text-1)" }}>{m.label}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                {m.badge && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: active ? "var(--accent)" : "var(--surface-3)", color: active ? "white" : "var(--text-3)" }}>{m.badge}</span>}
                                {active && <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="2 6 5 9 10 3"/></svg>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="divider"/>

              {/* Theme */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>Theme</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {THEMES.map(t => {
                    const active = settings.theme === t.id;
                    return (
                      <button key={t.id} onClick={() => setSettings(s => ({ ...s, theme: t.id }))} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 13px",
                        background: active ? "var(--accent-s)" : "var(--surface-2)",
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 9, cursor: "pointer", transition: "all 0.13s",
                      }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: t.preview, border: "1px solid var(--border-2)", flexShrink: 0 }}/>
                        <span style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--accent)" : "var(--text-1)" }}>{t.label}</span>
                        {active && <svg style={{ marginLeft: "auto" }} width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="var(--accent)" strokeWidth="2.5"><polyline points="2 6 5 9 10 3"/></svg>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 22px 24px" }}>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14 }} onClick={() => setSettingsOpen(false)}>
                Save & close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 260 : 0, minWidth: sidebarOpen ? 260 : 0,
        overflow: "hidden", transition: "width 0.25s ease, min-width 0.25s ease",
        background: "var(--bg-2)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{ padding: "14px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 9 }}>
          <LogoMark size={22} />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)", letterSpacing: "-0.01em" }}>Vulcan <span style={{ color: "var(--accent-l)" }}>AI</span></span>
        </div>

        <div style={{ padding: "10px 10px 6px" }}>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", gap: 8, padding: "9px 11px", fontSize: 13 }} onClick={newConvo}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New conversation
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {convos.length === 0
            ? <p style={{ fontSize: 12, color: "var(--text-3)", padding: "10px 6px", lineHeight: 1.6 }}>No conversations yet.</p>
            : <>
              <p style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.07em", padding: "6px 6px 4px", textTransform: "uppercase", fontWeight: 500 }}>Conversations</p>
              {convos.map(c => {
                const active = c.id === activeId;
                return (
                  <ConvoRow key={c.id} convo={c} active={active}
                    onClick={() => setActiveId(c.id)}
                    onDelete={() => deleteConvo(c.id)} />
                );
              })}
            </>
          }
        </div>

        <div style={{ borderTop: "1px solid var(--border)", padding: "8px 10px 6px" }}>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", gap: 9, padding: "9px 11px", fontSize: 13 }} onClick={() => setSettingsOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </button>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em" }}>Credits</span>
              <Link href="/account" style={{ fontSize: 10, color: "var(--accent-l)", textDecoration: "none" }}>
                {credits} / {MAX_CREDITS}
              </Link>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: credits > 150 ? "var(--green)" : credits > 50 ? "var(--yellow)" : "var(--red)", width: `${Math.min(100,(credits/MAX_CREDITS)*100)}%`, transition: "width 0.4s" }}/>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>+100 in {formatCountdown(creditCountdown)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0 2px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <StatusDot ok={puterReady} />
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{puterReady ? activeModel.label : "Connecting…"}</span>
            </div>
            <UserButton appearance={{ elements: { avatarBox: { width: 28, height: 28 } } }} />
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--bg)" }}>

        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", height: 52, flexShrink: 0, background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-icon" onClick={() => setSidebarOpen(s => !s)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-1)", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeConvo?.title ?? "Vulcan AI"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {settings.systemPrompt && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", background: "var(--accent-ss)", border: "1px solid var(--accent-s)", borderRadius: 99 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4"/></svg>
                <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 500 }}>Custom instructions on</span>
              </div>
            )}
            <span style={{ fontSize: 11, color: "var(--text-3)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeModel.label}</span>
            <button className="btn-icon" onClick={() => setSettingsOpen(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 20px 8px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
            {(!activeConvo || (activeConvo.messages.length === 0 && !loading)) && (
              <WelcomeState username={user?.firstName || user?.username} onSend={sendText} />
            )}
            {activeConvo?.messages.map(msg => <MsgBubble key={msg.id} msg={msg} />)}

            {/* Loading / streaming */}
            {loading && (
              <div className="anim-msg" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AIAvatar />
                <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px 14px 14px 14px", padding: "14px 18px", maxWidth: "85%" }}>
                  {streamText ? (
                    <div className="md">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamText}</ReactMarkdown>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Circle spinner */}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="9" stroke="var(--border-2)" strokeWidth="2.5"/>
                        <path d="M12 3a9 9 0 0 1 9 9" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                      <span style={{ fontSize: 13, color: "var(--text-3)" }}>
                        Thinking…
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "var(--red)", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {errorMsg}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, padding: "12px 20px 18px", background: "var(--bg-2)", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 14, transition: "box-shadow 0.2s" }}>
              <textarea ref={textareaRef} className="chat-input" style={{ minHeight: 50, borderRadius: 14 }}
                placeholder={puterReady ? `Message Vulcan AI…` : "Connecting…"}
                value={input} onChange={handleInputChange} onKeyDown={handleKey}
                disabled={loading || !puterReady} rows={1}
              />
              <button onClick={send} disabled={!input.trim() || loading || !puterReady} style={{
                position: "absolute", right: 10, bottom: 10, width: 34, height: 34,
                borderRadius: 9, border: "none",
                background: input.trim() && !loading && puterReady ? "var(--accent)" : "var(--surface-3)",
                color: input.trim() && !loading && puterReady ? "white" : "var(--text-3)",
                cursor: input.trim() && !loading && puterReady ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
              }}>
                {loading
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.9s linear infinite" }}><circle cx="12" cy="12" r="9" strokeOpacity="0.25"/><path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 7 }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function ConvoRow({ convo, active, onClick, onDelete }: { convo: Conversation; active: boolean; onClick: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 10px", borderRadius: 7, marginBottom: 1, gap: 6,
        background: active ? "var(--accent-s)" : hovered ? "var(--surface-2)" : "transparent",
        border: `1px solid ${active ? "var(--accent-s)" : "transparent"}`,
        cursor: "pointer", transition: "all 0.12s",
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? "var(--accent)" : "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {convo.title}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
          {convo.messages.length} msg{convo.messages.length !== 1 ? "s" : ""} · {convo.createdAt.toLocaleDateString([], { month: "short", day: "numeric" })}
        </p>
      </div>
      {hovered && (
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="btn-icon" style={{ opacity: 0.7, padding: 3, flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function MsgBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="anim-msg" style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "76%", background: "var(--user-bubble)", borderRadius: "14px 14px 3px 14px", padding: "11px 16px" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>{msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          <p style={{ fontSize: 14, color: "var(--user-text)", lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="anim-msg" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <AIAvatar />
      <div style={{ flex: 1, maxWidth: "85%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px 14px 14px 14px", padding: "11px 16px" }}>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 6 }}>Vulcan · {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <div className="md"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
      </div>
    </div>
  );
}

function AIAvatar() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 2, background: "var(--accent-s)", border: "1px solid rgba(107,99,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LogoMark size={16} />
    </div>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <div style={{ position: "relative", width: 7, height: 7 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? "var(--green)" : "var(--yellow)", boxShadow: `0 0 5px ${ok ? "var(--green)" : "var(--yellow)"}` }}/>
    </div>
  );
}

const SUGGESTIONS = [
  { label: "Explain how transformers work", full: "Explain how transformer neural networks work in AI, simply." },
  { label: "Write a Python web scraper", full: "Write me a Python web scraper using BeautifulSoup." },
  { label: "Help me write a cover letter", full: "Help me write a compelling cover letter for a software engineering role." },
  { label: "Best way to learn TypeScript?", full: "What's the best way to learn TypeScript as a JavaScript developer?" },
];

function WelcomeState({ username, onSend }: { username?: string | null; onSend: (text: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "10vh", paddingBottom: 24, width: "100%" }}>
      <div className="anim-float" style={{ marginBottom: 20 }}><LogoMark size={56} /></div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center" }}>
        {username ? `Welcome back, ${username}` : "How can I help today?"}
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28, textAlign: "center" }}>
        Ask me anything — I remember the full conversation.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%" }}>
        {SUGGESTIONS.map(s => (
          <button key={s.label}
            onClick={() => onSend(s.full)}
            style={{
              padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, fontSize: 13, color: "var(--text-2)", cursor: "pointer",
              lineHeight: 1.5, transition: "all 0.15s", textAlign: "left",
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border-2)"; el.style.color = "var(--text-1)"; el.style.background = "var(--surface-2)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-2)"; el.style.background = "var(--surface)"; }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="logo-pulse">
      <circle cx="20" cy="20" r="17" stroke="rgba(107,99,246,0.5)" strokeWidth="1.5" fill="rgba(107,99,246,0.07)"/>
      <circle cx="20" cy="20" r="9" stroke="rgba(107,99,246,0.3)" strokeWidth="1" fill="none"/>
      <circle cx="20" cy="20" r="3.5" fill="rgba(107,99,246,0.95)"/>
      <line x1="20" y1="3" x2="20" y2="9" stroke="rgba(107,99,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="31" x2="20" y2="37" stroke="rgba(107,99,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="20" x2="9" y2="20" stroke="rgba(107,99,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="31" y1="20" x2="37" y2="20" stroke="rgba(107,99,246,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
