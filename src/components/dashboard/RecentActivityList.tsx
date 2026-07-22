"use client"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ShoppingCart, Package, DollarSign, HandCoins, TrendingDown, Repeat } from "lucide-react"

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  reference_id: number
  reference: string
  amount: number
  status: string
  created_at: string | null
}

interface RecentActivityListProps {
  items: ActivityItem[]
  onPress?: (item: ActivityItem) => void
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string; bg: string; iconColor: string }> = {
  pedido: { icon: <ShoppingCart size={16} />, label: "Pedido", bg: "bg-abyssal-primary/10", iconColor: "text-abyssal-primary" },
  compra: { icon: <Package size={16} />, label: "Compra", bg: "bg-abyssal-surface-high", iconColor: "text-abyssal-primary" },
  pago: { icon: <DollarSign size={16} />, label: "Pago", bg: "bg-abyssal-green/10", iconColor: "text-abyssal-green" },
  cobro: { icon: <HandCoins size={16} />, label: "Cobro", bg: "bg-abyssal-yellow/10", iconColor: "text-abyssal-yellow" },
  gasto: { icon: <TrendingDown size={16} />, label: "Gasto", bg: "bg-abyssal-red/10", iconColor: "text-abyssal-red" },
  transferencia: { icon: <Repeat size={16} />, label: "Transferencia", bg: "bg-abyssal-primary/10", iconColor: "text-abyssal-primary" },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0 && dateStr.includes("T")) return "Hoy"
    if (diffDays === 1) return "Ayer"
    if (diffDays < 7) return `Hace ${diffDays} días`
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" })
  } catch {
    return dateStr
  }
}

function formatCurrency(n: number) {
  const prefix = n < 0 ? "-" : ""
  return `${prefix}$${Math.abs(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function RecentActivityList({ items, onPress }: RecentActivityListProps) {
  return (
    <div>
      <h3 className="text-title-medium text-abyssal-text-primary mb-3">Actividad Reciente</h3>
      <div className="bg-abyssal-surface rounded-abyssal-md shadow-abyssal-sm overflow-hidden">
        {items.map((item, i) => {
          const meta = TYPE_META[item.type] || TYPE_META.pago
          return (
            <button
              key={item.id}
              onClick={() => onPress?.(item)}
              className={cn(
                "flex items-center gap-3 p-3 w-full text-left transition-colors hover:bg-abyssal-surface-high",
                i < items.length - 1 && "border-b border-abyssal-outline",
              )}
            >
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", meta.bg, meta.iconColor)}>
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body-medium text-abyssal-text-primary truncate font-medium">
                  {item.title}
                </p>
                <p className="text-label-small text-abyssal-text-secondary">
                  {meta.label} · {formatDate(item.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={item.status} />
                <span className={cn(
                  "text-body-medium font-semibold",
                  item.type === "gasto" ? "text-abyssal-red" : "text-abyssal-text-primary"
                )}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </button>
          )
        })}
        {items.length === 0 && (
          <p className="p-3 text-body-medium text-abyssal-text-secondary text-center">
            Sin actividad reciente
          </p>
        )}
      </div>
    </div>
  )
}
