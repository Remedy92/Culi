"use client"

import { motion } from "framer-motion"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { NumberTicker } from "../components/ui/number-ticker"
import { AnimatedCircularProgressBar } from "../components/ui/animated-circular-progress-bar"
import { MagicCard } from "../components/ui/magic-card"
import { AnimatedGradientText } from "../components/ui/animated-gradient-text"
import { BlurFade } from "../components/ui/blur-fade"
import { Calendar, MessageSquare, Eye, DollarSign } from "lucide-react"

export default function AnalyticsDemoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-seasalt pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-16">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-spanish-orange/5 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-warm-taupe/5 blur-3xl" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 text-center">
            <BlurFade delay={0.1} inView>
              <AnimatedGradientText className="mb-4">
                Analytics Dashboard
              </AnimatedGradientText>
            </BlurFade>
            
            <BlurFade delay={0.2} inView>
              <h1 className="text-4xl sm:text-5xl font-bold text-dark-umber mb-4">
                Your Restaurant Insights
              </h1>
            </BlurFade>
            
            <BlurFade delay={0.3} inView>
              <p className="text-lg text-dark-umber/70 max-w-2xl mx-auto">
                Track guest interactions, popular dishes, and usage metrics in real-time
              </p>
            </BlurFade>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="relative pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Menu Views Card */}
              <BlurFade delay={0.4} inView>
                <MagicCard 
                  className="p-6 bg-white border-0 shadow-soft hover:shadow-warm transition-all duration-300 h-full"
                  gradientColor="rgba(245, 103, 39, 0.1)"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-terracotta/10">
                        <Eye className="h-5 w-5 text-terracotta" />
                      </div>
                      <span className="text-xs text-cinereous flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        This month
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-dark-umber/70 mb-1">Menu Views</h3>
                    <div className="text-3xl font-bold text-dark-umber">
                      <NumberTicker value={12847} />
                    </div>
                    <p className="text-xs text-terracotta mt-2">+24% from last month</p>
                  </div>
                </MagicCard>
              </BlurFade>

              {/* Culi Interactions Card */}
              <BlurFade delay={0.5} inView>
                <MagicCard 
                  className="p-6 bg-white border-0 shadow-soft hover:shadow-warm transition-all duration-300 h-full"
                  gradientColor="rgba(222, 190, 136, 0.1)"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-warm-taupe/10">
                        <MessageSquare className="h-5 w-5 text-warm-taupe" />
                      </div>
                      <span className="text-xs text-cinereous flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        This month
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-dark-umber/70 mb-1">Culi Interactions</h3>
                    <div className="text-3xl font-bold text-dark-umber">
                      <NumberTicker value={3426} />
                    </div>
                    <p className="text-xs text-terracotta mt-2">+18% from last month</p>
                  </div>
                </MagicCard>
              </BlurFade>

              {/* Plan Usage Card */}
              <BlurFade delay={0.6} inView>
                <MagicCard 
                  className="p-6 bg-white border-0 shadow-soft hover:shadow-warm transition-all duration-300 h-full"
                  gradientColor="rgba(193, 58, 36, 0.1)"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-sm font-medium text-dark-umber/70">Plan Usage</h3>
                      <span className="text-xs font-medium text-spanish-orange bg-spanish-orange/10 px-2 py-1 rounded-full">
                        Pro Plan
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-center mb-3">
                        <AnimatedCircularProgressBar
                          value={68}
                          size={100}
                          strokeWidth={8}
                          primaryColor="#F56727"
                          secondaryColor="#F567271A"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-dark-umber/60">
                          6,800 of 10,000 interactions
                        </p>
                      </div>
                    </div>
                  </div>
                </MagicCard>
              </BlurFade>

              {/* Additional Costs Card */}
              <BlurFade delay={0.7} inView>
                <MagicCard 
                  className="p-6 bg-white border-0 shadow-soft hover:shadow-warm transition-all duration-300 h-full"
                  gradientColor="rgba(162, 162, 150, 0.1)"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-cinereous/10">
                        <DollarSign className="h-5 w-5 text-cinereous" />
                      </div>
                      <span className="text-xs text-cinereous flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        This month
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-dark-umber/70 mb-1">Additional Costs</h3>
                    <div className="text-3xl font-bold text-dark-umber">
                      $<NumberTicker value={0} decimalPlaces={2} />
                    </div>
                    <p className="text-xs text-cinereous mt-2">Within plan limits</p>
                  </div>
                </MagicCard>
              </BlurFade>
            </div>

            {/* Popular Questions Section */}
            <BlurFade delay={0.8} inView>
              <div className="mt-12 p-8 bg-white rounded-2xl shadow-soft">
                <h2 className="text-2xl font-bold text-dark-umber mb-6">Popular Questions</h2>
                <div className="space-y-4">
                  {[
                    { question: "What's in the paella?", count: 234 },
                    { question: "Is the duck gluten-free?", count: 189 },
                    { question: "¿Cuáles son los ingredientes?", count: 156 },
                    { question: "有素食选择吗？", count: 142 },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-seasalt hover:bg-cream transition-colors"
                    >
                      <span className="text-dark-umber">{item.question}</span>
                      <span className="text-sm font-medium text-spanish-orange">
                        {item.count} times
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </BlurFade>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}