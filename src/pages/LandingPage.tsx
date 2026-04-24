import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProductShowcase } from '@/components/landing/ProductShowcase'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TestimonialSection } from '@/components/landing/TestimonialSection'
import { CtaBanner } from '@/components/landing/CtaBanner'

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProductShowcase />
        <HowItWorks />
        <TestimonialSection />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
