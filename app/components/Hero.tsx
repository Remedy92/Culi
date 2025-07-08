"use client"

import { Button } from "./ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-timberwolf via-timberwolf/80 to-spanish-orange/10" />
      
      {/* Organic blob shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-spanish-orange/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cinereous/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-spanish-orange/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-eerie-black tracking-tight">
            Your menu,{" "}
            <span className="text-spanish-orange">but smarter</span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg sm:text-xl text-eerie-black/80"
          >
            Culi is an AI-powered assistant that answers guest questions about your menu in 100+ languages. Works seamlessly alongside your paper menus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="min-w-[200px]">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px]">
              See Demo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <Link
            href="#features"
            className="flex flex-col items-center gap-2 text-cinereous hover:text-spanish-orange transition-colors"
          >
            <span className="text-sm">Learn more</span>
            <ArrowDown className="h-5 w-5 animate-bounce" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}