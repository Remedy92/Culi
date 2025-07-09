"use client"

import { motion } from "framer-motion"

interface CuliCurveLogoProps {
  size?: number
  color?: string
  className?: string
}

export function CuliCurveLogo({ 
  size = 48, 
  color = "#e16e27", 
  className = ""
}: CuliCurveLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 12C4 7 7 4 12 4C12 4 12 8 12 12C12 16 12 20 12 20C17 20 20 17 20 12C20 12 16 12 12 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export function CuliLogoLoading({ 
  size = 48, 
  color = "#e16e27", 
  className = ""
}: CuliCurveLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M4 12C4 7 7 4 12 4C12 4 12 8 12 12C12 16 12 20 12 20C17 20 20 17 20 12C20 12 16 12 12 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray="15 5"
        animate={{
          strokeDashoffset: [0, -20]
        }}
        transition={{
          strokeDashoffset: {
            repeat: Infinity,
            duration: 2.5,
            ease: "linear"
          }
        }}
      />
    </svg>
  )
}