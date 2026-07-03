import type { Metadata } from "next"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { LandingHero } from "./hero"
import { LandingFeatures } from "./features"
import { LandingHowItWorks } from "./how-it-works"
import { LandingBenefits } from "./benefits"
import { LandingTestimonials } from "./testimonials"
import { LandingTrustedShops } from "./trusted-shops"
import { LandingCTABanner } from "./cta-banner"
import { LandingFAQ } from "./faq"

export const metadata: Metadata = {
  title: "PrintQ - Print Smarter. No WhatsApp Needed.",
  description: "Cloud-based Print Shop Management System. Upload print jobs, track orders, and manage your print shop efficiently.",
}

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingBenefits />
        <LandingTestimonials />
        <LandingTrustedShops />
        <LandingFAQ />
        <LandingCTABanner />
      </main>
      <PublicFooter />
    </>
  )
}
