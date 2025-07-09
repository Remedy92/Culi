"use client"

import { motion } from "framer-motion"
import { TextRevealCard } from "./ui/text-reveal-card"
import { useTranslations } from 'next-intl'

export function TranslationDemo() {
  const t = useTranslations('translationDemo');
  
  const menuItems = [
    {
      original: "北京烤鸭",
      translated: t('menuItems.pekingDuck.name'),
      description: t('menuItems.pekingDuck.description'),
      language: t('languages.chinese'),
    },
    {
      original: "Paella Valenciana",
      translated: t('menuItems.paella.name'),
      description: t('menuItems.paella.description'),
      language: t('languages.spanish'),
    },
    {
      original: "الكبسة",
      translated: t('menuItems.kabsa.name'),
      description: t('menuItems.kabsa.description'),
      language: t('languages.arabic'),
    },
    {
      original: "Bouillabaisse",
      translated: t('menuItems.bouillabaisse.name'),
      description: t('menuItems.bouillabaisse.description'),
      language: t('languages.french'),
    },
  ];
  return (
    <section id="translation-demo" className="py-16 md:py-20 lg:py-24 bg-cream relative overflow-hidden">
      {/* Subtle background decoration - simplified for mobile */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-32 w-32 md:h-64 md:w-64 rounded-full bg-terracotta/5 blur-2xl md:blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-32 w-32 md:h-64 md:w-64 rounded-full bg-warm-taupe/5 blur-2xl md:blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-umber mb-3 md:mb-4">
            {t('title')}
          </h2>
          <p className="text-base md:text-lg text-dark-umber/80 max-w-2xl mx-auto px-4 sm:px-0">
            {t('description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <TextRevealCard
                text={item.original}
                revealText={item.translated}
                className="h-full"
              >
                <div className="space-y-2 mb-6">
                  <span className="text-sm font-medium text-terracotta">
                    {item.language}
                  </span>
                  <p className="text-dark-umber/70 text-sm">
                    {item.description}
                  </p>
                </div>
              </TextRevealCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}