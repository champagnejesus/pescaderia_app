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
      className="bg-abyssal-surface glass rounded-2xl p-3.5 flex items-center justify-between w-full text-left transition-all duration-200 active:scale-[0.98]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
          {order.client_name}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5">
          #{order.order_number} · {formatDate(order.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={order.status} />
        <span className="text-[15px] text-abyssal-text-primary font-semibold">
          {formatCurrency(order.total_value)}
        </span>
      </div>
    </button>
  )
}
