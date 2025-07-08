"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Heart, Shield, Globe, Clock, Star, ChefHat } from "lucide-react"
import { BentoGrid, BentoGridItem } from "./ui/bento-grid"
import { useState, useEffect } from "react"

// Animated counter component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="text-4xl font-bold text-spanish-orange">
      {count}{suffix}
    </span>
  )
}

// Satisfaction meter component
function SatisfactionMeter() {
  const [satisfaction, setSatisfaction] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setSatisfaction(95), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative h-32 w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-24 w-24">
          <svg className="h-full w-full -rotate-90 transform">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-spanish-orange/20"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * satisfaction) / 100}
              className="text-spanish-orange transition-all ease-out"
              style={{ transitionDuration: "2000ms" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-eerie-black">{satisfaction}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Language showcase component
function LanguageShowcase() {
  const languages = ["Hello", "Hola", "Bonjour", "你好", "مرحبا", "Olá", "Ciao", "こんにちは"]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % languages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-2xl font-semibold text-spanish-orange"
      >
        {languages[currentIndex]}
      </motion.div>
    </div>
  )
}

export function WhyRestaurantsBento() {
  return (
    <section className="relative overflow-hidden bg-seasalt py-32 lg:py-40">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-spanish-orange/5 blur-3xl" />
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-warm-taupe/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-eerie-black">
            Why Use Culi?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-eerie-black/80">
            Transform your restaurant with intelligent menu assistance that delights guests and empowers staff
          </p>
        </motion.div>

        <BentoGrid className="mx-auto">
          {/* Large feature card - Guest Satisfaction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
          <BentoGridItem
            className="md:col-span-2 lg:col-span-2 lg:row-span-2"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <TrendingUp className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title="Increase Guest Satisfaction"
            description="Empower guests to make informed choices with instant menu translations and allergen information. Watch satisfaction scores soar as order mistakes disappear."
            header={<SatisfactionMeter />}
          />
          </motion.div>

          {/* Medium card - Serve More Guests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
          <BentoGridItem
            className="md:col-span-1 lg:col-span-2"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <Users className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title="Serve More Guests"
            description="Free up your staff from repetitive menu questions. Let them focus on what matters - providing exceptional, personalized service."
          >
            <div className="mt-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-spanish-orange to-warm-taupe"
                  />
                ))}
              </div>
              <span className="text-sm text-eerie-black/60">Staff efficiency +40%</span>
            </div>
          </BentoGridItem>
          </motion.div>

          {/* Language support card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
          <BentoGridItem
            className="md:col-span-1"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <Globe className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title="All Languages"
            description="Support every guest in their native language"
            header={<LanguageShowcase />}
          />
          </motion.div>

          {/* Quick setup card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
          <BentoGridItem
            className="md:col-span-1"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <Clock className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title={<AnimatedCounter value={5} suffix=" min" />}
            description="Setup time - get started in minutes, not hours"
          />
          </motion.div>

          {/* Guest loyalty card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
          <BentoGridItem
            className="md:col-span-1 lg:col-span-2"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <Heart className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title="Build Guest Loyalty"
            description="Show you care about every guest's needs. From dietary restrictions to language preferences, make everyone feel welcome and valued."
          >
            <div className="mt-4 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-spanish-orange text-spanish-orange"
                />
              ))}
            </div>
          </BentoGridItem>
          </motion.div>

          {/* Liability protection card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
          <BentoGridItem
            className="md:col-span-1"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <Shield className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title="Reduce Liability"
            description="Accurate allergen info 24/7 protects guests and your business"
          />
          </motion.div>

          {/* Always available card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
          <BentoGridItem
            className="md:col-span-1"
            icon={
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-spanish-orange/20">
                <ChefHat className="h-6 w-6 text-spanish-orange" />
              </div>
            }
            title="24/7 Available"
            description="Your AI menu assistant never takes a break"
          >
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-spanish-orange/20">
                <motion.div
                  className="h-full bg-spanish-orange"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </BentoGridItem>
          </motion.div>
        </BentoGrid>
      </div>
    </section>
  )
}