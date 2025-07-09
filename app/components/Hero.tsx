"use client"

import { Button } from "./ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowDown, Globe } from "lucide-react"
import { useTranslations } from 'next-intl'

export function Hero() {
  const t = useTranslations('hero');
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-timberwolf via-timberwolf/80 to-spanish-orange/10" />
      
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Organic blob shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-spanish-orange/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cinereous/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-spanish-orange/5 blur-3xl" />
      </div>

      {/* Floating food elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Plate 1 - top left */}
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" className="opacity-[0.07]">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-eerie-black" />
            <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-eerie-black" />
          </svg>
        </motion.div>

        {/* Fork - top right */}
        <motion.div
          className="absolute top-[20%] right-[15%] rotate-45"
          animate={{
            y: [0, 15, 0],
            rotate: [45, 50, 45],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-[0.06]">
            <path
              d="M40 10 L40 60 M30 10 L30 25 M50 10 L50 25 M35 10 L35 20 M45 10 L45 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-eerie-black"
            />
          </svg>
        </motion.div>

        {/* Spoon - bottom left */}
        <motion.div
          className="absolute bottom-[25%] left-[20%] -rotate-12"
          animate={{
            y: [0, -15, 0],
            rotate: [-12, -8, -12],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <svg width="90" height="90" viewBox="0 0 90 90" className="opacity-[0.05]">
            <path
              d="M45 20 C35 20 30 28 30 35 C30 42 35 50 45 50 C55 50 60 42 60 35 C60 28 55 20 45 20 Z M45 50 L45 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-eerie-black"
            />
          </svg>
        </motion.div>

        {/* Knife - right side */}
        <motion.div
          className="absolute top-[50%] right-[8%] rotate-90"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-[0.06]">
            <path
              d="M50 20 L50 70 M50 20 C55 25 55 35 50 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-eerie-black"
            />
          </svg>
        </motion.div>

        {/* Small plate - bottom right */}
        <motion.div
          className="absolute bottom-[15%] right-[25%]"
          animate={{
            y: [0, -10, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-[0.04]">
            <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-eerie-black" />
            <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1" className="text-eerie-black" />
          </svg>
        </motion.div>

        {/* Wine glass - left middle */}
        <motion.div
          className="absolute top-[40%] left-[5%]"
          animate={{
            y: [0, -12, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5,
          }}
        >
          <svg width="70" height="70" viewBox="0 0 70 70" className="opacity-[0.05]">
            <path
              d="M35 15 C25 15 20 20 20 30 C20 35 25 40 35 40 C45 40 50 35 50 30 C50 20 45 15 35 15 Z M35 40 L35 55 M25 55 L45 55"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-eerie-black"
            />
          </svg>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Language badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spanish-orange/10 text-spanish-orange text-sm font-medium"
          >
            <Globe className="h-4 w-4" />
            <span>{t('badge')}</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-eerie-black">
            {t.rich('title', {
              highlight: (chunks) => <span className="text-spanish-orange">{chunks}</span>
            })}
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-4xl text-lg sm:text-xl text-eerie-black/80 whitespace-nowrap md:whitespace-normal lg:whitespace-nowrap"
          >
            {t.rich('description', {
              bold: (chunks) => <span className="font-bold text-eerie-black">{chunks}</span>
            })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="min-w-[200px]"
            >
              {t('cta.start')}
            </Button>
          </motion.div>

          {/* Learn more - moved to relative positioning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-16"
          >
            <Link
              href="#features"
              className="group inline-flex flex-col items-center gap-3 text-warm-taupe hover:text-terracotta transition-all duration-300"
            >
              <span className="text-base font-medium">{t('cta.learnMore')}</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowDown className="h-5 w-5" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}