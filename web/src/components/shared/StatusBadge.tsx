import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  PENDIENTE: "bg-abyssal-yellow-bg text-abyssal-yellow animate-subtle-pulse",
  ENTREGADO: "bg-abyssal-green-bg text-abyssal-green",
  PAGADO: "bg-abyssal-green-bg text-abyssal-green",
  ANULADO: "bg-abyssal-red-bg text-abyssal-red",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toUpperCase()] || "bg-abyssal-surface-high text-abyssal-text-secondary"
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        style,
        className
      )}
    >
      {status}
    </span>
  )
}
