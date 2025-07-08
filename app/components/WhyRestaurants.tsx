"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Heart, Shield } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    title: "Increase Guest Satisfaction",
    description: "Empower guests to make informed choices, reducing order mistakes and increasing satisfaction scores.",
  },
  {
    icon: Users,
    title: "Serve More Guests",
    description: "Free up staff from repetitive questions so they can focus on providing exceptional service.",
  },
  {
    icon: Heart,
    title: "Build Guest Loyalty",
    description: "Show you care about every guest's needs, from dietary restrictions to language preferences.",
  },
  {
    icon: Shield,
    title: "Reduce Liability",
    description: "Accurate allergen information available 24/7 helps protect your guests and your business.",
  },
]

export function WhyRestaurants() {
  return (
    <section className="py-24 lg:py-32 bg-seasalt relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-spanish-orange/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-eerie-black mb-4">
            Why Restaurants Love Culi
          </h2>
          <p className="text-lg text-eerie-black/80 max-w-2xl mx-auto">
            Join thousands of restaurants providing better guest experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-cinereous/10 shadow-warm hover:shadow-warm-lg transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                  <benefit.icon className="h-6 w-6 text-spanish-orange" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-eerie-black mb-2">
                  {benefit.title}
                </h3>
                <p className="text-eerie-black/70">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div>
              <p className="text-3xl font-bold text-spanish-orange">100+</p>
              <p className="text-eerie-black/70">Languages Supported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-spanish-orange">5 min</p>
              <p className="text-eerie-black/70">Setup Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-spanish-orange">24/7</p>
              <p className="text-eerie-black/70">Available to Guests</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}