"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { paypalEnabled } from "./PayPalProvider";
import { computeTotal, money, ADULT_FEE, CHILD_FEE, SHIP_TEE_FEE } from "@/lib/pricing";
import { EVENT } from "@/lib/event";

type RegType = "individual" | "join" | "start";
type TeamRow = { name: string; members: number; raised: number; goal: number; rank: number };
type Stats = { participants: number; raised: number };

const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: "",
  numAdults: 1,
  numChildren: 0,
  donation: 0,
  teamName: "",
  teamGoal: 500,
  joinTeam: "",
  mailingStreet: "",
  mailingCity: "",
  mailingState: "",
  mailingZip: "",
};

export default function Walk() {
  const [regType, setRegType] = useState<RegType>("individual");
  const [shirt, setShirt] = useState("L");
  const [form, setForm] = useState({ ...emptyForm });
  const [isSurvivor, setIsSurvivor] = useState(false);
  const [sleepingIn, setSleepingIn] = useState(false);
  const [shipTee, setShipTee] = useState(false);

  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [stats, setStats] = useState<Stats>({ participants: 0, raised: 0 });
  const [success, setSuccess] = useState<null | { firstName: string; summary: string; total: number; paid: boolean }>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const effectiveShip = shipTee || sleepingIn;
  const total = useMemo(
    () => computeTotal({ numAdults: form.numAdults, numChildren: form.numChildren, shipTee: effectiveShip, donation: form.donation }),
    [form.numAdults, form.numChildren, form.donation, effectiveShip]
  );

  const loadTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams", { cache: "no-store" });
      const json = await res.json();
      setTeams(json.teams || []);
      setStats(json.stats || { participants: 0, raised: 0 });
    } catch {
      /* leaderboard is best-effort */
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const buildPayload = useCallback(() => {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      age: form.age,
      shirtSize: shirt,
      isSurvivor,
      registrationType: regType,
      teamName: regType === "join" ? form.joinTeam : regType === "start" ? form.teamName.trim() : "",
      teamGoal: form.teamGoal,
      numAdults: form.numAdults,
      numChildren: form.numChildren,
      sleepingIn,
      shipTee: effectiveShip,
      donation: form.donation,
      mailingStreet: form.mailingStreet.trim(),
      mailingCity: form.mailingCity.trim(),
      mailingState: form.mailingState.trim(),
      mailingZip: form.mailingZip.trim(),
    };
  }, [form, shirt, isSurvivor, regType, sleepingIn, effectiveShip]);

  // Keep the latest payload in a ref so PayPal's createOrder always reads
  // current values without re-rendering the buttons on every keystroke.
  const payloadRef = useRef(buildPayload());
  payloadRef.current = buildPayload();

  const validate = useCallback((): string | null => {
    const p = payloadRef.current;
    if (!p.firstName || !p.lastName) return "Please enter your first and last name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return "Please enter a valid email address.";
    if (regType === "join" && !p.teamName) return "Please choose a team to join.";
    if (regType === "start" && !p.teamName) return "Please name your team.";
    return null;
  }, [regType]);

  const formValid = validate() === null;

  function summaryLine(teamName: string | null | undefined): string {
    if (regType === "start") return `You started team "${teamName}" — invite friends to join and climb the leaderboard.`;
    if (regType === "join") return `You joined "${teamName}". Your ${money(total)} is on the board.`;
    return `You're walking with us — ${money(total)} toward life-saving screenings. Thank you!`;
  }

  async function payAtEvent() {
    const v = validate();
    if (v) return setError(v);
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadRef.current),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not complete registration.");
      finishSuccess(json.firstName, json.teamName, json.total, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  function finishSuccess(firstName: string, teamName: string | null, tot: number, paid: boolean) {
    setSuccess({ firstName, summary: summaryLine(teamName), total: tot, paid });
    loadTeams();
  }

  function resetForm() {
    setSuccess(null);
    setError("");
    setRegType("individual");
    setShirt("L");
    setForm({ ...emptyForm });
    setIsSurvivor(false);
    setSleepingIn(false);
    setShipTee(false);
  }

  const setField = (k: keyof typeof emptyForm, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const numField = (k: keyof typeof emptyForm, v: string, min = 0) =>
    setField(k, Math.max(min, Math.floor(Number(v) || 0)));

  return (
    <section id="walk" style={{ position: "relative", padding: "84px 0", background: "linear-gradient(180deg,#1c78c0 0%,#155a94 100%)", color: "#fff", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(135deg,rgba(255,255,255,.04) 0 22px,transparent 22px 44px)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <div style={{ maxWidth: 700, marginBottom: 38 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.14)", color: "#fff", fontWeight: 600, fontSize: 13, padding: "6px 14px", borderRadius: 999, marginBottom: 18 }}>
            The Drive for Prostate Health · {EVENT.dateShort}
          </div>
          <h2 style={{ fontSize: "clamp(32px,4vw,50px)", fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Walk with us. Every step funds a screening.
          </h2>
          <p style={{ fontSize: 18, color: "#dbe9f7", textWrap: "pretty" }}>
            {EVENT.name} · {EVENT.dateLong} at {EVENT.location}. Register as an individual, join a team, or rally your
            own family or company — ${EVENT.adultFee} per adult, ${EVENT.childFee} per child under 12, and your event
            t-shirt is included.
          </p>
        </div>

        <div className="walk-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr .95fr", gap: 26, alignItems: "start" }}>
          {/* FORM CARD */}
          <div style={{ background: "#fff", color: "#16283a", borderRadius: 22, padding: 30, boxShadow: "0 30px 60px rgba(10,50,90,.28)" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "14px 6px 8px" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e7f6ec", color: "#1f9d55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px" }}>✓</div>
                <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>You&apos;re registered, {success.firstName}!</h3>
                <p style={{ fontSize: 16, color: "#5a6b79", marginBottom: 6 }}>{success.summary}</p>
                <p style={{ fontSize: 15, color: "#5a6b79", marginBottom: 6 }}>
                  {success.paid
                    ? `Payment of ${money(success.total)} received — thank you!`
                    : `Balance due: ${money(success.total)} — pay at the event or mail a check to POP.`}
                </p>
                <p style={{ fontSize: 15, color: "#5a6b79", marginBottom: 22 }}>A confirmation and event details are on the way. See you at the starting line.</p>
                <button onClick={resetForm} style={{ background: "#1c78c0", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 11, border: "none", cursor: "pointer" }}>
                  Register someone else
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 23, fontWeight: 800, marginBottom: 4 }}>Register for the Walk</h3>
                <p style={{ fontSize: 14.5, color: "#6b7885", marginBottom: 22 }}>
                  ${EVENT.adultFee} adult · ${EVENT.childFee} child (under 12) · event t-shirt included · 100% tax-deductible.
                </p>

                {/* Type toggle */}
                <div style={{ fontSize: 13, fontWeight: 700, color: "#425263", marginBottom: 9, textTransform: "uppercase", letterSpacing: ".05em" }}>I want to…</div>
                <div className="type-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 22 }}>
                  {([["individual", "Register solo"], ["join", "Join a team"], ["start", "Start a team"]] as [RegType, string][]).map(([t, label]) => (
                    <button key={t} type="button" onClick={() => setRegType(t)} style={toggleStyle(regType === t)}>
                      {label}
                    </button>
                  ))}
                </div>

                {regType === "join" && (
                  <div style={{ marginBottom: 18 }}>
                    <Label>Choose a team / family to join</Label>
                    <select value={form.joinTeam} onChange={(e) => setField("joinTeam", e.target.value)} required style={{ ...inputStyle, background: "#fff" }}>
                      <option value="">Select a team…</option>
                      {teams.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    {teams.length === 0 && <p style={{ fontSize: 12.5, color: "#9aa6b0", marginTop: 6 }}>No teams yet — be the first to start one!</p>}
                  </div>
                )}

                {regType === "start" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 18 }}>
                    <div>
                      <Label>Team / family name</Label>
                      <input value={form.teamName} onChange={(e) => setField("teamName", e.target.value)} placeholder="e.g. The Prostate Pacers" style={inputStyle} />
                    </div>
                    <div>
                      <Label>Fundraising goal</Label>
                      <input value={form.teamGoal} onChange={(e) => numField("teamGoal", e.target.value)} type="number" min={0} step={50} placeholder="$1,000" style={inputStyle} />
                    </div>
                  </div>
                )}

                {/* Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <Label>First name</Label>
                    <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} required placeholder="First" style={inputStyle} />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} required placeholder="Last" style={inputStyle} />
                  </div>
                </div>

                {/* Email / phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <Label>Email</Label>
                    <input value={form.email} onChange={(e) => setField("email", e.target.value)} type="email" required placeholder="you@email.com" style={inputStyle} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} type="tel" placeholder="(480) 555-0123" style={inputStyle} />
                  </div>
                </div>

                {/* Counts + age */}
                <div className="count-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <Label>Adults (12 &amp; over)</Label>
                    <input value={form.numAdults} onChange={(e) => numField("numAdults", e.target.value, 1)} type="number" min={1} style={inputStyle} />
                  </div>
                  <div>
                    <Label>Children (under 12)</Label>
                    <input value={form.numChildren} onChange={(e) => numField("numChildren", e.target.value, 0)} type="number" min={0} style={inputStyle} />
                  </div>
                  <div>
                    <Label>Your age</Label>
                    <input value={form.age} onChange={(e) => setField("age", e.target.value)} type="number" min={0} placeholder="—" style={inputStyle} />
                  </div>
                </div>

                {/* Mailing address */}
                <div style={{ marginBottom: 14 }}>
                  <Label>Mailing address (optional)</Label>
                  <input value={form.mailingStreet} onChange={(e) => setField("mailingStreet", e.target.value)} placeholder="Street" style={{ ...inputStyle, marginBottom: 8 }} />
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
                    <input value={form.mailingCity} onChange={(e) => setField("mailingCity", e.target.value)} placeholder="City" style={inputStyle} />
                    <input value={form.mailingState} onChange={(e) => setField("mailingState", e.target.value)} placeholder="State" style={inputStyle} />
                    <input value={form.mailingZip} onChange={(e) => setField("mailingZip", e.target.value)} placeholder="Zip" style={inputStyle} />
                  </div>
                </div>

                {/* Shirt size */}
                <div style={{ marginBottom: 16 }}>
                  <Label>T-shirt size</Label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {SHIRT_SIZES.map((sz) => (
                      <button key={sz} type="button" onClick={() => setShirt(sz)} style={sizeStyle(shirt === sz)}>{sz}</button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  <Check checked={isSurvivor} onChange={setIsSurvivor} label="I am a prostate cancer survivor" />
                  <Check checked={sleepingIn} onChange={(v) => { setSleepingIn(v); if (v) setShipTee(true); }} label={`"I can't walk, I'm sleeping in!" — mail my t-shirt (+$${SHIP_TEE_FEE})`} />
                  {!sleepingIn && <Check checked={shipTee} onChange={setShipTee} label={`Ship my t-shirt to me (+$${SHIP_TEE_FEE})`} />}
                </div>

                {/* Donation */}
                <div style={{ marginBottom: 20 }}>
                  <Label>Add a donation (optional)</Label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#6b7885", fontSize: 15 }}>$</span>
                    <input value={form.donation || ""} onChange={(e) => setField("donation", Math.max(0, Number(e.target.value) || 0))} type="number" min={0} step={5} placeholder="0" style={{ ...inputStyle, paddingLeft: 26 }} />
                  </div>
                </div>

                {/* Total */}
                <div style={{ background: "#f6f8fb", border: "1px solid #e8edf2", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                  <Row k={`Adults · ${form.numAdults} × $${ADULT_FEE}`} v={money(form.numAdults * ADULT_FEE)} />
                  {form.numChildren > 0 && <Row k={`Children · ${form.numChildren} × $${CHILD_FEE}`} v={money(form.numChildren * CHILD_FEE)} />}
                  {effectiveShip && <Row k="Ship t-shirt" v={money(SHIP_TEE_FEE)} />}
                  {form.donation > 0 && <Row k="Donation" v={money(form.donation)} />}
                  <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, color: "#1c78c0" }}>{money(total)}</span>
                  </div>
                </div>

                {error && <p style={{ color: "#c0392b", fontSize: 13.5, marginBottom: 12, textAlign: "center" }}>{error}</p>}

                {/* Payment */}
                {paypalEnabled && (
                  <div style={{ marginBottom: 14, opacity: formValid ? 1 : 0.55, pointerEvents: formValid ? "auto" : "none" }}>
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 48 }}
                      disabled={!formValid || submitting}
                      forceReRender={[total, regType]}
                      createOrder={async () => {
                        const v = validate();
                        if (v) { setError(v); throw new Error(v); }
                        setError("");
                        const res = await fetch("/api/paypal/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payloadRef.current),
                        });
                        const json = await res.json();
                        if (!res.ok) { setError(json.error || "Could not start checkout."); throw new Error(json.error); }
                        return json.id as string;
                      }}
                      onApprove={async (data) => {
                        setSubmitting(true);
                        try {
                          const res = await fetch("/api/paypal/capture-order", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: data.orderID, registration: payloadRef.current }),
                          });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "Payment could not be finalized.");
                          finishSuccess(json.firstName, json.teamName, json.total, true);
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Payment error.");
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      onError={() => setError("PayPal ran into a problem. You can also register and pay at the event below.")}
                    />
                    <div style={{ textAlign: "center", color: "#9aa6b0", fontSize: 12.5, margin: "6px 0" }}>— or —</div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={payAtEvent}
                  disabled={submitting || !formValid}
                  style={{ width: "100%", background: "#1c78c0", color: "#fff", fontWeight: 800, fontSize: 16.5, padding: 16, borderRadius: 12, border: "none", cursor: submitting || !formValid ? "not-allowed" : "pointer", opacity: submitting || !formValid ? 0.65 : 1, boxShadow: "0 10px 22px rgba(28,120,192,.28)" }}
                >
                  {submitting ? <span className="spinner" /> : `Register — pay ${money(total)} at the event`}
                </button>
                <p style={{ fontSize: 12.5, color: "#9aa6b0", textAlign: "center", marginTop: 12 }}>
                  {paypalEnabled
                    ? "Pay now securely with PayPal or any card, or reserve your spot and pay at check-in."
                    : "Reserve your spot now and pay at check-in, or mail a check to POP."}
                </p>
              </div>
            )}
          </div>

          {/* STATS + LEADERBOARD */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <StatTile value={String(stats.participants)} label="walkers registered" />
              <StatTile value={money(stats.raised)} label="raised so far" />
            </div>
            <div style={{ background: "#fff", color: "#16283a", borderRadius: 18, padding: 22, boxShadow: "0 20px 44px rgba(10,50,90,.22)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Team leaderboard</h3>
                <span style={{ fontSize: 12.5, color: "#6b7885", fontWeight: 600 }}>{teams.length} {teams.length === 1 ? "team" : "teams"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {teams.length === 0 && <p style={{ fontSize: 14, color: "#6b7885", textAlign: "center", padding: "10px 0" }}>No teams yet — start one and lead the board!</p>}
                {teams.map((team) => (
                  <div key={team.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", background: "#f6f8fb", border: "1px solid #e8edf2", borderRadius: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "#e7f1fb", color: "#1c78c0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 15 }}>{team.rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</div>
                      <div style={{ fontSize: 12.5, color: "#6b7885" }}>{team.members} {team.members === 1 ? "walker" : "walkers"}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1c78c0" }}>{money(team.raised)}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: "#9aa6b0", marginTop: 14, textAlign: "center" }}>Register a team above to climb the board.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- little presentational helpers --- */
const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 13px", border: "1px solid #d8dde2", borderRadius: 10, fontSize: 15 };

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 13, fontWeight: 700, color: "#425263", display: "block", marginBottom: 6 }}>{children}</label>;
}
function toggleStyle(active: boolean): React.CSSProperties {
  return { padding: "11px 8px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", border: `1.5px solid ${active ? "#1c78c0" : "#dbe1e7"}`, background: active ? "#1c78c0" : "#fff", color: active ? "#fff" : "#425263" };
}
function sizeStyle(active: boolean): React.CSSProperties {
  return { padding: "9px 16px", borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: "pointer", border: `1.5px solid ${active ? "#1c78c0" : "#dbe1e7"}`, background: active ? "#1c78c0" : "#fff", color: active ? "#fff" : "#425263" };
}
function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "#425263" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#1c78c0", cursor: "pointer" }} />
      {label}
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#5a6b79", padding: "2px 0" }}>
      <span>{k}</span>
      <span style={{ fontWeight: 600, color: "#16283a" }}>{v}</span>
    </div>
  );
}
function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 16, padding: 18 }}>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 34, color: "#fff" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#dbe9f7", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
