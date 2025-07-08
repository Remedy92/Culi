"use client"

import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Globe, AlertCircle, BookOpen, Clock } from "lucide-react"

const features = [
  {
    icon: Globe,
    title: "Instant Multilingual Support",
    description: "Guests can ask questions in any language and get accurate answers about ingredients, allergens, and preparation methods.",
  },
  {
    icon: AlertCircle,
    title: "Allergen & Dietary Info",
    description: "Never miss critical dietary restrictions. Culi provides detailed information about allergens, vegan, and gluten-free options.",
  },
  {
    icon: BookOpen,
    title: "Works with Paper Menus",
    description: "Complements your existing menus. Guests scan a QR code to access Culi while keeping the traditional menu experience.",
  },
  {
    icon: Clock,
    title: "5-Minute Setup",
    description: "Upload your menu, get your QR codes, and start serving guests better. No complex integration or staff training required.",
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
            Meet Culi
          </h2>
          <p className="text-lg text-eerie-black/80 max-w-2xl mx-auto">
            Your AI-powered menu assistant that helps guests make informed dining decisions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-terracotta/30 hover:shadow-warm-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-warm-taupe/10 rounded-3xl">
                <CardHeader className="p-8">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/20 to-terracotta/10">
                    <feature.icon className="h-8 w-8 text-terracotta" />
                  </div>
                  <CardTitle className="text-eerie-black">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 text-eerie-black/70">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}