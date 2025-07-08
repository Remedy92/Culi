import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { Features } from "./components/Features"
import { TranslationDemo } from "./components/TranslationDemo"
import { HowItWorks } from "./components/HowItWorks"
import { WhyRestaurants } from "./components/WhyRestaurants"
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
        <WhyRestaurants />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
