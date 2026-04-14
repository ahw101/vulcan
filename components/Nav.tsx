"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/why-us", label: "Why Choose Us" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10, 8, 20, 0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <VulcanLogo size={26} />
          <span style={{ fontWeight: 800, fontSize: 16, color: "#f0effe", letterSpacing: "-0.02em", fontFamily: "'Inter', sans-serif" }}>
            Vulcan <span style={{ color: "#8b5cf6" }}>AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="nav-desktop">
          {NAV_LINKS.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                color: active ? "#c4b5fd" : "#9ca3af",
                textDecoration: "none",
                transition: "all 0.15s",
                background: active ? "rgba(139,92,246,0.1)" : "transparent",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#f0effe"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isSignedIn ? (
            <>
              <Link href="/account" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", padding: "6px 12px", fontFamily: "'Inter', sans-serif" }}>Account</Link>
              <button onClick={() => router.push("/chat")} style={{
                padding: "8px 18px", background: "#7c3aed", color: "white", border: "none",
                borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#6d28d9"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#7c3aed"}
              >Open chat</button>
            </>
          ) : (
            <>
              <Link href="/sign-in" style={{ fontSize: 13.5, color: "#9ca3af", textDecoration: "none", padding: "6px 12px", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>Sign in</Link>
              <button onClick={() => router.push("/sign-in")} style={{
                padding: "8px 18px", background: "#7c3aed", color: "white", border: "none",
                borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#6d28d9"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#7c3aed"}
              >Get started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function VulcanLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <radialGradient id="vg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </radialGradient>
      </defs>
      <polygon points="20,2 36,10 36,30 20,38 4,30 4,10" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5" fill="rgba(124,58,237,0.08)"/>
      <polygon points="20,10 30,15 30,25 20,30 10,25 10,15" stroke="rgba(139,92,246,0.3)" strokeWidth="1" fill="none"/>
      <circle cx="20" cy="20" r="4" fill="url(#vg)"/>
      <line x1="20" y1="2" x2="20" y2="10" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="20" y1="30" x2="20" y2="38" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="10" x2="10" y2="14" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="30" y1="26" x2="36" y2="30" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="36" y1="10" x2="30" y2="14" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="26" x2="4" y2="30" stroke="rgba(167,139,250,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
