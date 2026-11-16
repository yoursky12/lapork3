
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import Hero from "../components/home/Hero";
import FeatureCards from "../components/home/FeatureCards";
import AboutSection from "../components/home/AboutSection";
import DataSection from "../components/home/DataSection";
import HowToReport from "../components/home/Lapor";

export default function Home() {
return (
  <>
    {/* Navbar tetap menempel di atas */}
    <Navbar />

    <main>
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1765D1] via-[#287DE0] to-[#62A9F2]">
        <Hero />
      </div>

      {/* Section lainnya */}
      <FeatureCards />
      <AboutSection />
      <DataSection />
      <HowToReport />
    </main>

    <Footer />
  </>
);

}
