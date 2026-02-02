import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartPanel } from '@/components/CartPanel';
import { HeroSection } from '@/components/sections/HeroSection';
import { WhatIsAionSection } from '@/components/sections/WhatIsAionSection';
import { TheRingSection } from '@/components/sections/TheRingSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { IntelligenceSection } from '@/components/sections/IntelligenceSection';
import { ConsumerSection } from '@/components/sections/ConsumerSection';
import { HealthcareSection } from '@/components/sections/HealthcareSection';
import { PrivacySection } from '@/components/sections/PrivacySection';
import { FinalCTASection } from '@/components/sections/FinalCTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartPanel />
      
      <main>
        <HeroSection />
        <WhatIsAionSection />
        <TheRingSection />
        <FeaturesSection />
        <IntelligenceSection />
        <ConsumerSection />
        <HealthcareSection />
        <PrivacySection />
        <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
