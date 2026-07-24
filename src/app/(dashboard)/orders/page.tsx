"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, Download, ClipboardList as OrdersIcon, TrendingUp, ArrowUpRight } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { useOrders } from "@/hooks/useOrders"
import { OrderCard } from "@/components/orders/OrderCard"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { exportCSV } from "@/lib/export"
import { FilterTabs } from "@/components/shared/FilterTabs"
import { FAB } from "@/components/shared/FAB"
import { Skeleton } from "@/components/ui/skeleton"

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
    return orders.filter(
      (o) =>
        o.client_name.toLowerCase().includes(q) ||
        o.order_number.toLowerCase().includes(q)
    )
  }, [orders, searchText])

  const filterTabs = [
    { key: "Todos", label: "Todos", count: orders.length },
    { key: "Pendientes", label: "Pendientes", count: pendingCount },
    { key: "Entregados", label: "Entregados", count: deliveredCount },
    { key: "Anulados", label: "Anulados", count: orders.filter((o) => o.status === "ANULADO").length },
  ]

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
                if (orders.length === 0) { addToast("No hay datos para exportar", "error"); return }
                exportCSV(orders.map(o => ({ ...o, created_at: o.created_at || "" })), "pedidos", {
                  order_number: "# Pedido", client_name: "Cliente", status: "Estado",
                  total_value: "Total", created_at: "Fecha"
                })
                addToast("Pedidos exportados", "success")
              }}
              className="p-2 rounded-full hover:bg-abyssal-surface-high transition-colors active:scale-95"
              aria-label="Exportar pedidos"
            >
              <Download className="w-5 h-5 text-abyssal-text-secondary" />
            </button>
          </div>
        }
      />
      <div className="p-4 lg:p-0 space-y-4 lg:space-y-6">
        {loading ? null : !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            <KpiCard>
              <p className="text-label-medium text-abyssal-text-secondary font-body">Facturación Mensual</p>
              <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">
                ${totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <ArrowUpRight size={14} className="text-abyssal-primary" />
                <span className="text-xs font-semibold text-abyssal-primary font-caption">+12.5%</span>
                <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            </KpiCard>
            <KpiCard>
              <p className="text-label-medium text-abyssal-text-secondary font-body">Comisiones</p>
              <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">
                ${(totalValue * 0.1).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <ArrowUpRight size={14} className="text-abyssal-primary" />
                <span className="text-xs font-semibold text-abyssal-primary font-caption">+8.3%</span>
                <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            </KpiCard>
            <KpiCard>
              <p className="text-label-medium text-abyssal-text-secondary font-body">Facturas Pendientes</p>
              <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{pendingCount}</p>
              <div className="flex items-center gap-1.5 mt-3">
                <TrendingUp size={14} className="text-abyssal-yellow" />
                <span className="text-xs font-semibold text-abyssal-yellow font-caption">-3.1%</span>
                <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            </KpiCard>
            <KpiCard>
              <p className="text-label-medium text-abyssal-text-secondary font-body">Ticket Promedio</p>
              <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">
                ${orders.length > 0 ? (totalValue / orders.length).toLocaleString("es-MX", { minimumFractionDigits: 2 }) : "0.00"}
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <ArrowUpRight size={14} className="text-abyssal-primary" />
                <span className="text-xs font-semibold text-abyssal-primary font-caption">+4.7%</span>
                <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
              </div>
            </KpiCard>
          </div>
        )}

        <FilterTabs tabs={filterTabs} activeKey={filter} onSelect={setFilter} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-abyssal-lg" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-body-medium text-abyssal-red py-8">{error}</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <OrdersIcon size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary font-heading mb-2">No hay pedidos</p>
            <p className="text-body-medium text-abyssal-text-secondary font-body mb-4">Crea tu primer pedido para comenzar</p>
            <FAB href="/orders/new" aria-label="Crear pedido">
              <Plus className="w-6 h-6" />
            </FAB>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={(id) => router.push(`/orders/${id}`)}
              />
            ))}
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