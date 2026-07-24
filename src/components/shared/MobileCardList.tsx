"use client"

import { memo, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobileCardProps<T> {
  data: T[]
  keyExtractor: (item: T) => string | number
  renderCard: (item: T) => ReactNode
  onItemClick?: (item: T) => void
  className?: string
  emptyMessage?: string
  emptyIcon?: ReactNode
}

function MobileCardListComponent<T>({
  data,
  keyExtractor,
  renderCard,
  onItemClick,
  className,
  emptyMessage = "Sin resultados",
  emptyIcon,
}: MobileCardProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        {emptyIcon && <div className="text-abyssal-text-secondary mb-3" style={{ strokeWidth: 1 }}>{emptyIcon}</div>}
        <p className="text-body-medium text-abyssal-text-secondary">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("sm:hidden space-y-2", className)}>
      {data.map((item) => (
        <button
          key={keyExtractor(item)}
          onClick={() => onItemClick?.(item)}
          className={cn(
            "bg-abyssal-surface glass rounded-2xl p-3.5 w-full text-left transition-all duration-200 active:scale-[0.98]",
            onItemClick && "hover:bg-abyssal-surface-high/50"
          )}
        >
          {renderCard(item)}
        </button>
      ))}
    </div>
  )
}

export const MobileCardList = memo(MobileCardListComponent)