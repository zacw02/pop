import Image from "next/image";
import { EVENT } from "@/lib/event";

export default function Footer() {
  return (
    <footer style={{ background: "#0f1d2b", color: "#9fb0be", padding: "44px 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", gap: 26, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Image src="/assets/pop-logo.png" alt="POP" width={150} height={133} style={{ height: 52, width: "auto", background: "#fff", borderRadius: 8, padding: 4 }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
            Prostate On-Site Project
            <br />
            <span style={{ color: "#6f818f" }}>The Drive for Prostate Health · Est. 1999</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#6f818f", textAlign: "right" }}>
          {EVENT.address} · {EVENT.phone}
          <br />
          501(c)(3) EIN {EVENT.ein} · © {new Date().getFullYear()} All Sports Foundation, Inc.
        </div>
      </div>
    </footer>
  );
}
