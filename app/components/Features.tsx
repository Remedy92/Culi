"use client"

import { motion } from "framer-motion"
import { Zap, Link2, Globe, Shield } from "lucide-react"
import { ChatDemo } from "./ChatDemo"

const features = [
  {
    icon: Zap,
    title: "5-minute setup",
    description: "Upload menu, get QR code",
  },
  {
    icon: Link2,
    title: "Seamless companion",
    description: "Works alongside paper menus",
  },
  {
    icon: Globe,
    title: "100+ languages",
    description: "Instant translation",
  },
  {
    icon: Shield,
    title: "Dietary safety",
    description: "Allergen & restriction info",
  },
]

export function Features() {
  return (
    <section id="features" className="py-32 lg:py-40 bg-seasalt relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-spanish-orange/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cinereous/5 blur-3xl" />
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
            See <span className="text-spanish-orange">Culi</span> in Action
          </h2>
          <p className="text-lg text-eerie-black/80 max-w-2xl mx-auto">
            Watch how guests interact with your menu in any language
          </p>
        </motion.div>

        {/* Chat Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <ChatDemo />
        </motion.div>

        {/* Minimal features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-spanish-orange/10 mb-3">
                  <feature.icon className="h-6 w-6 text-spanish-orange" />
                </div>
                <h3 className="text-sm font-semibold text-eerie-black mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-eerie-black/60">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}