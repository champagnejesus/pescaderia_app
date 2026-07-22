"use client"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface RecentOrder {
  id: number
  order_number: string
  client_name: string
  status: string
  total_value: number
  created_at: string
}

interface RecentOrdersListProps {
  orders: RecentOrder[]
  onPress?: (id: number) => void
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

export function RecentOrdersList({ orders, onPress }: RecentOrdersListProps) {
  const recent = orders.slice(0, 5)

  return (
    <div>
      <h3 className="text-title-medium text-abyssal-text-primary mb-3">Pedidos Recientes</h3>
      <div className="bg-abyssal-surface rounded-abyssal-md shadow-abyssal-sm overflow-hidden">
        {recent.map((order, i) => (
          <button
            key={order.id}
            onClick={() => onPress?.(order.id)}
            className={cn(
              "flex items-center justify-between p-3 w-full text-left transition-colors hover:bg-abyssal-surface-high",
              i < recent.length - 1 && "border-b border-abyssal-primary/20",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-body-medium text-abyssal-text-primary truncate">
                {order.client_name}
              </p>
              <p className="text-label-small text-abyssal-text-secondary">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={order.status} />
              <span className="text-body-medium text-abyssal-text-primary font-semibold">
                {formatCurrency(order.total_value)}
              </span>
            </div>
          </button>
        ))}
        {recent.length === 0 && (
          <p className="p-3 text-body-medium text-abyssal-text-secondary text-center">
            No hay pedidos recientes
          </p>
        )}
      </div>
    </div>
  )
}
