import { Resend } from "resend";
import { money } from "./pricing";

// Vercel's Resend integration exposes the key as Messaging_RESEND_API_KEY; also
// accept a plain RESEND_API_KEY if set manually.
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.Messaging_RESEND_API_KEY;

// Where the org's copy of every registration goes. Overridable via env.
export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "pop@prostatecheckup.com";
// "From" must be an address on a domain VERIFIED in Resend. Set EMAIL_FROM in
// Vercel to override. Default targets the org's website domain once verified.
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Walk for POP <walk@prostateonsiteproject.org>";

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export type RegistrationEmailData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  age?: number | null;
  shirtSize: string;
  isSurvivor: boolean;
  registrationType: string;
  teamName?: string | null;
  numAdults: number;
  numChildren: number;
  sleepingIn: boolean;
  shipTee: boolean;
  donation: number;
  totalAmount: number;
  paid: boolean;
  paymentMethod: string;
  mailing?: { street?: string | null; city?: string | null; state?: string | null; zip?: string | null };
};

const EVENT = {
  name: "17th Annual Tim Barber Walk for POP",
  date: "Saturday, September 26, 2026",
  place: "Tempe Kiwanis Park",
  schedule: "Registration 7:00–8:00am · Walk 8:00–9:45am · Ceremony 10:00–11:00am",
  phone: "(480) 964-3013",
};

function rows(d: RegistrationEmailData): [string, string][] {
  const r: [string, string][] = [
    ["Name", `${d.firstName} ${d.lastName}`],
    ["Email", d.email],
  ];
  if (d.phone) r.push(["Phone", d.phone]);
  if (d.age != null) r.push(["Age", String(d.age)]);
  r.push(["Registration", label(d.registrationType)]);
  if (d.teamName) r.push(["Team / Family", d.teamName]);
  r.push(["Adults (12 & over)", String(d.numAdults)]);
  if (d.numChildren > 0) r.push(["Children (under 12)", String(d.numChildren)]);
  r.push(["T-shirt size", d.shirtSize]);
  if (d.isSurvivor) r.push(["Prostate cancer survivor", "Yes"]);
  if (d.sleepingIn) r.push(["Sleeping in", "Yes — tee shirt to be mailed"]);
  if (d.shipTee) r.push(["Ship tee shirt (+$5)", "Yes"]);
  if (d.donation > 0) r.push(["Additional donation", money(d.donation)]);
  const m = d.mailing;
  if (m && (m.street || m.city)) {
    r.push([
      "Mailing address",
      [m.street, [m.city, m.state].filter(Boolean).join(", "), m.zip]
        .filter(Boolean)
        .join(" · "),
    ]);
  }
  r.push(["Total", money(d.totalAmount)]);
  r.push([
    "Payment",
    d.paid ? "Paid online via PayPal ✓" : "To be paid at the event or by mailed check",
  ]);
  return r;
}

function label(t: string) {
  if (t === "start") return "Started a team/family";
  if (t === "join") return "Joined a team/family";
  return "Individual";
}

function tableHtml(d: RegistrationEmailData) {
  return rows(d)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 14px;border-bottom:1px solid #eef1f4;color:#6b7885;font-size:13px;white-space:nowrap">${k}</td><td style="padding:8px 14px;border-bottom:1px solid #eef1f4;color:#16283a;font-size:14px;font-weight:600">${v}</td></tr>`
    )
    .join("");
}

function shell(heading: string, intro: string, d: RegistrationEmailData) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f7f6f2;padding:28px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eae6dc;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(180deg,#1c78c0,#155a94);padding:26px 28px;color:#fff">
      <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">Prostate On-Site Project</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px">${heading}</div>
    </div>
    <div style="padding:24px 28px">
      <p style="color:#3d4d5c;font-size:15px;line-height:1.55;margin:0 0 16px">${intro}</p>
      <div style="background:#eef4f0;border-radius:12px;padding:14px 16px;margin:0 0 18px;color:#16283a;font-size:14px;line-height:1.5">
        <strong>${EVENT.name}</strong><br>${EVENT.date} · ${EVENT.place}<br>${EVENT.schedule}
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eef1f4;border-radius:10px">${tableHtml(d)}</table>
      <p style="color:#6b7885;font-size:12.5px;line-height:1.5;margin:18px 0 0">
        Questions? Call ${EVENT.phone} or reply to this email.<br>
        Prostate On-Site Project · The Drive for Prostate Health · EIN 86-0948735
      </p>
    </div>
  </div>
</div>`;
}

type SendResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendRegistrationEmails(d: RegistrationEmailData): Promise<{
  participant: SendResult;
  org: SendResult;
}> {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping registration emails.");
    const skipped = { ok: false, skipped: true };
    return { participant: skipped, org: skipped };
  }

  const payNote = d.paid
    ? "Your payment is complete — thank you!"
    : `Your balance of <strong>${money(d.totalAmount)}</strong> can be paid at the event or by mailing a check to POP.`;

  const participantHtml = shell(
    `You're registered, ${d.firstName}!`,
    `Thank you for registering for the ${EVENT.name}. ${payNote} Here are your details:`,
    d
  );
  const orgHtml = shell(
    "New Walk registration",
    `${d.firstName} ${d.lastName} just registered for the Walk. Details below.`,
    d
  );

  const [participant, org] = await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: d.email,
      subject: `You're registered — ${EVENT.name}`,
      html: participantHtml,
      replyTo: NOTIFY_EMAIL,
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: NOTIFY_EMAIL,
      subject: `New Walk registration — ${d.firstName} ${d.lastName}`,
      html: orgHtml,
      replyTo: d.email,
    }),
  ]);

  // The Resend SDK resolves with an { error } payload instead of throwing, so a
  // fulfilled promise is NOT necessarily a sent email — check the error field.
  const norm = (r: PromiseSettledResult<{ error?: { message?: string } | null }>): SendResult => {
    if (r.status !== "fulfilled") return { ok: false, error: String(r.reason) };
    if (r.value?.error) return { ok: false, error: r.value.error.message || "send failed" };
    return { ok: true };
  };

  return { participant: norm(participant), org: norm(org) };
}
