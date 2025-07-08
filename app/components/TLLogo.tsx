"use client"

import { motion } from "framer-motion"

interface TLLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function TLLogo({ className = "", size = "md" }: TLLogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  return (
    <motion.div
      className={`${sizes[size]} ${className} relative flex items-center justify-center overflow-hidden rounded-xl`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="absolute inset-0 bg-spanish-orange" />
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        <motion.path
          d="M20 20H40V80H30V30H20V20Z"
          fill="white"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.path
          d="M50 20H60V70H80V80H50V20Z"
          fill="white"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
    </motion.div>
  )
}