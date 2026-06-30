"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero";
import { WhySection } from "@/components/landing/why";
import { FeaturesSection } from "@/components/landing/features";
import { CTASection } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <WhySection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
