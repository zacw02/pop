"use client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// Loads the PayPal JS SDK once for the whole page. If no client id is set yet,
// this is a transparent passthrough (buttons fall back to "pay at event").
export const paypalEnabled = Boolean(CLIENT_ID);

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  if (!CLIENT_ID) return <>{children}</>;
  return (
    <PayPalScriptProvider
      options={{ clientId: CLIENT_ID, currency: "USD", intent: "capture" }}
    >
      {children}
    </PayPalScriptProvider>
  );
}
