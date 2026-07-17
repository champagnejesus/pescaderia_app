"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import api from "@/lib/api"

interface OrderItem {
  id: number; product_id: number; quantity: number; unit_price: number; subtotal: number
}

interface Order {
  id: number; order_number: string; client_id: number; client_name: string
  delivery_date: string; items_count: number; status: string; total_value: number
  created_at: string; items: OrderItem[]
}

function formatDate(dateStr: string) {
  try { return new Date(dateStr).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) }
  catch { return dateStr }
}

function formatCurrency(n: number) { return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` }

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Order>("/orders/" + id).then((r) => setOrder(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-40 text-body-medium text-abyssal-text-secondary">Cargando...</div>
  if (!order) return <div className="flex items-center justify-center h-40 text-body-medium text-abyssal-red">Pedido no encontrado</div>

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary flex-1">Pedido #{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </header>
      <div className="p-4 space-y-4">
        <div className="bg-abyssal-surface rounded-abyssal-sm p-4 space-y-2">
          <p className="text-title-medium text-abyssal-text-primary">Cliente</p>
          <p className="text-body-medium text-abyssal-text-primary">{order.client_name}</p>
          <p className="text-label-small text-abyssal-text-secondary">{formatDate(order.created_at)}</p>
        </div>
        <div className="bg-abyssal-surface rounded-abyssal-sm p-4">
          <p className="text-title-medium text-abyssal-text-primary mb-3">Productos</p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-body-medium text-abyssal-text-primary">#{item.product_id} x{item.quantity}</span>
                <span className="text-body-medium text-abyssal-text-primary font-semibold">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-abyssal-surface rounded-abyssal-sm p-4 flex items-center justify-between">
          <span className="text-title-medium text-abyssal-text-primary">Total</span>
          <span className="text-headline-medium text-abyssal-text-primary font-bold">{formatCurrency(order.total_value)}</span>
        </div>
      </div>
    </div>
  )
}
