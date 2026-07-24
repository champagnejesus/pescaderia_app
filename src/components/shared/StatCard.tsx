import { memo } from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
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
  iconColor = "abyssal-primary",
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-abyssal-surface glass rounded-2xl p-4 shadow-abyssal-sm", className)}>
      {Icon && (
        <div className="flex items-center gap-2 mb-1">
          <Icon className={cn("w-3.5 h-3.5", `text-${iconColor}`)} />
          <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">
            {label}
          </p>
        </div>
      )}
      {!Icon && (
        <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium mb-1">
          {label}
        </p>
      )}
      <p className="text-title-large text-abyssal-text-primary font-bold">{value}</p>
      {trend && (
        <p className={cn("text-[11px] font-medium mt-1", trend.positive ? "text-abyssal-green" : "text-abyssal-red")}>
          {trend.value}
        </p>
      )}
    </div>
  )
}

export const StatCard = memo(StatCardComponent)