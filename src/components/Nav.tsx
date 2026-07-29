"use client";
import { useState } from "react";
import Image from "next/image";

const links = [
  ["#mission", "Mission"],
  ["#program", "Screening"],
  ["#walk", "The Walk"],
  ["#stories", "Stories"],
  ["#contact", "Contact"],
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(247,246,242,.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid #e6e2d9",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "11px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Image
            src="/assets/pop-logo.png"
            alt="Prostate On-Site Project"
            width={140}
            height={124}
            priority
            style={{ height: 48, width: "auto", display: "block" }}
          />
          <span
            className="brandword"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 15,
              color: "#16283a",
              lineHeight: 1.05,
              display: "none",
            }}
          >
            Prostate
            <br />
            On-Site Project
          </span>
        </a>
        <div style={{ flex: 1 }} />
        <div className="navlinks" style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {links.map(([href, label]) => (
            <a key={href} href={href} style={{ color: "#425263", fontWeight: 600, fontSize: 14.5 }}>
              {label}
            </a>
          ))}
        </div>
        <a
          href="#donate"
          className="nav-cta-desktop"
          style={{
            background: "#e0a638",
            color: "#16283a",
            fontWeight: 700,
            fontSize: 14.5,
            padding: "9px 18px",
            borderRadius: 999,
          }}
        >
          Donate
        </a>
        <a
          href="#walk"
          className="nav-cta-desktop"
          style={{
            background: "#1c78c0",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14.5,
            padding: "9px 18px",
            borderRadius: 999,
          }}
        >
          Register
        </a>
        <button
          className="mobile-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            borderRadius: 11,
            border: "1px solid #d8dde2",
            background: "#fff",
            cursor: "pointer",
            fontSize: 20,
            color: "#16283a",
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div
          style={{
            borderTop: "1px solid #e6e2d9",
            background: "rgba(247,246,242,.98)",
            padding: "10px 24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ color: "#425263", fontWeight: 600, fontSize: 16, padding: "10px 4px" }}
            >
              {label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <a
              href="#donate"
              onClick={() => setOpen(false)}
              style={{ flex: 1, textAlign: "center", background: "#e0a638", color: "#16283a", fontWeight: 700, padding: "12px 18px", borderRadius: 999 }}
            >
              Donate
            </a>
            <a
              href="#walk"
              onClick={() => setOpen(false)}
              style={{ flex: 1, textAlign: "center", background: "#1c78c0", color: "#fff", fontWeight: 700, padding: "12px 18px", borderRadius: 999 }}
            >
              Register
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
