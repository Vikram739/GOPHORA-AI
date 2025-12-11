import React from 'react'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import HeroSection from './HeroSection'
import HowItWorks from './HowItWorks'
import Opportunities from './Opportunities'
import PricingPlans from './PricingPlans'
import Testimonials from './Testimonials'

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1  ">
        <HeroSection/>
        <HowItWorks/>
        <Opportunities/>
        <PricingPlans/>
        <Testimonials/>
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
