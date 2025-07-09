"use client"

import { motion } from "framer-motion"
import { Upload, QrCode, MessageSquare } from "lucide-react"
import { useTranslations } from 'next-intl'

export function HowItWorks() {
  const t = useTranslations('howItWorks');
  
  const steps = [
    {
      number: "1",
      icon: Upload,
      title: t('steps.upload.title'),
      description: t('steps.upload.description'),
    },
    {
      number: "2",
      icon: QrCode,
      title: t('steps.qr.title'),
      description: t('steps.qr.description'),
    },
    {
      number: "3",
      icon: MessageSquare,
      title: t('steps.serve.title'),
      description: t('steps.serve.description'),
    },
  ];
  return (
    <section id="how-it-works" className="py-16 md:py-20 lg:py-24 bg-timberwolf relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-spanish-orange/5 blur-3xl" />
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

        <div className="relative">
          {/* Organic timeline line - hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2">
            <svg className="w-full h-2" viewBox="0 0 1000 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 4C100 4 150 6 250 4C350 2 400 6 500 4C600 2 650 6 750 4C850 2 900 4 1000 4" stroke="#ae9990" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Step number */}
                  <div className="relative z-10 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-spanish-orange text-white text-xl font-bold shadow-warm-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-warm">
                    <step.icon className="h-7 w-7 text-spanish-orange" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-semibold text-eerie-black mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-cinereous max-w-xs">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}