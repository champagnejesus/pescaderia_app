import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = "rectangular", width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-abyssal-surface-high/50 rounded-xl",
        variant === "circular" && "rounded-full",
        className
      )}
      style={{ width, height }}
    />
  )
}
