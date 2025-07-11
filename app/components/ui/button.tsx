import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-warm-md hover:shadow-warm-lg hover:scale-105",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-warm-sm hover:shadow-warm-md",
        outline:
          "border border-neutral-300 bg-transparent text-foreground hover:bg-neutral-50 dark:border-neutral-600 dark:hover:bg-neutral-800",
        ghost: 
          "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
        success:
          "bg-success text-success-foreground hover:bg-success/90 shadow-warm-sm hover:shadow-warm-md",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/90 shadow-warm-sm hover:shadow-warm-md",
        error:
          "bg-error text-error-foreground hover:bg-error/90 shadow-warm-sm hover:shadow-warm-md",
      },
      size: {
        default: "h-10 px-lg py-sm",
        sm: "h-9 px-md py-xs text-xs",
        lg: "h-12 px-xl py-md text-base",
        icon: "h-10 w-10 p-0",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-medium",
        square: "rounded-minimal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "rounded",
    },
    compoundVariants: [
      // Size adjustments for different shapes
      {
        size: "sm",
        shape: "square",
        className: "rounded-minimal",
      },
      {
        size: "sm",
        shape: "rounded",
        className: "rounded-small",
      },
      // Icon button shape adjustments
      {
        size: "icon",
        shape: "pill",
        className: "rounded-full",
      },
      {
        size: "icon",
        shape: "rounded",
        className: "rounded-medium",
      },
      {
        size: "icon",
        shape: "square",
        className: "rounded-minimal",
      },
    ],
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }