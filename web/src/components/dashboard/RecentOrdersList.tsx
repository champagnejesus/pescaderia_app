"use client"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatDate, formatCurrency } from "@/lib/formatters"

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

export function RecentOrdersList({ orders, onPress }: RecentOrdersListProps) {
  const recent = orders.slice(0, 5)

  return (
    <div>
      <h3 className="text-[17px] font-semibold text-abyssal-text-primary mb-3">Pedidos Recientes</h3>
      <div className="bg-abyssal-surface glass rounded-2xl overflow-hidden">
        {recent.map((order, i) => (
          <button
            key={order.id}
            onClick={() => onPress?.(order.id)}
            className={cn(
              "flex items-center justify-between p-3.5 w-full text-left transition-colors hover:bg-abyssal-surface-high active:scale-[0.99]",
              i < recent.length - 1 && "border-b border-abyssal-outline/15",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] text-abyssal-text-primary truncate">
                {order.client_name}
              </p>
              <p className="text-[12px] text-abyssal-text-secondary mt-0.5">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={order.status} />
              <span className="text-[15px] text-abyssal-text-primary font-semibold">
                {formatCurrency(order.total_value)}
              </span>
            </div>
          </button>
        ))}
        {recent.length === 0 && (
          <p className="p-4 text-[15px] text-abyssal-text-secondary text-center">
            No hay pedidos recientes
          </p>
        )}
      </div>
    </div>
  )
}
