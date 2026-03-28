import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { BentoBox } from "@/components/landing/bento-box";
import { MomentumSection } from "@/components/landing/momentum-section";
import { ConversionSection, Footer } from "@/components/landing/footer-section";

export default async function Home() {
    return (
        <main className="min-h-screen bg-[#0A0A0B] text-white selection:bg-primary/30 selection:text-white overflow-x-clip">
            <Navbar />
            <Hero />
            <ProblemSection />
            <FeatureShowcase />
            <BentoBox />
            <MomentumSection />
            <ConversionSection />
            <Footer />
        </main>
    );
}
