import { NextResponse } from "next/server";
import { parseRegistration, persistRegistration, RegistrationError } from "@/lib/registrations";
import { sendRegistrationEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

// "Pay at the event / mail a check" path: store the registration and email both
// the participant and the org. No payment is captured here.
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const parsed = parseRegistration(body);
    const emailData = await persistRegistration(parsed, { paid: false, method: "event" });
    const emails = await sendRegistrationEmails(emailData);
    return NextResponse.json({
      ok: true,
      total: parsed.total,
      teamName: emailData.teamName,
      firstName: parsed.firstName,
      emailsSent: emails.participant.ok && emails.org.ok,
    });
  } catch (e) {
    if (e instanceof RegistrationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("POST /api/register failed:", e);
    return NextResponse.json(
      { error: "Something went wrong saving your registration. Please try again." },
      { status: 500 }
    );
  }
}
