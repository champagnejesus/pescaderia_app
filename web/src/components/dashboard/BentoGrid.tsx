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

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatsCard icon={<TrendingUp size={18} />} label="Ganancia Bruta" value={formatCurrency(data.gross_profit)} />
      <StatsCard icon={<ShoppingCart size={18} />} label="Ventas" value={formatCurrency(data.sales_total)} />
      <StatsCard icon={<Package size={18} />} label="Compras" value={formatCurrency(data.purchases_total)} />
      <StatsCard icon={<DollarSign size={18} />} label="Efectivo" value={formatCurrency(data.cash_total)} />
      <StatsCard icon={<Repeat size={18} />} label="Transferencias" value={formatCurrency(data.transfer_total)} />
      <StatsCard
        icon={<AlertTriangle size={18} />}
        label="Pendientes / Stock Bajo"
        value={`${data.pending_orders} / ${data.low_stock_count}`}
      />
    </div>
  )
}
