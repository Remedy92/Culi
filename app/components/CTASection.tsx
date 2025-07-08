"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-32 lg:py-40 bg-timberwolf relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-spanish-orange/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-eerie-black">
            Ready to delight your guests?
          </h2>
          <p className="text-xl text-eerie-black/80 max-w-2xl mx-auto">
            Join forward-thinking restaurants using Culi to provide exceptional guest experiences in every language.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="min-w-[200px] group">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px]">
              Schedule Demo
            </Button>
          </div>

          <p className="text-sm text-cinereous">
            No credit card required • 14-day free trial • 5-minute setup
          </p>
        </motion.div>
      </div>
    </section>
  )
}