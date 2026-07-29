import { NextResponse } from "next/server";
import { resend, NOTIFY_EMAIL, EMAIL_FROM } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !message) {
    return NextResponse.json({ error: "Please fill in your name, a valid email, and a message." }, { status: 400 });
  }

  if (!resend) {
    console.warn("Contact message received but RESEND_API_KEY is not set:", { name, email });
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `Website message from ${name}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#16283a">
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>
      </div>`,
    });
    return NextResponse.json({ ok: true, delivered: true });
  } catch (e) {
    console.error("contact send failed:", e);
    return NextResponse.json({ error: "Could not send your message. Please call (480) 964-3013." }, { status: 500 });
  }
}
