import React from "react"
import { useRouter } from "expo-router"

import { AnimatedSection } from "../componants/landing/AnimatedSection"
import { HeroSection } from "../componants/landing/HeroSection"
import { DashboardPreview } from "../componants/landing/DashboardPreview"
import { BentoSection } from "../componants/landing/BentoSection"
import { PricingSection } from "../componants/landing/PricingSection"
import { FAQSection } from "../componants/landing/FAQSection"
import { CTASection } from "../componants/landing/CTASection"
import { FooterSection } from "../componants/landing/FooterSection"


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden overflow-y-auto pb-0">
      <div className="relative z-10">
        <main className="max-w-[1320px] mx-auto relative">
          <HeroSection />
          <div className="relative top-[-50px] md:top-[-200px] left-1/2 transform -translate-x-1/2 z-30 mb-[-50px] md:mb-[-200px] flex justify-center">
            <AnimatedSection>
              <DashboardPreview />
            </AnimatedSection>
          </div>
        </main>
        
        {/* Features Section */}
        <AnimatedSection
          id="features-section"
          className="relative z-10 max-w-[1320px] mx-auto px-0 md:px-6 mt-16 md:mt-24"
          delay={0.1}
        >
          <BentoSection />
        </AnimatedSection>
        
        {/* Pricing Section */}
        <AnimatedSection
          id="pricing-section"
          className="relative z-10 max-w-[1320px] mx-auto mt-16 md:mt-24 px-6"
          delay={0.1}
        >
          <PricingSection />
        </AnimatedSection>
        
        {/* FAQ Section */}
        <AnimatedSection
          id="faq-section" 
          className="relative z-10 max-w-[1320px] mx-auto mt-16 md:mt-24 px-6" 
          delay={0.1}
        >
          <FAQSection />
        </AnimatedSection>
        
        {/* CTA Section */}
        <AnimatedSection
          className="relative z-10 max-w-[1320px] mx-auto mt-16 md:mt-24 px-6" 
          delay={0.1}
        >
          <CTASection />
        </AnimatedSection>
        
        {/* Footer Section */}
        <AnimatedSection 
          className="relative z-10 max-w-[1320px] mx-auto mt-16 md:mt-24 px-6" 
          delay={0.1}
        >
          <FooterSection />
        </AnimatedSection>
      </div>
    </div>
  )
}
