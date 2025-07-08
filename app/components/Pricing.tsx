"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for small restaurants",
    features: [
      "Up to 100 menu items",
      "1,000 conversations/month",
      "Basic analytics",
      "Email support",
      "5 QR codes",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$149",
    description: "For growing restaurants",
    features: [
      "Unlimited menu items",
      "10,000 conversations/month",
      "Advanced analytics",
      "Priority support",
      "Unlimited QR codes",
      "Custom branding",
      "Menu insights",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For restaurant chains",
    features: [
      "Everything in Professional",
      "Unlimited conversations",
      "Multi-location support",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    highlighted: false,
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
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-eerie-black/80 max-w-2xl mx-auto">
            Choose the plan that fits your restaurant. All plans include a 14-day free trial.
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
                className={`h-full ${
                  plan.highlighted
                    ? "border-spanish-orange shadow-lg scale-105"
                    : "border-cinereous/10"
                }`}
              >
                <CardHeader>
                  {plan.highlighted && (
                    <div className="mb-4 -mt-2 -mx-6 bg-spanish-orange text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-eerie-black">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-cinereous">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-spanish-orange flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-eerie-black/80">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}