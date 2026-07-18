"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, Receipt } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import { formatDate, formatCurrency } from "@/lib/formatters"

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
  const [submitting, setSubmitting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<OrderDetail>(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError("Error al cargar pedido"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusChange(newStatus: string) {
    setSubmitting(true)
    try {
      const { data } = await api.patch(`/orders/${id}/status`, { status: newStatus })
      setOrder(data)
    } catch {
      addToast("Error al actualizar el estado", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3">
          <Skeleton className="h-6 w-48" />
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3">
          <p className="text-[20px] font-bold text-abyssal-text-primary">Detalle del Pedido</p>
        </header>
        <div className="p-4">
          <p className="text-center text-[15px] text-abyssal-red py-8">{error || "Pedido no encontrado"}</p>
        </div>
      </>
    )
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax = subtotal * 0.10

  return (
    <>
      <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-[17px] font-semibold text-abyssal-text-primary">Pedido #{order.order_number}</h1>
        <div className="w-9" />
      </header>

      <div className="p-4 space-y-4 pb-24">
        <div className="bg-abyssal-surface glass rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-abyssal-text-secondary">Estado</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] text-abyssal-text-secondary">Cliente</p>
            <p className="text-[15px] text-abyssal-text-primary font-semibold">{order.client_name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-abyssal-text-secondary">Pago</p>
            <p className="text-[15px] text-abyssal-text-primary">{order.payment_method}</p>
          </div>
        </div>

        <div className="bg-abyssal-surface glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] text-abyssal-text-secondary">Creado</p>
              <p className="text-[15px] text-abyssal-text-primary">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-abyssal-text-secondary">Entrega</p>
              <p className="text-[15px] text-abyssal-text-primary">{formatDate(order.delivery_date)}</p>
            </div>
          </div>
        </div>

        <div className="bg-abyssal-surface glass rounded-2xl p-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <p className="text-[17px] font-semibold text-abyssal-text-primary mb-3">Productos ({order.items_count})</p>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-abyssal-text-primary truncate">{item.product_name}</p>
                  <p className="text-[12px] text-abyssal-text-secondary">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <p className="text-[15px] text-abyssal-text-primary font-semibold shrink-0 ml-2">
                  {formatCurrency(item.subtotal || item.quantity * item.unit_price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-abyssal-surface glass rounded-2xl p-4 space-y-2 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="flex justify-between text-[15px]">
            <span className="text-abyssal-text-secondary">Subtotal</span>
            <span className="text-abyssal-text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[15px]">
            <span className="text-abyssal-text-secondary">IVA (10%)</span>
            <span className="text-abyssal-text-primary">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-[17px] font-semibold pt-2 border-t border-abyssal-outline/15">
            <span className="text-abyssal-text-primary">Total</span>
            <span className="text-abyssal-text-primary font-bold">{formatCurrency(order.total_value)}</span>
          </div>
        </div>

        {order.status === "PENDIENTE" && (
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleStatusChange("ENTREGADO")}
              loading={submitting}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Entregar
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleStatusChange("ANULADO")}
              disabled={submitting}
            >
              Anular
            </Button>
          </div>
        )}
        <Link href={`/orders/${order.id}/invoice`}>
          <Button variant="ghost" size="md" className="w-full gap-2">
            <Receipt className="w-4 h-4" />
            Ver Recibo
          </Button>
        </Link>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
