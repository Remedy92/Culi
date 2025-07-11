import { Header } from "../../components/Header"
import { Features } from "../../components/Features"
import { TranslationDemo } from "../../components/TranslationDemo"
import { Footer } from "../../components/Footer"

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <div className="mx-auto max-w-container-full px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-eerie-black text-center mb-4">
            Features That Transform Your Restaurant
          </h1>
          <p className="text-lg text-eerie-black/80 text-center max-w-container-standard mx-auto mb-16">
            Culi brings cutting-edge AI technology to your menu, creating a seamless dining experience for guests from around the world.
          </p>
        </div>
        <Features />
        <TranslationDemo />
      </main>
      <Footer />
    </>
  );
}