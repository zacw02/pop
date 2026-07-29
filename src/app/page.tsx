import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Program from "@/components/Program";
import Walk from "@/components/Walk";
import Stories from "@/components/Stories";
import Donate from "@/components/Donate";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <Nav />
      <Hero />
      <Mission />
      <Program />
      <Walk />
      <Stories />
      <Donate />
      <Contact />
      <Footer />
    </div>
  );
}
