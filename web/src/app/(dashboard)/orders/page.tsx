"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ClipboardList } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

  return (
    <>
      <TopBar title="Pedidos" />
      <div className="p-4 space-y-3">
        <OrderFilters selected={filter} onSelect={setFilter} />
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
            <Link href="/orders/new">
              <Button variant="primary">Crear Pedido</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
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
      >
        <Plus className="w-6 h-6" />
      </Link>
    </>
  )
}
