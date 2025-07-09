"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Heart, Globe, Clock, GraduationCap, ChefHat, Zap, BookOpen, BarChart3 } from "lucide-react"
import { BentoGrid, BentoCard } from "@/app/components/ui/bento-grid"
import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'

export function WhyRestaurants() {
  const t = useTranslations('whyRestaurants');
  const [guestCount, setGuestCount] = useState(0)
  const [satisfactionScore, setSatisfactionScore] = useState(0)
  const [trainingReduction, setTrainingReduction] = useState(0)

  // Animated counters
  useEffect(() => {
    const guestInterval = setInterval(() => {
      setGuestCount(prev => prev < 95 ? prev + 1 : 95)
    }, 20)
    
    const satisfactionInterval = setInterval(() => {
      setSatisfactionScore(prev => prev < 98 ? prev + 1 : 98)
    }, 25)

    const trainingInterval = setInterval(() => {
      setTrainingReduction(prev => prev < 70 ? prev + 1 : 70)
    }, 30)

    return () => {
      clearInterval(guestInterval)
      clearInterval(satisfactionInterval)
      clearInterval(trainingInterval)
    }
  }, [])

  // Grid size classes for motion divs
  const gridSizes = {
    small: "col-span-1 md:col-span-3 row-span-1",
    medium: "col-span-1 md:col-span-6 row-span-1",
    large: "col-span-1 md:col-span-6 row-span-1 md:row-span-2",
    xlarge: "col-span-1 md:col-span-6 row-span-1 md:row-span-2",
    wide: "col-span-1 md:col-span-6 row-span-1",
    tall: "col-span-1 md:col-span-3 row-span-1 md:row-span-2"
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-seasalt relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-spanish-orange/5 blur-3xl" />
        <div className="absolute top-1/2 left-0 h-64 w-64 rounded-full bg-warm-taupe/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-eerie-black mb-4">
            {t('title')}
          </h2>
          <p className="text-base md:text-lg text-eerie-black/80 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <BentoGrid>
          {/* Row 1 - Large cards side by side */}
          {/* Large Card - Increase Guest Satisfaction */}
          <motion.div
            className={gridSizes.xlarge}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BentoCard className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-spanish-orange/10 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20 mb-3">
                    <TrendingUp className="h-6 w-6 text-spanish-orange" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-eerie-black mb-2">
                    {t('benefits.satisfaction.title')}
                  </h3>
                  <p className="text-eerie-black/70 text-sm md:text-base lg:text-sm">
                    {t('benefits.satisfaction.description')}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="text-3xl lg:text-4xl font-bold text-spanish-orange mb-1">
                    {satisfactionScore}%
                  </div>
                  <div className="w-full bg-warm-taupe/20 rounded-full h-2">
                    <motion.div 
                      className="bg-spanish-orange h-2 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${satisfactionScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs md:text-sm lg:text-sm text-eerie-black/60 mt-2">{t('benefits.satisfaction.metric')}</p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Large Card - Operational Efficiency */}
          <motion.div
            className={gridSizes.xlarge}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <BentoCard className="relative overflow-hidden bg-gradient-to-br from-eerie-black to-eerie-black/90 text-white h-full">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20 mb-3">
                    <GraduationCap className="h-6 w-6 text-spanish-orange" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold mb-2">
                    {t('benefits.efficiency.title')}
                  </h3>
                  <p className="text-seasalt/80 text-sm md:text-base lg:text-sm mb-4">
                    {t('benefits.efficiency.description')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Zap className="h-4 w-4 text-spanish-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm md:text-base lg:text-sm">{t('benefits.efficiency.features.training.title', { percentage: trainingReduction })}</p>
                        <p className="text-xs md:text-sm lg:text-xs text-seasalt/60">{t('benefits.efficiency.features.training.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ChefHat className="h-4 w-4 text-spanish-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm md:text-base lg:text-sm">{t('benefits.efficiency.features.chef.title')}</p>
                        <p className="text-xs md:text-sm lg:text-xs text-seasalt/60">{t('benefits.efficiency.features.chef.description')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-4 w-4 text-spanish-orange flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm md:text-base lg:text-sm">{t('benefits.efficiency.features.expert.title')}</p>
                        <p className="text-xs md:text-sm lg:text-xs text-seasalt/60">{t('benefits.efficiency.features.expert.description')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Row 2-3 - Mixed layout */}
          {/* Medium Card - Serve More Guests */}
          <motion.div
            className={gridSizes.medium}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BentoCard className="relative overflow-hidden h-full">
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-warm-taupe/10" />
              <div className="relative z-10 h-full flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-grow">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-spanish-orange/20 mb-2">
                    <Users className="h-5 w-5 text-spanish-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-eerie-black mb-1">
                    {t('benefits.serveMore.title')}
                  </h3>
                  <p className="text-eerie-black/70 text-sm md:text-base lg:text-sm">
                    {t('benefits.serveMore.description')}
                  </p>
                </div>
                <div className="mt-3 lg:mt-0 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-spanish-orange/20 border-2 border-white" />
                    ))}
                  </div>
                  <p className="text-xs md:text-sm lg:text-sm text-eerie-black/60">{t('benefits.serveMore.metric', { count: guestCount })}</p>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Tall Card - Build Guest Loyalty */}
          <motion.div
            className={gridSizes.tall}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <BentoCard className="relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-warm-taupe/5 to-transparent" />
              <div className="relative z-10 h-full flex flex-col">
                <div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20 mb-3">
                    <Heart className="h-6 w-6 text-spanish-orange" />
                  </div>
                  <h3 className="text-xl font-semibold text-eerie-black mb-2">
                    {t('benefits.loyalty.title')}
                  </h3>
                  <p className="text-eerie-black/70 text-sm md:text-base lg:text-sm">
                    {t('benefits.loyalty.description')}
                  </p>
                </div>
                <div className="mt-auto space-y-2">
                  <motion.div 
                    className="h-1 bg-spanish-orange/20 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                  <motion.div 
                    className="h-1 bg-spanish-orange/30 rounded-full w-4/5"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <motion.div 
                    className="h-1 bg-spanish-orange/40 rounded-full w-3/5"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Small Card - All Languages */}
          <motion.div
            className={gridSizes.small}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <BentoCard className="bg-gradient-to-br from-spanish-orange/5 to-transparent h-full">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Globe className="h-6 w-6 text-spanish-orange mb-2 animate-spin-slow" />
                <p className="text-2xl font-bold text-spanish-orange">{t('benefits.languages.title')}</p>
                <p className="text-eerie-black/70 text-xs md:text-sm lg:text-xs">{t('benefits.languages.subtitle')}</p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Medium Card - Real-Time Insights */}
          <motion.div
            className={gridSizes.medium}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <BentoCard className="bg-gradient-to-br from-spanish-orange/5 to-transparent h-full">
              <div className="h-full flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-grow">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-spanish-orange/20 mb-2">
                    <BarChart3 className="h-5 w-5 text-spanish-orange" />
                  </div>
                  <h3 className="text-lg font-semibold text-eerie-black mb-1">
                    {t('benefits.insights.title')}
                  </h3>
                  <p className="text-eerie-black/70 text-sm md:text-base lg:text-sm">
                    {t('benefits.insights.description')}
                  </p>
                </div>
                <div className="mt-3 lg:mt-0 lg:ml-4">
                  <div className="flex items-center gap-1">
                    <div className="h-8 w-1 bg-spanish-orange/20 rounded-full" />
                    <div className="h-12 w-1 bg-spanish-orange/30 rounded-full" />
                    <div className="h-6 w-1 bg-spanish-orange/40 rounded-full" />
                    <div className="h-10 w-1 bg-spanish-orange/50 rounded-full" />
                  </div>
                </div>
              </div>
            </BentoCard>
          </motion.div>

          {/* Small Card - 5 min Setup */}
          <motion.div
            className={gridSizes.small}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <BentoCard className="h-full">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Clock className="h-6 w-6 text-spanish-orange mb-2" />
                <p className="text-2xl font-bold text-spanish-orange">{t('benefits.setup.title')}</p>
                <p className="text-eerie-black/70 text-xs md:text-sm lg:text-xs">{t('benefits.setup.subtitle')}</p>
              </div>
            </BentoCard>
          </motion.div>

        </BentoGrid>
      </div>
    </section>
  )
}