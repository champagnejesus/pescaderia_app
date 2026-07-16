"use client"
import { cn } from "@/lib/utils"

interface StockBadgeProps {
  stock: number
  threshold: number
}

export function StockBadge({ stock, threshold }: StockBadgeProps) {
  const colorClass =
    stock === 0
      ? "bg-abyssal-red-bg text-abyssal-red"
      : stock <= threshold
        ? "bg-abyssal-yellow-bg text-abyssal-yellow"
        : "bg-abyssal-green-bg text-abyssal-green"

  return (
    <span className={cn("inline-block rounded-abyssal-sm px-2 py-0.5 text-label-small font-semibold", colorClass)}>
      {stock}
    </span>
  )
}
