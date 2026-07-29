// Minimal PayPal REST helper (Orders v2). Card data never touches our servers —
// the buyer approves on PayPal's hosted flow; we only create and capture orders.
const PAYPAL_ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function creds() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
    );
  }
  return { id, secret };
}

async function accessToken(): Promise<string> {
  const { id, secret } = creds();
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const json = await res.json();
  return json.access_token as string;
}

export async function createOrder(amount: number, description: string) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
          description: description.slice(0, 127),
        },
      ],
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal create order failed: ${JSON.stringify(json)}`);
  return json as { id: string };
}

export async function captureOrder(orderId: string) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal capture failed: ${JSON.stringify(json)}`);
  return json as { id: string; status: string };
}

export const paypalConfigured = () =>
  Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
