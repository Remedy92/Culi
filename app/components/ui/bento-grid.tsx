"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export interface BentoGridProps {
  children: ReactNode
  className?: string
}

export interface BentoCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-12 gap-4",
      "auto-rows-[160px]",
      className
    )}>
      {children}
    </div>
  )
}

export function BentoCard({ children, className, onClick }: BentoCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative group",
        "rounded-2xl overflow-hidden",
        "bg-white/80 backdrop-blur-sm",
        "border border-warm-taupe/10",
        "shadow-warm hover:shadow-warm-lg",
        "transition-all duration-300",
        "p-5 lg:p-6",
        "cursor-default",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}