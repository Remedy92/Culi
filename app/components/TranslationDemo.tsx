"use client"

import { motion } from "framer-motion"
import { TextRevealCard } from "./ui/text-reveal-card"

const menuItems = [
  {
    original: "北京烤鸭",
    translated: "Peking Duck",
    description: "Traditional roasted duck with crispy skin, served with pancakes",
    language: "Chinese",
  },
  {
    original: "Paella Valenciana",
    translated: "Valencian Paella",
    description: "Spanish rice dish with rabbit, beans, and saffron",
    language: "Spanish",
  },
  {
    original: "الكبسة",
    translated: "Kabsa",
    description: "Fragrant rice dish with lamb, cardamom, and mixed spices",
    language: "Arabic",
  },
  {
    original: "Bouillabaisse",
    translated: "Fish Stew",
    description: "Traditional Provençal fish soup with rouille sauce",
    language: "French",
  },
]

export function TranslationDemo() {
  return (
    <section className="py-32 bg-cream relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-terracotta/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-warm-taupe/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-dark-umber mb-4">
            See the Magic of Translation
          </h2>
          <p className="text-lg text-dark-umber/80 max-w-2xl mx-auto">
            Hover over menu items to see how Culi instantly translates dishes from any language
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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