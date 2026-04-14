import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Orbitron'", "monospace"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Exo 2'", "sans-serif"],
      },
      colors: {
        void: "#020408",
        deep: "#050d12",
        panel: "#0a1520",
        border: "#0f2535",
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          glow: "#00ffff",
        },
        amber: {
          glow: "#ffaa00",
        },
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan": "scan 3s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "typing": "typing 1.2s steps(3, end) infinite",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,255,255,0.3), 0 0 40px rgba(0,255,255,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(0,255,255,0.6), 0 0 80px rgba(0,255,255,0.2)" },
        },
        typing: {
          "0%": { content: "''" },
          "33%": { content: "'.'" },
          "66%": { content: "'..'" },
          "100%": { content: "'...'" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
