import { memo } from "react"
import { cn } from "@/lib/utils"
import type { Icon } from "@phosphor-icons/react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: Icon
  iconColor?: string
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

function StatCardComponent({
  label,
  value,
  icon: Icon,
  iconColor = "text-abyssal-primary",
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-4 shadow-abyssal-lg", className)}>
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon className={cn("w-[14px] h-[14px]", iconColor)} />}
        <p className="text-label-small text-abyssal-text-secondary font-caption uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-title-large text-abyssal-text-primary font-heading font-bold">{value}</p>
      {trend && (
        <p className={cn("text-xs font-medium mt-1 font-caption", trend.positive ? "text-abyssal-green" : "text-abyssal-red")}>
          {trend.value}
        </p>
      )}
    </div>
  )
}

export const StatCard = memo(StatCardComponent)