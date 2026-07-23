"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatters"
import type { TaxConfig, BusinessProfile } from "@/lib/types"

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

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [taxConfig, setTaxConfig] = useState<TaxConfig | null>(null)
  const [business, setBusiness] = useState<BusinessProfile | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.all([
      api.get<OrderDetail>(`/orders/${id}`),
      api.get<TaxConfig>("/tax-config").catch(() => null),
      api.get<BusinessProfile>("/business/profile").catch(() => null),
    ]).then(([orderRes, taxRes, bizRes]) => {
      setOrder(orderRes.data)
      setTaxConfig(taxRes?.data ?? null)
      setBusiness(bizRes?.data ?? null)
    }).catch(() => setError("Error al cargar pedido"))
      .finally(() => setLoading(false))
  }, [id])

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 p-4">
        <p className="text-lg font-medium text-gray-800">{error || "Pedido no encontrado"}</p>
        <Button variant="primary" onClick={() => router.back()}>Volver</Button>
      </div>
    )
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxRate = (taxConfig?.is_enabled && taxConfig?.rate) ? taxConfig.rate / 100 : 0
  const tax = subtotal * taxRate
  const businessName = business?.business_name || "Abyssal ERP"
  const ownerName = business?.owner_name || ""

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="no-print sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Recibo</h1>
        <button onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Imprimir">
          <Printer className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="max-w-[400px] mx-auto p-4" ref={printRef}>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div className="text-center border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">{businessName}</h2>
            {ownerName && <p className="text-sm text-gray-500 mt-0.5">{ownerName}</p>}
            <p className="text-xs text-gray-400 mt-1">Recibo de Pedido</p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Pedido #</p>
              <p className="font-semibold text-gray-900">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Fecha</p>
              <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs text-gray-500 mb-1">Cliente</p>
            <p className="font-semibold text-gray-900">{order.client_name}</p>
            <p className="text-sm text-gray-500">{order.payment_method}</p>
            {order.delivery_date && (
              <p className="text-sm text-gray-500">Entrega: {formatDate(order.delivery_date)}</p>
            )}
          </div>

          <table className="w-full text-sm border-t border-gray-200 pt-2">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left py-2 font-medium">Producto</th>
                <th className="text-center py-2 font-medium">Cant</th>
                <th className="text-right py-2 font-medium">Precio</th>
                <th className="text-right py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="border-t border-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2 text-gray-900">{item.product_name}</td>
                  <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(item.subtotal || item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{taxConfig?.is_enabled ? `${taxConfig.name} (${taxConfig.rate}%)` : "Impuesto"}</span>
              <span className="text-gray-900">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatCurrency(subtotal + tax)}</span>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
            <p>Abyssal ERP — Sistema de Gestión</p>
            <p className="mt-0.5">Generado el {formatDateTime(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  )
}
