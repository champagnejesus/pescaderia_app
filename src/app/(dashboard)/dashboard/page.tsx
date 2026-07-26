"use client"
import { useState, useEffect } from "react"
import { TrendUp, MagnifyingGlass, Bell, Plus, FileText, CurrencyDollar, Package, UserPlus, Info, Check, Wallet, ShoppingCart, ChartBar } from "@phosphor-icons/react"
import Link from "next/link"
import { KpiCard } from "@/components/ui/kpi-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useProducts } from "@/hooks/useProducts"
import { useOrders } from "@/hooks/useOrders"
import { useTransactions } from "@/hooks/useTransactions"
import { TopBar } from "@/components/layout/TopBar"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/formatters"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"

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

const statusColor: Record<string, { bg: string; text: string }> = {
  COMPLETADO: { bg: "bg-[rgba(34,197,94,0.1)]", text: "text-abyssal-green" },
  PROCESANDO: { bg: "bg-[rgba(74,159,216,0.1)]", text: "text-abyssal-primary" },
  PENDIENTE: { bg: "bg-[rgba(234,179,8,0.1)]", text: "text-[#eab308]" },
}

const iconMap: Record<string, React.FC<any>> = {
  "file-text": FileText,
  "dollar-sign": CurrencyDollar,
  "package": Package,
  "user-plus": UserPlus,
  "info": Info,
  "check": Check,
}

