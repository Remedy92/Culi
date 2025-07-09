import { Header } from "../../components/Header"
import { Pricing } from "../../components/Pricing"
import { Footer } from "../../components/Footer"

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}