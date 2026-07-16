"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { OrderFilters } from "@/components/orders/OrderFilters"
import { OrderCard } from "@/components/orders/OrderCard"
import { useOrders } from "@/hooks/useOrders"

export default function OrdersPage() {
  const [filter, setFilter] = useState("Todos")
  const router = useRouter()

  const statusMap: Record<string, string | undefined> = {
    Todos: undefined,
    Pendientes: "PENDIENTE",
    Entregados: "ENTREGADO",
    Anulados: "ANULADO",
  }

  const apiStatus = statusMap[filter]
  const { data: orders, loading, error } = useOrders(apiStatus)

  const filtered = useMemo(() => {
    if (!apiStatus) return orders
    return orders.filter((o) => o.status === apiStatus)
  }, [orders, apiStatus])

  return (
    <>
      <TopBar title="Pedidos" />
      <div className="p-4 space-y-3">
        <OrderFilters selected={filter} onSelect={setFilter} />
        {loading ? (
          <div className="flex items-center justify-center h-32 text-body-medium text-abyssal-text-secondary">
            Cargando...
          </div>
        ) : error ? (
          <p className="text-center text-body-medium text-abyssal-red py-8">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-body-medium text-abyssal-text-secondary py-8">
            No hay pedidos
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={(id) => router.push(`/orders/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => router.push("/orders/new")}
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:opacity-90 transition-opacity z-30"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  )
}
