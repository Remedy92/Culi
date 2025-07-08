import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { Features } from "./components/Features"
import { TranslationDemo } from "./components/TranslationDemo"
import { HowItWorks } from "./components/HowItWorks"
import { WhyRestaurantsBento } from "./components/WhyRestaurantsBento"
import { CTASection } from "./components/CTASection"
import { Footer } from "./components/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <TranslationDemo />
        <HowItWorks />
        <WhyRestaurantsBento />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
