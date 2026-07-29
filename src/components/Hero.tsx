import Image from "next/image";
import { EVENT } from "@/lib/event";

export default function Hero() {
  return (
    <>
      <a id="top" />
      <header
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg,#e7f1fb 0%,#f4f9ff 45%,#f7f6f2 100%)",
        }}
      >
        <div
          className="herogrid"
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "56px 24px 68px",
            display: "grid",
            gridTemplateColumns: "1.05fr .95fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <div style={{ animation: "fadeUp .7s ease both" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "#fff",
                border: "1px solid #d5e6f7",
                color: "#155a94",
                fontWeight: 600,
                fontSize: 13,
                padding: "6px 14px",
                borderRadius: 999,
                marginBottom: 20,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#1c78c0", display: "inline-block" }} />
              Arizona&apos;s mobile prostate screening nonprofit · since 1999
            </div>
            <h1 style={{ fontSize: "clamp(38px,5.2vw,62px)", fontWeight: 800, marginBottom: 18, textWrap: "balance" }}>
              Early detection makes prostate cancer nearly 100% survivable.
            </h1>
            <p style={{ fontSize: 19, color: "#425263", maxWidth: 540, marginBottom: 26, textWrap: "pretty" }}>
              Join hundreds of survivors, families, and supporters at the{" "}
              <strong style={{ color: "#16283a" }}>{EVENT.name}</strong>. Every registration and dollar puts a man
              on the mobile unit for a life-saving 15-minute check.
            </p>

            {/* WALK INFO CARD */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #d9e7f5",
                borderRadius: 18,
                padding: "18px 20px",
                boxShadow: "0 16px 34px rgba(21,90,148,.10)",
                marginBottom: 26,
                maxWidth: 560,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px 26px", marginBottom: 14 }}>
                <InfoItem icon="📅" label="Date" value={EVENT.dateLong} />
                <InfoItem icon="📍" label="Location" value={EVENT.location} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {EVENT.schedule.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#eef4f0",
                      borderRadius: 9,
                      padding: "7px 11px",
                      fontSize: 12.5,
                      color: "#16283a",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: "#1c78c0" }}>{s.time}</span> · {s.label}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "6px 14px",
                  fontSize: 13.5,
                  color: "#5a6b79",
                  borderTop: "1px solid #eef1f4",
                  paddingTop: 12,
                }}
              >
                <span>
                  <strong style={{ color: "#16283a" }}>${EVENT.adultFee}</strong> adult
                </span>
                <span style={{ color: "#c9d2da" }}>•</span>
                <span>
                  <strong style={{ color: "#16283a" }}>${EVENT.childFee}</strong> child (under 12)
                </span>
                <span style={{ color: "#c9d2da" }}>•</span>
                <span style={{ color: "#1c78c0", fontWeight: 700 }}>
                  First {EVENT.freeScreenings} to register get a FREE screening
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a
                href="#walk"
                style={{
                  background: "#1c78c0",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "15px 28px",
                  borderRadius: 12,
                  boxShadow: "0 10px 24px rgba(28,120,192,.28)",
                }}
              >
                Register for the Walk
              </a>
              <a
                href="#program"
                style={{
                  background: "#fff",
                  color: "#16283a",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "15px 28px",
                  borderRadius: 12,
                  border: "1px solid #dfdbd0",
                }}
              >
                Find a screening
              </a>
            </div>

            <div style={{ display: "flex", gap: 34, marginTop: 40, flexWrap: "wrap" }}>
              <Stat number="25+" label="years of service" />
              <Stat number="2" label="mobile screening units" />
              <Stat number="15 min" label="to a life-saving check" />
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ position: "relative", animation: "fadeUp .9s ease both" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: "0 30px 60px rgba(21,90,148,.18)",
                border: "1px solid #d9e7f5",
                aspectRatio: "4 / 3",
              }}
            >
              <Image
                src="/assets/pop-mobile-unit.jpg"
                alt="Prostate On-Site Project mobile screening unit at the Walk"
                fill
                sizes="(max-width: 920px) 100vw, 540px"
                style={{ objectFit: "cover" }}
                priority
              />
              {/* Date chip */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  background: "#1c78c0",
                  color: "#fff",
                  borderRadius: 14,
                  padding: "10px 16px",
                  textAlign: "center",
                  boxShadow: "0 10px 24px rgba(10,50,90,.28)",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 24, lineHeight: 1 }}>SEP 26</div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", opacity: 0.9 }}>2026</div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -22,
                left: -22,
                background: "#fff",
                borderRadius: 16,
                padding: "16px 20px",
                boxShadow: "0 16px 34px rgba(21,90,148,.16)",
                border: "1px solid #eae6dc",
                animation: "floaty 5s ease-in-out infinite",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7885", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                1 in 7 men
              </div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "#16283a" }}>
                will be diagnosed in their lifetime
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#e7f1fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {icon}
      </span>
      <span>
        <span style={{ display: "block", fontSize: 11.5, color: "#6b7885", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
          {label}
        </span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#16283a" }}>{value}</span>
      </span>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 32, color: "#1c78c0" }}>{number}</div>
      <div style={{ fontSize: 13.5, color: "#6b7885", fontWeight: 500 }}>{label}</div>
    </div>
  );
}
