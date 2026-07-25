"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Download, ClipboardList as OrdersIcon } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { useOrders } from "@/hooks/useOrders"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { exportCSV } from "@/lib/export"
import { FAB } from "@/components/shared/FAB"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import { statusColor } from "@/lib/status-colors"

export default function OrdersPage() {
  const [filter, setFilter] = useState("Todos")
  const [searchText, setSearchText] = useState("")
  const router = useRouter()

  const statusMap: Record<string, string | undefined> = {
    Todos: undefined,
    Pendientes: "PENDIENTE",
    Entregados: "ENTREGADO",
    Anulados: "ANULADO",
  }

  const { toasts, addToast, removeToast } = useToast()
  const apiStatus = statusMap[filter]
  const { data: orders, loading, error } = useOrders(apiStatus)

  const pendingCount = orders.filter((o) => o.status === "PENDIENTE").length
  const deliveredCount = orders.filter((o) => o.status === "ENTREGADO").length
  const totalValue = orders.reduce((s, o) => s + o.total_value, 0)

  const filteredOrders = useMemo(() => {
    if (!searchText) return orders
    const q = searchText.toLowerCase()
    return orders.filter((o) => o.client_name.toLowerCase().includes(q) || o.order_number.toLowerCase().includes(q))
  }, [orders, searchText])

  const recentOrders = useMemo(() => [...filteredOrders].slice(-5).reverse(), [filteredOrders])

  return (
    <>
      <TopBar
        title="Ventas"
        icon={<OrdersIcon size={18} />}
        subtitle="Facturación y comisiones"
        rightAction={
          <div className="flex items-center gap-1">
            <CollapsibleSearchBar value={searchText} onChange={setSearchText} placeholder="Buscar por cliente o #pedido..." />
            <button
              onClick={() => {
                if (!orders.length) { addToast("No hay datos para exportar", "error"); return }
                exportCSV(orders.map(o => ({ ...o, created_at: o.created_at || "" })), "pedidos", {
                  order_number: "# Pedido", client_name: "Cliente", status: "Estado", total_value: "Total", created_at: "Fecha"
                })
                addToast("Pedidos exportados", "success")
              }}
              className="p-2 rounded-full hover:bg-abyssal-surface-high transition-colors active:scale-95"
            >
              <Download className="w-5 h-5 text-abyssal-text-secondary" />
            </button>
          </div>
        }
      />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Ventas</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Facturación y comisiones</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (orders.length === 0) return
                exportCSV(orders.map(o => ({ ...o, created_at: o.created_at || "" })), "pedidos", {
                  order_number: "# Pedido", client_name: "Cliente", status: "Estado", total_value: "Total", created_at: "Fecha"
                })
              }}
              className="p-2 rounded-lg hover:bg-abyssal-surface-high transition-colors"
            >
              <Download size={18} className="text-abyssal-text-secondary-variant" />
            </button>
            <button
              onClick={() => router.push("/orders/new")}
              className="px-4 py-2 bg-[#4A9FD8] text-white rounded-xl text-[13px] font-semibold flex items-center gap-1.5 hover:bg-[#4A9FD8]/90 transition-colors"
            >
              <Plus size={16} />
              Nuevo Pedido
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Total Facturado</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {formatCurrency(totalValue)}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Comisiones</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {formatCurrency(totalValue * 0.1)}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Facturas Pendientes</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{pendingCount}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ticket Promedio</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {orders.length > 0 ? formatCurrency(totalValue / orders.length) : "--"}
            </p>
          </KpiCard>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "Todos", label: "Todos", count: orders.length },
            { key: "Pendientes", label: "Pendientes", count: pendingCount },
            { key: "Entregados", label: "Entregados", count: deliveredCount },
            { key: "Anulados", label: "Anulados", count: orders.filter((o) => o.status === "ANULADO").length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                filter === t.key ? "bg-[#4A9FD8] text-white" : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-high/80"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-abyssal-lg" />)}
          </div>
        ) : error ? (
          <p className="text-center text-[14px] text-[#ef4444] font-body py-8">{error}</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <OrdersIcon size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-[16px] text-abyssal-text-primary font-heading mb-2">No hay pedidos</p>
            <p className="text-[14px] text-abyssal-text-secondary font-body mb-4">Crea tu primer pedido para comenzar</p>
          </div>
        ) : (
          <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Facturas Recientes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">FACTURA</th>
                    <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">CLIENTE</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">FECHA</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">MONTO</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const status = order.status
                    const colors = statusColor[status] || { bg: "bg-[rgba(74,159,216,0.1)]", text: "text-[#4A9FD8]" }
                    return (
                      <tr key={order.id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                        <td className="px-6 py-4 text-[12px] text-abyssal-text-secondary-variant font-mono">{order.order_number}</td>
                        <td className="px-6 py-4 text-[13px] text-abyssal-text-secondary font-body">{order.client_name}</td>
                        <td className="px-6 py-4 text-right text-[12px] text-abyssal-text-secondary-variant font-caption">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "--"}
                        </td>
                        <td className="px-6 py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">
                          {formatCurrency(order.total_value)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium ${colors.bg} ${colors.text}`}>{status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <FAB href="/orders/new" aria-label="Crear pedido">
        <Plus className="w-6 h-6" />
      </FAB>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}