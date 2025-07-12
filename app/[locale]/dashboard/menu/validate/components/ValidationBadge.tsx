'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidationBadgeProps {
  isValidated: boolean
  className?: string
}

export function ValidationBadge({ isValidated, className }: ValidationBadgeProps) {
  if (!isValidated) return null
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 500,
        damping: 25,
        duration: 0.15 
      }}
      className={cn("flex items-center", className)}
    >
      <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} />
    </motion.div>
  )
}