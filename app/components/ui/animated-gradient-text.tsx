"use client"

import { cn } from "@/lib/utils"

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <div
      className={cn(
        "inline-flex animate-gradient bg-gradient-to-r from-spanish-orange via-terracotta to-warm-taupe bg-[length:300%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </div>
  )
}