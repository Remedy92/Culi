import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-sm py-xs text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary-light",
        secondary:
          "bg-secondary/10 text-secondary hover:bg-secondary/20 dark:bg-secondary/20 dark:text-secondary-light",
        success:
          "bg-success-background text-success-foreground hover:bg-success-background/80",
        warning:
          "bg-warning-background text-warning-foreground hover:bg-warning-background/80",
        error:
          "bg-error-background text-error-foreground hover:bg-error-background/80",
        info:
          "bg-info-background text-info-foreground hover:bg-info-background/80",
        outline: "border border-neutral-200 dark:border-neutral-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }