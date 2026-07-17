"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

interface OrderDetail {
  id: number
  order_number: string
  client_id: number
  client_name: string
  delivery_date: string
  payment_method: string
  status: string
  total_value: number
  subtotal: number
  tax: number
  items: OrderItem[]
  created_at: string
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch {
    return dateStr
  }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get<OrderDetail>(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Error al cargar pedido"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus: string) {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status: newStatus })
      setOrder(data)
    } catch {
      alert("Error al actualizar el estado del pedido")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-body-medium text-abyssal-text-secondary">Cargando...</div>
  }

  if (error || !order) {
    return (
      <div className="p-4 space-y-4">
        <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-center text-body-medium text-abyssal-red py-8">{error || "Pedido no encontrado"}</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary font-bold">Pedido #{order.order_number}</h1>
        <div className="w-5" />
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Estado</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Cliente</p>
            <p className="text-body-medium text-abyssal-text-primary font-semibold">{order.client_name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Fecha</p>
            <p className="text-body-medium text-abyssal-text-primary">{formatDate(order.created_at)}</p>
          </div>
          {order.delivery_date && (
            <div className="flex items-center justify-between">
              <p className="text-label-medium text-abyssal-text-secondary">Entrega</p>
              <p className="text-body-medium text-abyssal-text-primary">{formatDate(order.delivery_date)}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Pago</p>
            <p className="text-body-medium text-abyssal-text-primary">{order.payment_method}</p>
          </div>
        </div>

        <div className="bg-abyssal-surface rounded-abyssal-md p-4">
          <p className="text-title-medium text-abyssal-text-primary mb-3">Productos</p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-body-medium text-abyssal-text-primary truncate">{item.product_name}</p>
                  <p className="text-label-small text-abyssal-text-secondary">{item.quantity} × {formatCurrency(item.unit_price)}</p>
                </div>
                <p className="text-body-medium text-abyssal-text-primary font-semibold shrink-0 ml-2">
                  {formatCurrency(item.quantity * item.unit_price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-abyssal-surface rounded-abyssal-md p-4 space-y-1">
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">Subtotal</span>
            <span className="text-abyssal-text-primary">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">IVA (10%)</span>
            <span className="text-abyssal-text-primary">{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between text-title-medium pt-1 border-t border-abyssal-outline">
            <span className="text-abyssal-text-primary">Total</span>
            <span className="text-abyssal-text-primary font-bold">{formatCurrency(order.total_value)}</span>
          </div>
        </div>

        {(order.status === "PENDIENTE") && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleStatusChange("ENTREGADO")}
            >
              Marcar Entregado
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleStatusChange("ANULADO")}
            >
              Anular Pedido
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
