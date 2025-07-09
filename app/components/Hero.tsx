"use client"

import { Button } from "./ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowDown, Globe } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export function Hero() {
  const t = useTranslations('hero');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Simplified gradient background for mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-timberwolf via-timberwolf/90 to-spanish-orange/20 md:from-timberwolf md:via-timberwolf/80 md:to-spanish-orange/10" />
      
      {/* Grain texture overlay - hidden on mobile for performance */}
      <div 
        className="absolute inset-0 opacity-[0.015] hidden md:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Organic blob shapes - simplified on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-40 w-40 md:h-80 md:w-80 rounded-full bg-spanish-orange/10 md:bg-spanish-orange/5 blur-2xl md:blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-48 w-48 md:h-96 md:w-96 rounded-full bg-cinereous/20 md:bg-cinereous/10 blur-2xl md:blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] md:h-[600px] md:w-[600px] rounded-full bg-spanish-orange/10 md:bg-spanish-orange/5 blur-2xl md:blur-3xl hidden md:block" />
      </div>

      {/* Floating food elements - hidden on mobile, simplified animations on desktop */}
      <div className="absolute inset-0 overflow-hidden hidden md:block">
        {/* Plate 1 - top left */}
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={!prefersReducedMotion ? {
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          } : {}}
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

        {/* All floating elements with reduced motion support */}
        {[
          { className: "top-[20%] right-[15%] rotate-45", size: 80, opacity: 0.06, delay: 1, duration: 7,
            animate: { y: [0, 15, 0], rotate: [45, 50, 45] },
            path: "M40 10 L40 60 M30 10 L30 25 M50 10 L50 25 M35 10 L35 20 M45 10 L45 20" },
          { className: "bottom-[25%] left-[20%] -rotate-12", size: 90, opacity: 0.05, delay: 2, duration: 8,
            animate: { y: [0, -15, 0], rotate: [-12, -8, -12] },
            path: "M45 20 C35 20 30 28 30 35 C30 42 35 50 45 50 C55 50 60 42 60 35 C60 28 55 20 45 20 Z M45 50 L45 70" },
          { className: "top-[50%] right-[8%] rotate-90", size: 100, opacity: 0.06, delay: 1.5, duration: 9,
            animate: { y: [0, 20, 0], x: [0, -10, 0] },
            path: "M50 20 L50 70 M50 20 C55 25 55 35 50 40" },
          { className: "bottom-[15%] right-[25%]", size: 80, opacity: 0.04, delay: 3, duration: 5,
            animate: { y: [0, -10, 0], rotate: [0, -5, 0] },
            isCircle: true },
          { className: "top-[40%] left-[5%]", size: 70, opacity: 0.05, delay: 2.5, duration: 6.5,
            animate: { y: [0, -12, 0], rotate: [0, 3, 0] },
            path: "M35 15 C25 15 20 20 20 30 C20 35 25 40 35 40 C45 40 50 35 50 30 C50 20 45 15 35 15 Z M35 40 L35 55 M25 55 L45 55" },
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`absolute ${item.className}`}
            animate={!prefersReducedMotion ? item.animate : {}}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: item.delay,
            }}
          >
            <svg width={item.size} height={item.size} viewBox={`0 0 ${item.size} ${item.size}`} className={`opacity-[${item.opacity}]`}>
              {item.isCircle ? (
                <>
                  <circle cx={item.size/2} cy={item.size/2} r={item.size/2 - 5} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-eerie-black" />
                  <circle cx={item.size/2} cy={item.size/2} r={item.size/2 - 15} fill="none" stroke="currentColor" strokeWidth="1" className="text-eerie-black" />
                </>
              ) : (
                <path
                  d={item.path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={item.size === 70 ? "1.5" : "2"}
                  strokeLinecap="round"
                  className="text-eerie-black"
                />
              )}
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="space-y-6 md:space-y-8"
        >
          {/* Language badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-spanish-orange/10 text-spanish-orange text-xs md:text-sm font-medium"
          >
            <Globe className="h-3 w-3 md:h-4 md:w-4" />
            <span>{t('badge')}</span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-eerie-black leading-tight">
            {t.rich('title', {
              highlight: (chunks) => <span className="text-spanish-orange inline">{chunks}</span>
            })}
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="mx-auto max-w-2xl md:max-w-3xl lg:max-w-4xl text-base sm:text-lg md:text-xl text-eerie-black/80 px-4 sm:px-0"
          >
            {t.rich('description', {
              bold: (chunks) => <span className="font-bold text-eerie-black">{chunks}</span>
            })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto min-w-[200px] h-12 md:h-14 text-base md:text-lg touch-manipulation"
            >
              {t('cta.start')}
            </Button>
          </motion.div>

          {/* Learn more - improved mobile spacing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1, delay: prefersReducedMotion ? 0 : 0.8 }}
            className="pt-8 md:pt-12 lg:pt-16"
          >
            <Link
              href="#features"
              className="group inline-flex flex-col items-center gap-2 md:gap-3 text-warm-taupe hover:text-terracotta transition-all duration-300 p-2 -m-2 touch-manipulation"
            >
              <span className="text-sm md:text-base font-medium">{t('cta.learnMore')}</span>
              <motion.div
                animate={!prefersReducedMotion ? { y: [0, 8, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowDown className="h-4 w-4 md:h-5 md:w-5" />
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}