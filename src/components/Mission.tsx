const cards = [
  ["Educate", "on the value of early detection"],
  ["Screen", "simply, on-site, statewide"],
  ["Support", "men and families through it"],
];

export default function Mission() {
  return (
    <section id="mission" style={{ maxWidth: 1120, margin: "0 auto", padding: "90px 24px 30px" }}>
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 56, alignItems: "start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "#1c78c0", marginBottom: 14 }}>
            Our Mission
          </div>
          <h2 style={{ fontSize: "clamp(30px,3.6vw,44px)", fontWeight: 700 }}>
            To improve the quality of life for men and their families through education and early detection.
          </h2>
        </div>
        <div>
          <p style={{ fontSize: 18, color: "#3d4d5c", marginBottom: 18, textWrap: "pretty" }}>
            Prostate cancer often develops without symptoms. Annual testing with PSA and DRE can catch it early — while
            it&apos;s still confined to the prostate and far more curable. That&apos;s the whole reason POP exists.
          </p>
          <p style={{ fontSize: 18, color: "#3d4d5c", marginBottom: 26, textWrap: "pretty" }}>
            Founded in 1999 as a 501(c)(3) nonprofit, the Prostate On-Site Project operates two mobile screening units
            that travel the state of Arizona, making annual screenings easier and more convenient by coming to
            workplaces, health fairs, and community events — and helping reduce out-of-pocket costs for uninsured and
            under-insured men.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {cards.map(([title, sub]) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #eae6dc", borderRadius: 14, padding: 18 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 26, color: "#16283a" }}>{title}</div>
                <div style={{ fontSize: 13.5, color: "#6b7885", marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
