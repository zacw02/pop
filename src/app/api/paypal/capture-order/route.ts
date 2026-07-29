import { NextResponse } from "next/server";
import { parseRegistration, persistRegistration, RegistrationError } from "@/lib/registrations";
import { captureOrder, paypalConfigured } from "@/lib/paypal";
import { sendRegistrationEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

// Captures an approved PayPal order, THEN saves the paid registration and emails
// the participant + the org.
export async function POST(req: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "Online payment is not configured yet." }, { status: 503 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  if (!orderId) {
    return NextResponse.json({ error: "Missing PayPal order id." }, { status: 400 });
  }

  try {
    const parsed = parseRegistration((body.registration as Record<string, unknown>) || {});
    const capture = await captureOrder(orderId);
    if (capture.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Payment not completed (status: ${capture.status}).` },
        { status: 402 }
      );
    }
    const emailData = await persistRegistration(parsed, {
      paid: true,
      method: "paypal",
      paypalOrderId: orderId,
    });
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
    console.error("capture-order failed:", e);
    // Payment may have succeeded even if saving failed — tell the user to contact us.
    return NextResponse.json(
      {
        error:
          "Your payment went through, but we hit a snag saving your registration. Please call (480) 964-3013 so we can confirm your spot.",
      },
      { status: 500 }
    );
  }
}
