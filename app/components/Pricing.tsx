"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "€0",
    description: "Try Culi risk-free",
    features: [
      "50 AI interactions/month",
      "2 languages (Dutch + English)",
      "Basic analytics dashboard",
      "1 QR code",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    name: "Starter",
    price: "€49",
    description: "Perfect for small restaurants",
    features: [
      "500 AI interactions/month",
      "All languages supported",
      "Advanced analytics",
      "WhatsApp integration",
      "Priority email support",
      "Unlimited QR codes",
    ],
    highlighted: true,
    cta: "Start Free Trial",
    overage: "€0.10 per extra interaction",
  },
  {
    name: "Professional",
    price: "€99",
    description: "For busy establishments",
    features: [
      "2,000 AI interactions/month",
      "API access (1,000 calls)",
      "Remove Culi branding",
      "Phone support",
      "POS integrations",
      "Custom analytics reports",
    ],
    highlighted: false,
    cta: "Start Free Trial",
    overage: "€0.05 per extra interaction",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-seasalt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-eerie-black mb-4">
            Start Free, Scale As You Grow
          </h2>
          <p className="text-lg text-eerie-black/80 max-w-2xl mx-auto">
            No credit card required. 14-day free trial on paid plans.
          </p>
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
            <Button variant="link" className="text-spanish-orange hover:text-spanish-orange/80 px-1">
              Contact us for Enterprise pricing
            </Button>
          </p>
        </motion.div>
      </div>
    </section>
  )
}