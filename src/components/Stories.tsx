const quotes = [
  [
    "This program was responsible for the early detection of my prostate cancer. Nearly two years post-surgery, I'm cancer free. I highly recommend this screening.",
    "GDMS Employee",
  ],
  [
    "My PSA was low; however Dr. Chan found an abnormality. Long story short, he probably saved my life by detecting this cancer in the very early stages. My da Vinci procedure was highly successful.",
    "William Whiting",
  ],
  [
    "The screening showed my PSA had doubled in less than a year. A biopsy revealed prostate cancer. I've since had surgery with a very good prognosis. I encourage every man 40 and older to screen yearly.",
    "Dennis Jeter",
  ],
];

export default function Stories() {
  return (
    <section id="stories" style={{ maxWidth: 1120, margin: "0 auto", padding: "90px 24px" }}>
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 46px" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "#1c78c0", marginBottom: 14 }}>
          Survivor Stories
        </div>
        <h2 style={{ fontSize: "clamp(30px,3.6vw,44px)", fontWeight: 700, marginBottom: 14 }}>A 15-minute check changed everything.</h2>
        <p style={{ fontSize: 18, color: "#3d4d5c" }}>In their own words — men whose cancer was caught early because they got screened.</p>
      </div>
      <div className="cards-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {quotes.map(([quote, who]) => (
          <figure key={who} style={{ background: "#fff", border: "1px solid #eae6dc", borderRadius: 18, padding: 28, display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#1c78c0", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 44, lineHeight: 0.6, marginBottom: 8 }}>&ldquo;</div>
            <blockquote style={{ fontSize: 16, color: "#354656", lineHeight: 1.6, marginBottom: 18, flex: 1, textWrap: "pretty" }}>{quote}</blockquote>
            <figcaption style={{ fontWeight: 700, fontSize: 15 }}>{who}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
