"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, ClipboardList, Search, Download, ClipboardList as OrdersIcon, Filter } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { useOrders } from "@/hooks/useOrders"
import { OrderCard } from "@/components/orders/OrderCard"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { exportCSV } from "@/lib/export"
import { StatCard } from "@/components/shared/StatCard"
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
        title="Pedidos"
        icon={<OrdersIcon size={18} />}
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
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Total" value={orders.length} icon={ClipboardList} />
          <StatCard label="Pendientes" value={pendingCount} icon={Filter} iconColor="abyssal-yellow" />
          <StatCard label="Total Ventas" value={`$${totalValue.toLocaleString("es-MX", { minimumFractionDigits: 0 })}`} icon={ClipboardList} iconColor="abyssal-green" />
        </div>

        <FilterTabs tabs={filterTabs} activeKey={filter} onSelect={setFilter} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-body-medium text-abyssal-red py-8">{error}</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No hay pedidos</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Crea tu primer pedido para comenzar</p>
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