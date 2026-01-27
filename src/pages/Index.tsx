import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrustBadges } from "@/components/home/TrustBadges";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { StatsSection } from "@/components/home/StatsSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <LogoMarquee />
      <FeaturedProducts />
      <TrustBadges />
      <StatsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
