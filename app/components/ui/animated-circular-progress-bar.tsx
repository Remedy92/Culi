"use client"

import React, { useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"

interface AnimatedCircularProgressBarProps {
  value: number
  size?: number
  strokeWidth?: number
  primaryColor?: string
  secondaryColor?: string
  showValue?: boolean
  className?: string
}

export function AnimatedCircularProgressBar({
  value,
  size = 120,
  strokeWidth = 10,
  primaryColor = "#F56727",
  secondaryColor = "#e5e7eb",
  showValue = true,
  className = "",
}: AnimatedCircularProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })
  
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [value, isInView])

  return (
    <div ref={ref} className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-dark-umber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {animatedValue}%
          </motion.span>
        </div>
      )}
    </div>
  )
}