"use client"
import { TrendingUp, ShoppingCart, Package, DollarSign, Repeat, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatsCard } from "./StatsCard"

interface DashboardData {
  gross_profit: number
  sales_total: number
  purchases_total: number
  cash_total: number
  transfer_total: number
  pending_orders: number
  low_stock_count: number
  total_clients: number
  total_suppliers: number
}

interface BentoGridProps {
  data: DashboardData
}

export function BentoGrid({ data }: BentoGridProps) {
  const formatCurrency = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`

  const items = [
    { icon: <TrendingUp size={18} />, label: "Ganancia Bruta", value: formatCurrency(data.gross_profit) },
    { icon: <ShoppingCart size={18} />, label: "Ventas", value: formatCurrency(data.sales_total) },
    { icon: <Package size={18} />, label: "Compras", value: formatCurrency(data.purchases_total) },
    { icon: <DollarSign size={18} />, label: "Efectivo", value: formatCurrency(data.cash_total) },
    { icon: <Repeat size={18} />, label: "Transferencias", value: formatCurrency(data.transfer_total) },
    { icon: <AlertTriangle size={18} />, label: "Pendientes / Stock Bajo", value: `${data.pending_orders} / ${data.low_stock_count}` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="animate-stagger-in" style={{ animationDelay: `${i * 50}ms` }}>
          <StatsCard icon={item.icon} label={item.label} value={item.value} />
        </div>
      ))}
    </div>
  )
}
