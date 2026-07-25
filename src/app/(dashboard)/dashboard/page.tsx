"use client"
import { useState, useEffect } from "react"
import { TrendingUp, Search, Bell, Plus, FileText, DollarSign, Package, UserPlus, Info, Check } from "lucide-react"
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

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "file-text": FileText,
  "dollar-sign": DollarSign,
  "package": Package,
  "user-plus": UserPlus,
  "info": Info,
  "check": Check,
}

export default function DashboardPage() {
  const router = useRouter()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const { lowStockCount, loading: productsLoading } = useProducts()
  const { data: orders, loading: ordersLoading } = useOrders()
  const { data: summary, loading: txsLoading } = useTransactions()

  const loading = productsLoading || ordersLoading || txsLoading
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<ActivityItem[]>("/activity/recent")
      .then((res) => setActivity(res.data))
      .catch(() => {})
      .finally(() => setActivityLoading(false))
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

  function handleActivityPress(item: ActivityItem) {
    if (item.type === "pedido") router.push(`/orders/${item.reference_id}`)
    else if (item.type === "compra") router.push(`/purchases/${item.reference_id}`)
  }

  if (loading) {
    return (
      <>
        <TopBar title="Dashboard" icon={<TrendingUp size={18} />} />
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
      <TopBar title="Dashboard" icon={<TrendingUp size={18} />} />

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
            <Search size={18} className="text-abyssal-text-secondary-variant" />
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
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ingresos Totales</span>
              <svg width="80" height="36" viewBox="0 0 80 36" className="text-abyssal-primary">
                <path d="M0 34l7-13 8 5 7-11 7 4 7-10 8 4 7-3 7-3 7 3 8-5 7-3v34H0z" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {formatCurrency(dashboardData.sales_total ?? 0)}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp size={14} className="text-abyssal-primary" />
              <span className="text-[13px] text-abyssal-primary font-caption font-semibold">12.5%</span>
              <span className="text-[13px] text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>

          <KpiCard>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Total de Órdenes</span>
              <svg width="80" height="36" viewBox="0 0 80 36" className="text-abyssal-primary">
                <path d="M0 29l7 5 8-16 7 5 7-10 7 7 8-13 7 6 7 3 7-7 8-4 7-3v34H0z" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {totalOrders ?? 0}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp size={14} className="text-abyssal-primary" />
              <span className="text-[13px] text-abyssal-primary font-caption font-semibold">8.2%</span>
              <span className="text-[13px] text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>

          <KpiCard>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ganancia Bruta</span>
              <svg width="80" height="36" viewBox="0 0 80 36" className="text-abyssal-primary">
                <path d="M0 34l7-13 8 5 7-11 7 4 7-10 8 4 7-3 7-3 7 3 8-5 7-3v34H0z" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {formatCurrency(dashboardData.gross_profit ?? 0)}
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp size={14} className="text-abyssal-primary" />
              <span className="text-[13px] text-abyssal-primary font-caption font-semibold">15.3%</span>
              <span className="text-[13px] text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>

          <KpiCard>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">Tasa de Mermas</span>
              <div className="text-[#EF4444] px-1.5 py-0.5 rounded bg-[#EF4444]/10 text-[10px] font-bold">Crítico</div>
            </div>
            <p className="text-[26px] text-[#EF4444] font-heading font-bold mt-2">
              2.4%
            </p>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-abyssal-outline rounded-full overflow-hidden">
                <div className="h-full bg-[#EF4444]" style={{ width: "24%" }} />
              </div>
              <div className="flex justify-between text-[11px] text-abyssal-text-secondary-variant mt-1.5">
                <span>Merma: 12.5 kg</span>
                <span>Límite: 3.0%</span>
              </div>
            </div>
          </KpiCard>
        </div>

        {/* Chart Row */}
        <div className="flex gap-5">
          {/* Resumen de Ventas */}
          <div className="flex-1 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
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
            <div className="h-[220px] relative">
              {/* SVG Chart matching the PENCIL design */}
              <svg width="100%" height="180" viewBox="0 0 540 180" className="mt-2" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--abyssal-primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--abyssal-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 90l49.1-14 49.1 8 49.1-28 49.1 8 49.1-24 49 10 49.1-14 49.1 8 49.1-20 49.1-8 49.1-16v180H0z" fill="url(#chartGrad)" />
                <path d="M0 90l49.1-14 49.1 8 49.1-28 49.1 8 49.1-24 49 10 49.1-14 49.1 8 49.1-20 49.1-8 49.1-16" fill="none" stroke="var(--abyssal-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {[37, 86.09, 135.18, 184.27, 233.36, 282.45, 331.55, 380.64, 429.73, 478.82, 527.91, 577].map((x, i) => (
                  <circle key={i} cx={x} cy={[90, 76, 84, 56, 64, 40, 50, 36, 44, 24, 16, 0][i]} r="3" fill="var(--abyssal-primary)" />
                ))}
                <text x="0" y="174" fill="#999" fontSize="10" fontFamily="Geist">0k</text>
                <text x="0" y="114" fill="#999" fontSize="10" fontFamily="Geist">30k</text>
                <text x="0" y="56" fill="#999" fontSize="10" fontFamily="Geist">59k</text>
                <text x="0" y="-6" fill="#999" fontSize="10" fontFamily="Geist">90k</text>
                <text x="28" y="184" fill="#999" fontSize="10" fontFamily="Geist">Ene</text>
                <text x="126.18" y="184" fill="#999" fontSize="10" fontFamily="Geist">Mar</text>
                <text x="224.36" y="184" fill="#999" fontSize="10" fontFamily="Geist">May</text>
                <text x="322.55" y="184" fill="#999" fontSize="10" fontFamily="Geist">Jul</text>
                <text x="420.73" y="184" fill="#999" fontSize="10" fontFamily="Geist">Sep</text>
                <text x="518.91" y="184" fill="#999" fontSize="10" fontFamily="Geist">Nov</text>
              </svg>
            </div>
          </div>

          {/* Margen de Contribución por Producto */}
          <div className="w-[300px] shrink-0 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Margen de Contribución</h3>
            <p className="text-[13px] text-abyssal-text-secondary-variant font-body mt-1">Margen real diario (Top 5 hoy)</p>
            <div className="mt-4 space-y-5">
              {[
                { name: "Camarón Premium", value: "32.4%", pct: 100, color: "#22c55e" },
                { name: "Filete de Pescado", value: "28.1%", pct: 85, color: "#22c55e" },
                { name: "Pulpo Congelado", value: "24.5%", pct: 75, color: "#22c55e" },
                { name: "Langostino Entero", value: "18.7%", pct: 58, color: "#eab308" },
                { name: "Mero Fresco", value: "12.2%", pct: 38, color: "#EF4444" },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">{p.name}</span>
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
          </div>
        </div>

        {/* Table Row */}
        <div className="flex gap-5">
          {/* Órdenes Recientes */}
          <div className="flex-1 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
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
                          ${order.total_value.toLocaleString("en-US")}
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
          <div className="flex-1 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
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