# NEXUS AI — by ahw101

A next-generation AI chat interface powered by Claude 3.5 Sonnet via Puter.js, with Clerk authentication.

## Stack
- **Next.js 15** (App Router)
- **Clerk** — Authentication
- **Puter.js** — Free unlimited Claude 3.5 Sonnet API
- **react-markdown + remark-gfm** — Markdown rendering
- **Tailwind CSS** — Styling
- **Orbitron + JetBrains Mono + Exo 2** — Typography

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features
- 🔐 Clerk sign-in / sign-up
- 🤖 Claude 3.5 Sonnet via Puter.js (no API key needed)
- 💬 Full conversation memory in session
- ✨ Streaming responses
- 📝 Full Markdown rendering (code blocks, tables, etc.)
- 🌑 Cyber-noir UI with animated particles

## Deployment (Vercel)
```bash
vercel --prod
```
Add env vars from `.env.local` in Vercel dashboard.
"# vulcan" 
