import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  PENDIENTE: "bg-abyssal-yellow-bg text-abyssal-yellow",
  ENTREGADO: "bg-abyssal-green-bg text-abyssal-green",
  PAGADO: "bg-abyssal-green-bg text-abyssal-green",
  ANULADO: "bg-abyssal-red-bg text-abyssal-red",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toUpperCase()] || "bg-abyssal-surface-high text-abyssal-text-secondary"
  return (
    <span
      className={cn(
        "inline-block rounded-abyssal-sm px-3 py-1 text-label-small uppercase",
        style,
        className,
      )}
    >
      {status}
    </span>
  )
}
