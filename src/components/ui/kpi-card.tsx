import { type HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

const KpiCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-5 shadow-abyssal-lg transition-all duration-200",
        className
      )}
      {...props}
    />
  )
)
KpiCard.displayName = "KpiCard"

export { KpiCard }