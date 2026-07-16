"use client"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface OrderCardOrder {
  id: number
  order_number: string
  client_name: string
  status: string
  total_value: number
  created_at: string
}

interface OrderCardProps {
  order: OrderCardOrder
  onPress: (id: number) => void
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  } catch {
    return dateStr
  }
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <button
      onClick={() => onPress(order.id)}
      className="bg-abyssal-surface rounded-abyssal-sm p-3 flex items-center justify-between w-full text-left transition-colors hover:bg-abyssal-surface-high"
    >
      <div className="min-w-0 flex-1">
        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">
          {order.client_name}
        </p>
        <p className="text-label-small text-abyssal-text-secondary">
          #{order.order_number} · {formatDate(order.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={order.status} />
        <span className="text-body-medium text-abyssal-text-primary font-semibold">
          {formatCurrency(order.total_value)}
        </span>
      </div>
    </button>
  )
}
