const steps = [
  ["1", "Register", "Book at an upcoming event or call us. Men 40+ (or 35+ with family history) should screen annually."],
  ["2", "Get screened", "A quick, private 15-minute PSA blood test and DRE on board the mobile unit — no appointment marathon, no big bill."],
  ["3", "Follow up", "Results come with clear guidance. If something looks off, we help you find the right next step — early."],
];

export default function Program() {
  return (
    <section id="program" style={{ background: "#eef4f0", marginTop: 70, padding: "80px 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ maxWidth: 640, marginBottom: 44 }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "#1c78c0", marginBottom: 14 }}>
            The Screening Program
          </div>
          <h2 style={{ fontSize: "clamp(30px,3.6vw,44px)", fontWeight: 700, marginBottom: 16 }}>We bring the exam to you.</h2>
          <p style={{ fontSize: 18, color: "#3d4d5c", textWrap: "pretty" }}>
            Our two mobile units — the &ldquo;POP&rdquo; — travel throughout Arizona giving simple, low- or no-cost
            prostate exams. Here&apos;s how a screening works.
          </p>
        </div>
        <div className="cards-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {steps.map(([n, title, body]) => (
            <div key={n} style={{ background: "#fff", borderRadius: 18, padding: 28, border: "1px solid #e2e8e4" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e7f1fb", color: "#1c78c0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20, marginBottom: 18 }}>
                {n}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 15, color: "#5a6b79" }}>{body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26, background: "#fff", border: "1px solid #e2e8e4", borderRadius: 18, padding: "26px 28px", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Want a screening near you — or at your workplace?</h3>
            <p style={{ fontSize: 15, color: "#5a6b79" }}>We schedule on-site events for companies, unions, and community groups across Arizona.</p>
          </div>
          <a href="#contact" style={{ background: "#1c78c0", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 24px", borderRadius: 11, whiteSpace: "nowrap" }}>
            Request a screening
          </a>
        </div>
      </div>
    </section>
  );
}
