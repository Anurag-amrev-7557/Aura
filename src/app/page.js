import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import Background from "@/components/landing/Background";
import Logos from "@/components/landing/Logos";
import Highlights from "@/components/landing/Highlights";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import PricingTeaser from "@/components/landing/PricingTeaser";
import FAQ from "@/components/landing/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Background />
      <main>
        <Hero />
        <Logos />
        <Highlights />
        <Features />
        <HowItWorks />
        <Testimonials />
        <PricingTeaser />
        <FAQ />
        <CTA />
      </main>
    </div>
  );
}
