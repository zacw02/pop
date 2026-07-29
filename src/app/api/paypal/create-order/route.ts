import { NextResponse } from "next/server";
import { parseRegistration, RegistrationError } from "@/lib/registrations";
import { createOrder, paypalConfigured } from "@/lib/paypal";

export const dynamic = "force-dynamic";

// Creates a PayPal order for the server-computed total. The registration is NOT
// saved yet — it's persisted only after the payment is captured (capture-order).
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
  try {
    const parsed = parseRegistration(body);
    if (parsed.total <= 0) {
      return NextResponse.json({ error: "Nothing to pay." }, { status: 400 });
    }
    const order = await createOrder(
      parsed.total,
      `Walk for POP registration — ${parsed.firstName} ${parsed.lastName}`
    );
    return NextResponse.json({ id: order.id });
  } catch (e) {
    if (e instanceof RegistrationError) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("create-order failed:", e);
    return NextResponse.json({ error: "Could not start PayPal checkout." }, { status: 500 });
  }
}
