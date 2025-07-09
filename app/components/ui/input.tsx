import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border border-cinereous/30 bg-white px-4 py-2 text-sm text-eerie-black shadow-warm transition-all duration-200",
          "placeholder:text-cinereous/70",
          "focus:outline-none focus:ring-2 focus:ring-spanish-orange focus:ring-offset-2 focus:border-transparent",
          "hover:shadow-warm-md",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }