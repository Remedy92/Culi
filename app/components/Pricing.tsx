"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Check } from "lucide-react"
import { useTranslations } from 'next-intl'

export function Pricing() {
  const t = useTranslations('pricing');
  
  const plans = [
    {
      name: t('plans.free.name'),
      price: t('plans.free.price'),
      description: t('plans.free.description'),
      features: [
        t('plans.free.features.0'),
        t('plans.free.features.1'),
        t('plans.free.features.2'),
        t('plans.free.features.3'),
      ],
      highlighted: false,
      cta: t('plans.free.cta'),
    },
    {
      name: t('plans.starter.name'),
      price: t('plans.starter.price'),
      description: t('plans.starter.description'),
      features: [
        t('plans.starter.features.0'),
        t('plans.starter.features.1'),
        t('plans.starter.features.2'),
        t('plans.starter.features.3'),
        t('plans.starter.features.4'),
        t('plans.starter.features.5'),
      ],
      highlighted: true,
      cta: t('plans.starter.cta'),
      overage: t('plans.starter.overage'),
    },
    {
      name: t('plans.professional.name'),
      price: t('plans.professional.price'),
      description: t('plans.professional.description'),
      features: [
        t('plans.professional.features.0'),
        t('plans.professional.features.1'),
        t('plans.professional.features.2'),
        t('plans.professional.features.3'),
        t('plans.professional.features.4'),
        t('plans.professional.features.5'),
      ],
      highlighted: false,
      cta: t('plans.professional.cta'),
      overage: t('plans.professional.overage'),
    },
  ];
  return (
    <section id="pricing" className="py-12 md:py-16 lg:py-20 bg-seasalt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                className={`h-full relative transition-all duration-300 ${
                  plan.highlighted
                    ? "border-2 border-spanish-orange shadow-xl"
                    : "border border-cinereous/20 hover:border-cinereous/40"
                }`}
              >
                <CardHeader className="pb-4">
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-spanish-orange text-white text-xs font-semibold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-eerie-black">
                      {plan.price}
                    </span>
                    {plan.price !== "€0" && (
                      <span className="text-cinereous text-sm">/month</span>
                    )}
                  </div>
                  {plan.overage && (
                    <p className="text-xs text-cinereous mt-2">{plan.overage}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-spanish-orange flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-eerie-black/70">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-eerie-black/60">
            Need more than 2,000 interactions per month? 
            <Button variant="ghost" className="text-spanish-orange hover:text-spanish-orange/80 px-1 h-auto py-0">
              Contact us for Enterprise pricing
            </Button>
          </p>
        </motion.div>
      </div>
    </section>
  )
}