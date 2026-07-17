"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Phone, MessageCircle, ShoppingCart } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TopBar } from "@/components/layout/TopBar"
import { BottomNav } from "@/components/layout/BottomNav"

interface OrderItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
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
  items_count: number
  items: OrderItem[]
  created_at: string
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—"
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
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
      alert("Error al actualizar el estado")
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Detalle del Pedido" />
        <div className="p-4 space-y-4">
          <div className="h-48 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
          <div className="h-32 rounded-abyssal-md bg-abyssal-surface-overlay animate-pulse" />
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <TopBar title="Detalle del Pedido" />
        <div className="p-4">
          <p className="text-center text-body-medium text-abyssal-red py-8">{error || "Pedido no encontrado"}</p>
        </div>
      </>
    )
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax = subtotal * 0.10

  return (
    <>
      <TopBar
        title={`Pedido #${order.order_number}`}
        rightAction={
          <button
            onClick={() => router.back()}
            className="p-2 rounded-abyssal-full hover:bg-abyssal-surface-overlay transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
          </button>
        }
      />

      <div className="p-4 space-y-4 pb-24">
        {/* Estado y Acciones Rápidas */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-medium text-abyssal-text-secondary">Estado</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-medium text-abyssal-text-secondary">Cliente</p>
            <p className="text-body-medium text-abyssal-text-primary font-semibold">{order.client_name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Pago</p>
            <p className="text-body-medium text-abyssal-text-primary">{order.payment_method}</p>
          </div>
        </div>

        {/* Fechas */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-label-small text-abyssal-text-secondary">Creado</p>
              <p className="text-body-medium text-abyssal-text-primary">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-label-small text-abyssal-text-secondary">Entrega</p>
              <p className="text-body-medium text-abyssal-text-primary">{formatDate(order.delivery_date)}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-border">
          <p className="text-title-medium text-abyssal-text-primary mb-3">Productos ({order.items_count})</p>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-body-medium text-abyssal-text-primary truncate">{item.product_name}</p>
                  <p className="text-label-small text-abyssal-text-secondary">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="text-body-medium text-abyssal-text-primary font-semibold shrink-0 ml-2">
                  {formatCurrency(item.subtotal || item.quantity * item.unit_price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-border space-y-2">
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">Subtotal</span>
            <span className="text-abyssal-text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">IVA (10%)</span>
            <span className="text-abyssal-text-primary">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-title-medium pt-2 border-t border-abyssal-border">
            <span className="text-abyssal-text-primary">Total</span>
            <span className="text-abyssal-text-primary font-bold">{formatCurrency(order.total_value)}</span>
          </div>
        </div>

        {/* Acciones de Estado */}
        {order.status === "PENDIENTE" && (
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={() => handleStatusChange("ENTREGADO")}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Entregar
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => handleStatusChange("ANULADO")}>
              Anular
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  )
}
