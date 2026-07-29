"use client";
import { useState } from "react";
import { EVENT } from "@/lib/event";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("cname") as HTMLInputElement).value,
      email: (form.elements.namedItem("cemail") as HTMLInputElement).value,
      message: (form.elements.namedItem("cmsg") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send message.");
      form.reset();
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  const infoCard = (icon: string, label: string, value: string, href?: string) => {
    const inner = (
      <>
        <span style={{ width: 42, height: 42, borderRadius: 11, background: "#e7f1fb", color: "#1c78c0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
          {icon}
        </span>
        <span>
          <span style={{ display: "block", fontSize: 12.5, color: "#6b7885", fontWeight: 600 }}>{label}</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#16283a" }}>{value}</span>
        </span>
      </>
    );
    const style: React.CSSProperties = { display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #eae6dc", borderRadius: 14, padding: "16px 18px" };
    return href ? (
      <a href={href} style={style}>{inner}</a>
    ) : (
      <div style={style}>{inner}</div>
    );
  };

  return (
    <section id="contact" style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 24px" }}>
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "#1c78c0", marginBottom: 14 }}>
            Contact
          </div>
          <h2 style={{ fontSize: "clamp(30px,3.6vw,44px)", fontWeight: 700, marginBottom: 18 }}>Talk to us about a screening.</h2>
          <p style={{ fontSize: 18, color: "#3d4d5c", marginBottom: 28, textWrap: "pretty" }}>
            Call to register, book an on-site event, or ask about upcoming screenings near you.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {infoCard("☎", "Call to register", EVENT.phone, EVENT.phoneHref)}
            {infoCard("✉", "Email us", EVENT.email, `mailto:${EVENT.email}`)}
            {infoCard("◎", "Serving", "Mesa, Phoenix & across Arizona")}
          </div>
        </div>
        <form onSubmit={onSubmit} style={{ background: "#fff", border: "1px solid #eae6dc", borderRadius: 20, padding: 28 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Send us a message</h3>
          <Field label="Name">
            <input name="cname" required placeholder="Your name" style={inputStyle} />
          </Field>
          <Field label="Email">
            <input name="cemail" type="email" required placeholder="you@email.com" style={inputStyle} />
          </Field>
          <Field label="How can we help?">
            <textarea name="cmsg" rows={4} required placeholder="I'd like to book a screening for…" style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
          {error && <p style={{ color: "#c0392b", fontSize: 13.5, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={sending || sent}
            style={{ width: "100%", background: sent ? "#1f9d55" : "#1c78c0", color: "#fff", fontWeight: 800, fontSize: 16, padding: 15, borderRadius: 12, border: "none", cursor: sending || sent ? "default" : "pointer", opacity: sending ? 0.8 : 1 }}
          >
            {sent ? "Message sent ✓" : sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  border: "1px solid #d8dde2",
  borderRadius: 10,
  fontSize: 15,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#425263", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
