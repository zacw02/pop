import type { Metadata } from "next";
import { Bricolage_Grotesque, Libre_Franklin } from "next/font/google";
import PayPalProvider from "@/components/PayPalProvider";
import "./globals.css";

const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});
const body = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prostate On-Site Project — 17th Annual Tim Barber Walk for POP",
  description:
    "Join the 17th Annual Tim Barber Walk for POP — Saturday, September 26, 2026 at Tempe Kiwanis Park. Register solo, join a team, or start one. Every step funds a life-saving prostate screening.",
  openGraph: {
    title: "Walk for POP — Saturday, September 26, 2026",
    description:
      "Register for the 17th Annual Tim Barber Walk for POP at Tempe Kiwanis Park. Early detection makes prostate cancer nearly 100% survivable.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <PayPalProvider>{children}</PayPalProvider>
      </body>
    </html>
  );
}
