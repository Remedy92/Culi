import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  children,
}: {
  className?: string
  title?: string | ReactNode
  description?: string | ReactNode
  header?: ReactNode
  icon?: ReactNode
  children?: ReactNode
}) => {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-warm-taupe/10 bg-white/80 p-6 shadow-warm backdrop-blur-sm transition-all duration-300 hover:shadow-warm-lg",
        className
      )}
    >
      {header && <div className="mb-4">{header}</div>}
      <div className="flex flex-col space-y-4">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          {title && (
            <h3 className="mb-2 text-xl font-semibold text-eerie-black">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-eerie-black/70">{description}</p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}