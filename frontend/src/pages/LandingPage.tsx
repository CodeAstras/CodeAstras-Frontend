import {
    Header,
    HeroSection,
    FeaturesGallery,
    InteractiveCodeBlock,
    PricingSection,
    Footer,
    CosmicBackground,
    ThematicFloatingElements,
    ScrollProgress,
    InteractiveCosmicStars,
} from "../services";

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
            <ScrollProgress />
            <CosmicBackground />
            <ThematicFloatingElements />
            <InteractiveCosmicStars />

            <div className="relative z-10">
                <Header />
                <HeroSection />
                <FeaturesGallery />
                <InteractiveCodeBlock />
                <PricingSection />
                <Footer />
            </div>
        </div>
    );
}