export default function DashboardPage() {
  const router = useRouter()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const { data: products, lowStockCount, loading: productsLoading } = useProducts()
  const { data: orders, loading: ordersLoading } = useOrders()
  const { data: summary, loading: txsLoading } = useTransactions()
  const [adjustments, setAdjustments] = useState<any[]>([])

  const loading = productsLoading || ordersLoading || txsLoading
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<ActivityItem[]>("/activity/recent")
      .then((res) => setActivity(res.data))
      .catch(() => {})
      .finally(() => setActivityLoading(false))

    api.get("/inventory/adjustments")
      .then((res) => setAdjustments(res.data.adjustments || []))
      .catch(() => {})
  }, [])

  const dashboardData = {
    gross_profit: summary?.net_total ?? 0,
    sales_total: summary?.total_sales ?? 0,
    purchases_total: summary?.total_expenses ?? 0,
    cash_total: summary?.cash_total ?? 0,
    transfer_total: (summary?.transfer_total ?? 0) + (summary?.card_total ?? 0),
    pending_orders: orders.filter((o) => o.status === "PENDIENTE").length,
    low_stock_count: lowStockCount,
    total_clients: 0,
    total_suppliers: 0,
  }

  const pendingOrders = orders.filter((o) => o.status === "PENDIENTE")
  const recentOrders = orders.slice(-6).reverse()
  const totalOrders = orders.length

  // Calculate dynamic Shrinkage Rate (Mermas)
  const totalStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0)
  const mermas = adjustments.filter(adj => (adj.reason || "").toLowerCase().includes("merma"))
  const totalMermaQty = mermas.reduce((acc, curr) => acc + Math.abs(curr.quantity_adjusted || 0), 0)
  const shrinkageRate = (totalStock + totalMermaQty) > 0 ? (totalMermaQty / (totalStock + totalMermaQty)) * 100 : 0
  const shrinkageWeight = totalMermaQty
  const shrinkageStatusLabel = shrinkageRate > 3.0 ? "Crítico" : "Normal"
  const shrinkageBadgeColor = shrinkageRate > 3.0 ? "text-[#EF4444] bg-[#EF4444]/10" : "text-[#22c55e] bg-[#22c55e]/10"
  const shrinkageTextColor = shrinkageRate > 3.0 ? "text-[#EF4444]" : "text-[#22c55e]"
  const shrinkageBarColor = shrinkageRate > 3.0 ? "bg-[#EF4444]" : "bg-[#22c55e]"
  const shrinkageBarWidth = `${Math.min((shrinkageRate / 3.0) * 100, 100)}%`

  // Calculate dynamic top margin products (Contribution Margin)
  const topProducts = products
    .filter(p => (p.price_venta || 0) > 0)
    .map(p => {
      const pcompra = p.price_compra || 0
      const pventa = p.price_venta || 0
      const margin = ((pventa - pcompra) / pventa) * 100
      return {
        name: p.name,
        value: `${margin.toFixed(1)}%`,
        pct: Math.min(Math.max(margin, 0), 100),
        color: margin >= 30 ? "#22c55e" : margin >= 15 ? "#eab308" : "#EF4444"
      }
    })
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 5)

  // Calculate dynamic growth percentages compared to previous month
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const prevMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

  let thisMonthSales = 0
  let prevMonthSales = 0
  let thisMonthOrders = 0
  let prevMonthOrders = 0

  orders.forEach(o => {
    const d = new Date(o.created_at || o.delivery_date)
    const m = d.getMonth()
    const y = d.getFullYear()
    if (y === thisYear && m === thisMonth) {
      thisMonthSales += o.total_value || 0
      thisMonthOrders += 1
    } else if (y === prevMonthYear && m === prevMonth) {
      prevMonthSales += o.total_value || 0
      prevMonthOrders += 1
    }
  })

  const salesGrowth = prevMonthSales === 0 ? null : ((thisMonthSales - prevMonthSales) / prevMonthSales) * 100
  const ordersGrowth = prevMonthOrders === 0 ? null : ((thisMonthOrders - prevMonthOrders) / prevMonthOrders) * 100
  const profitGrowth = salesGrowth

  // Calculate monthly sales for the graph dynamically
  const monthlyData = Array(12).fill(0)
  const currentYear = new Date().getFullYear()
  orders.forEach((o) => {
    const d = new Date(o.created_at || o.delivery_date)
    if (d.getFullYear() === currentYear) {
      const month = d.getMonth()
      monthlyData[month] += o.total_value || 0
    }
  })

  const maxSales = Math.max(...monthlyData, 1000)

  const xCoords = [45, 90, 135, 180, 225, 270, 315, 360, 405, 450, 495, 540]
  const points = monthlyData.map((val, i) => {
    const x = xCoords[i]
    const y = 170 - (val / maxSales) * 140
    return { x, y }
  })

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : ""
  const areaD = points.length > 0
    ? `M ${points[0].x} 170 L ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ") + ` L ${points[points.length - 1].x} 170 Z`
    : ""

  function handleActivityPress(item: ActivityItem) {
    if (item.type === "pedido") router.push(`/orders/${item.reference_id}`)
    else if (item.type === "compra") router.push(`/purchases/${item.reference_id}`)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Dashboard" icon={<TrendUp size={18} />} />
        <div className="p-4 lg:p-0 space-y-4 lg:space-y-6">
          <div className="hidden lg:block"><Skeleton className="h-[64px] w-full" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-[130px] rounded-abyssal-lg" />)}
          </div>
          <Skeleton className="h-[350px] rounded-abyssal-lg" />
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title="Dashboard" icon={<TrendUp size={18} />} />

      {/* Header — desktop only */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Dashboard</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Resumen general del sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/orders/new">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus size={16} />
              Nuevo Pedido
            </Button>
          </Link>
          <button className="p-2 rounded-lg hover:bg-abyssal-surface-high transition-colors">
            <MagnifyingGlass size={18} className="text-abyssal-text-secondary-variant" />
          </button>
          <button className="p-2 rounded-lg hover:bg-abyssal-surface-high transition-colors">
            <Bell size={18} className="text-abyssal-text-secondary-variant" />
          </button>
          <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-abyssal-surface-high border border-abyssal-outline">
            <span className="text-[12px] text-abyssal-text-secondary font-caption">
              {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <div className="flex items-start justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ingresos Totales</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 shrink-0">
                <Wallet size={16} />
              </div>
            </div>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {formatCurrency(dashboardData.sales_total ?? 0)}
            </p>
            {salesGrowth !== null ? (
              <div className="flex items-center gap-1.5 mt-3">
                <TrendUp size={14} className={salesGrowth >= 0 ? "text-abyssal-primary" : "text-[#EF4444]"} />
                <span className={`text-[13px] font-caption font-semibold ${salesGrowth >= 0 ? "text-abyssal-primary" : "text-[#EF4444]"}`}>
                  {salesGrowth >= 0 ? "+" : ""}{salesGrowth.toFixed(1)}%
                </span>
                <span className="text-[13px] text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            ) : (
              <div className="flex items-center mt-3">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-caption font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Sin datos previos
                </span>
              </div>
            )}
          </KpiCard>

          <KpiCard>
            <div className="flex items-start justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Total de Órdenes</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 shrink-0">
                <ShoppingCart size={16} />
              </div>
            </div>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {totalOrders ?? 0}
            </p>
            {ordersGrowth !== null ? (
              <div className="flex items-center gap-1.5 mt-3">
                <TrendUp size={14} className={ordersGrowth >= 0 ? "text-abyssal-primary" : "text-[#EF4444]"} />
                <span className={`text-[13px] font-caption font-semibold ${ordersGrowth >= 0 ? "text-abyssal-primary" : "text-[#EF4444]"}`}>
                  {ordersGrowth >= 0 ? "+" : ""}{ordersGrowth.toFixed(1)}%
                </span>
                <span className="text-[13px] text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            ) : (
              <div className="flex items-center mt-3">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-caption font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Sin datos previos
                </span>
              </div>
            )}
          </KpiCard>

          <KpiCard>
            <div className="flex items-start justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ganancia Bruta</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 shrink-0">
                <ChartBar size={16} />
              </div>
            </div>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {formatCurrency(dashboardData.gross_profit ?? 0)}
            </p>
            {profitGrowth !== null ? (
              <div className="flex items-center gap-1.5 mt-3">
                <TrendUp size={14} className={profitGrowth >= 0 ? "text-abyssal-primary" : "text-[#EF4444]"} />
                <span className={`text-[13px] font-caption font-semibold ${profitGrowth >= 0 ? "text-abyssal-primary" : "text-[#EF4444]"}`}>
                  {profitGrowth >= 0 ? "+" : ""}{profitGrowth.toFixed(1)}%
                </span>
                <span className="text-[13px] text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            ) : (
              <div className="flex items-center mt-3">
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-caption font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Sin datos previos
                </span>
              </div>
            )}
          </KpiCard>
          <KpiCard>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Tasa de Mermas</span>
              <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${shrinkageBadgeColor}`}>
                {shrinkageStatusLabel}
              </div>
            </div>
            <p className={`text-[26px] font-heading font-bold mt-2 ${shrinkageTextColor}`}>
              {shrinkageRate.toFixed(1)}%
            </p>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-abyssal-outline rounded-full overflow-hidden">
                <div className={`h-full transition-all ${shrinkageBarColor}`} style={{ width: shrinkageBarWidth }} />
              </div>
              <div className="flex justify-between text-[11px] text-abyssal-text-secondary-variant mt-1.5">
                <span>Merma: {shrinkageWeight.toFixed(1)} kg</span>
                <span>Límite: 3.0%</span>
              </div>
            </div>
          </KpiCard>
        </div>

        {/* Chart Row */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Resumen de Ventas */}
          <div className="w-full bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-4 lg:p-6 shadow-abyssal-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Resumen de Ventas</h3>
                <p className="text-[13px] text-abyssal-text-secondary-variant font-caption mt-0.5">Ingresos mensuales en miles USD</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded bg-abyssal-primary" />
                <span className="text-[12px] text-abyssal-text-secondary-variant font-caption">Este año</span>
              </div>
            </div>
            <div className="min-h-[200px] lg:min-h-[220px] relative">
              {orders.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <TrendUp size={36} className="text-abyssal-text-secondary-variant/40 mb-2" />
                  <p className="text-[14px] text-abyssal-text-secondary font-medium">Sin datos de ventas</p>
                  <p className="text-[12px] text-abyssal-text-secondary-variant mt-0.5">Registra pedidos para ver tu rendimiento</p>
                </div>
              ) : (
                <svg width="100%" height="100%" viewBox="0 0 560 210" className="mt-2" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--abyssal-primary)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--abyssal-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {pathD && (
                    <>
                      <path d={areaD} fill="url(#chartGrad)" />
                      <path d={pathD} fill="none" stroke="var(--abyssal-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}
                  {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--abyssal-primary)" />
                  ))}
                  <text x="35" y="172" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="end">0</text>
                  <text x="35" y="124" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="end">{(maxSales * 0.33 / 1000).toFixed(0)}k</text>
                  <text x="35" y="76" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="end">{(maxSales * 0.66 / 1000).toFixed(0)}k</text>
                  <text x="35" y="28" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="end">{(maxSales / 1000).toFixed(0)}k</text>
                  <text x="70" y="195" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="middle">Ene</text>
                  <text x="158.18" y="195" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="middle">Mar</text>
                  <text x="246.36" y="195" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="middle">May</text>
                  <text x="334.55" y="195" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="middle">Jul</text>
                  <text x="422.73" y="195" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="middle">Sep</text>
                  <text x="510.91" y="195" fill="#999" fontSize="9" fontFamily="Geist" textAnchor="middle">Nov</text>
                </svg>
              )}
            </div>
          </div>

          {/* Margen de Contribución por Producto */}
          <div className="w-full lg:w-[300px] lg:shrink-0 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-4 lg:p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Margen de Contribución</h3>
            <p className="text-[13px] text-abyssal-text-secondary-variant font-body mt-1">Margen real diario (Top 5 hoy)</p>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <Package size={32} className="text-abyssal-text-secondary-variant/40 mb-2" />
                <p className="text-[13px] text-abyssal-text-secondary font-medium">Sin datos de productos</p>
                <p className="text-[11px] text-abyssal-text-secondary-variant mt-0.5">Agrega precios de compra y venta</p>
              </div>
            ) : (
              <div className="mt-4 space-y-5">
                {topProducts.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-abyssal-text-secondary font-body font-medium truncate max-w-[180px]">{p.name}</span>
                      <span className="text-[13px] font-body font-semibold" style={{ color: p.color }}>{p.value}</span>
                    </div>
                    <div className="h-[6px] bg-abyssal-outline rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${p.pct}%`,
                          backgroundColor: p.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Row */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Órdenes Recientes */}
          <div className="w-full bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-4 lg:p-6 shadow-abyssal-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Órdenes Recientes</h3>
              <Link href="/orders" className="text-[12px] text-abyssal-primary font-body font-medium">Ver todas</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left py-2 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ID</th>
                    <th className="text-left py-2 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">CLIENTE</th>
                    <th className="text-right py-2 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">MONTO</th>
                    <th className="text-right py-2 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? recentOrders.map((order) => {
                    const status = order.status === "ENTREGADO" ? "COMPLETADO" : order.status === "PENDIENTE" ? "PENDIENTE" : "PROCESANDO"
                    const colors = statusColor[status] || statusColor.PROCESANDO
                    return (
                      <tr key={order.id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                        <td className="py-3 text-[12px] text-abyssal-text-secondary-variant font-mono">{order.order_number}</td>
                        <td className="py-3 text-[13px] text-abyssal-text-secondary font-body">{order.client_name}</td>
                        <td className="py-3 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">
                          {formatCurrency(order.total_value)}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium ${colors.bg} ${colors.text}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[13px] text-abyssal-text-secondary-variant font-body">
                        No hay órdenes registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registro de Actividad */}
          <div className="w-full bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-4 lg:p-6 shadow-abyssal-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Registro de Actividad</h3>
              <Link href="/reports" className="text-[12px] text-abyssal-primary font-body font-medium">Ver todo</Link>
            </div>
            <div className="space-y-0">
              {activity.length > 0 ? activity.slice(0, 6).map((item, i) => {
                const icons: Record<string, string> = { "Nueva orden": "file-text", "Pago recibido": "dollar-sign", "Inventario actualizado": "package", "Nuevo usuario": "user-plus", "Alerta de stock": "info", "Orden enviada": "check" }
                const iconName = icons[item.title] || "file-text"
                const IconComponent = iconMap[iconName] || FileText
                const isGreen = item.title === "Pago recibido" || item.title === "Nuevo usuario"
                const isYellow = item.title === "Alerta de stock"
                const iconBg = isGreen ? "bg-[rgba(34,197,94,0.1)]" : isYellow ? "bg-[rgba(234,179,8,0.1)]" : "bg-[rgba(74,159,216,0.1)]"
                const iconColor = isGreen ? "text-abyssal-green" : isYellow ? "text-[#eab308]" : "text-abyssal-primary"
                return (
                  <div key={item.id || i} className={`flex items-center gap-3 py-3 ${i < 5 ? "border-b border-abyssal-outline" : ""}`}>
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                      <IconComponent size={16} className={iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">{item.title}</p>
                      <p className="text-[11px] text-abyssal-text-secondary-variant font-caption truncate">{item.description}</p>
                    </div>
                    <span className="text-[11px] text-abyssal-text-secondary-variant font-caption shrink-0">
                      {item.created_at ? timeAgo(item.created_at) : ""}
                    </span>
                  </div>
                )
              }) : (
                <div className="py-8 text-center text-[13px] text-abyssal-text-secondary-variant font-body">
                  No hay actividad registrada.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAB for mobile */}
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <Link href="/orders/new">
            <button className="w-14 h-14 rounded-full bg-abyssal-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
              <Plus size={24} />
            </button>
          </Link>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days > 1 ? "s" : ""}`
}