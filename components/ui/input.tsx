import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "flex w-full border bg-background text-foreground shadow-warm-sm transition-all duration-200 placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent hover:shadow-warm-md disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  {
    variants: {
      variant: {
        default: "border-neutral-300 dark:border-neutral-600",
        error: "border-error dark:border-error focus:ring-error",
        success: "border-success dark:border-success focus:ring-success",
      },
      size: {
        default: "h-10 px-md py-sm text-sm",
        sm: "h-9 px-sm py-xs text-xs",
        lg: "h-12 px-lg py-md text-base",
      },
      rounded: {
        default: "rounded-full",
        medium: "rounded-medium",
        small: "rounded-small",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, rounded, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, rounded }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }