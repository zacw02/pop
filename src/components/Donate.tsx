"use client";
import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { paypalEnabled } from "./PayPalProvider";
import { EVENT } from "@/lib/event";

const PRESETS = [50, 100, 250, 500];

export default function Donate() {
  const [amount, setAmount] = useState(100);
  const [thanks, setThanks] = useState(false);

  const amt = (v: number) => ({
    background: amount === v ? "#e0a638" : "#16283a",
    color: amount === v ? "#16283a" : "#cdd9e3",
    border: `1.5px solid ${amount === v ? "#e0a638" : "#35506a"}`,
    padding: "13px 4px",
    borderRadius: 11,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
  });

  return (
    <section id="donate" style={{ background: "#16283a", color: "#fff", padding: "84px 0" }}>
      <div className="two-col" style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "#e0a638", marginBottom: 14 }}>
            Donate
          </div>
          <h2 style={{ fontSize: "clamp(30px,3.8vw,46px)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Your gift puts a man on the mobile unit.
          </h2>
          <p style={{ fontSize: 18, color: "#b9c6d3", marginBottom: 12, textWrap: "pretty" }}>
            Tax-deductible donations fund our mobile medical screening facility. We travel throughout Arizona giving
            simple, low- or no-cost prostate exams — and your support covers screenings for men who could never
            otherwise afford one.
          </p>
          <p style={{ fontSize: 14, color: "#8697a6" }}>
            All Sports Foundation, Inc. dba Prostate On-Site Project · 501(c)(3) · EIN {EVENT.ein}. Donations are
            tax-deductible to the extent allowed by law.
          </p>
        </div>
        <div style={{ background: "#1e3040", border: "1px solid #2c4256", borderRadius: 22, padding: 30 }}>
          {thanks ? (
            <div style={{ textAlign: "center", padding: "20px 6px" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(224,166,56,.18)", color: "#e0a638", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px" }}>
                ♥
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Thank you!</h3>
              <p style={{ fontSize: 14.5, color: "#9fb0be", marginBottom: 18 }}>
                Your donation helps a man get screened. A receipt is on its way from PayPal.
              </p>
              <button onClick={() => setThanks(false)} style={{ background: "transparent", color: "#e0a638", border: "1px solid #35506a", padding: "10px 20px", borderRadius: 11, fontWeight: 700, cursor: "pointer" }}>
                Give again
              </button>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Give what you can</h3>
              <p style={{ fontSize: 14.5, color: "#9fb0be", marginBottom: 20 }}>Every dollar goes toward screenings and early detection.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {PRESETS.map((v) => (
                  <button key={v} type="button" onClick={() => setAmount(v)} style={amt(v)}>
                    ${v}
                  </button>
                ))}
              </div>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8697a6", fontSize: 16 }}>$</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  type="number"
                  min={1}
                  style={{ width: "100%", padding: "15px 14px 15px 28px", border: "1px solid #35506a", background: "#16283a", color: "#fff", borderRadius: 12, fontSize: 17, fontWeight: 700 }}
                />
              </div>

              {paypalEnabled && amount > 0 ? (
                <div style={{ colorScheme: "light" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "donate" }}
                    forceReRender={[amount]}
                    fundingSource={undefined}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: { currency_code: "USD", value: amount.toFixed(2) },
                            description: "Donation — Prostate On-Site Project",
                          },
                        ],
                      })
                    }
                    onApprove={async (_data, actions) => {
                      if (actions.order) await actions.order.capture();
                      setThanks(true);
                    }}
                  />
                </div>
              ) : (
                <div>
                  <button disabled style={{ width: "100%", background: "#e0a638", color: "#16283a", fontWeight: 800, fontSize: 16.5, padding: 16, borderRadius: 12, border: "none", opacity: 0.6, cursor: "not-allowed" }}>
                    Donate ${amount.toLocaleString()}
                  </button>
                  <p style={{ fontSize: 12.5, color: "#7f909e", textAlign: "center", marginTop: 12 }}>
                    Online donations turn on once PayPal is connected. For now, call {EVENT.phone} or mail a check to POP.
                  </p>
                </div>
              )}
              {paypalEnabled && (
                <p style={{ fontSize: 12.5, color: "#7f909e", textAlign: "center", marginTop: 12 }}>
                  Secure checkout by PayPal — you can also pay by card. Or mail a check to the address below.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
