"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, ClipboardList, Search, Download } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { OrderCard } from "@/components/orders/OrderCard"
import { useOrders } from "@/hooks/useOrders"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { exportCSV } from "@/lib/export"

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

  const filteredOrders = useMemo(() => {
    if (!searchText) return orders
    const q = searchText.toLowerCase()
    return orders.filter(
      (o) =>
        o.client_name.toLowerCase().includes(q) ||
        o.order_number.toLowerCase().includes(q)
    )
  }, [orders, searchText])

  return (
    <>
      <TopBar
        title="Pedidos"
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
        <OrderFilters selected={filter} onSelect={setFilter} />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-[15px] text-abyssal-red py-8">{error}</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-[17px] font-semibold text-abyssal-text-primary mb-2">No hay pedidos</p>
            <p className="text-[15px] text-abyssal-text-secondary mb-4">Crea tu primer pedido para comenzar</p>
            <Link href="/orders/new">
              <Button variant="primary">Crear Pedido</Button>
            </Link>
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
      <Link
        href="/orders/new"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
        aria-label="Crear pedido"
      >
        <Plus className="w-6 h-6" />
      </Link>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
