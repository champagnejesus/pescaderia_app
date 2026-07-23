"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, HandCoins } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PayDialog } from "@/components/cash-register/PayDialog"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import { formatCurrency, formatDateTime } from "@/lib/formatters"

interface PurchaseItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface PurchaseDetail {
  id: number
  purchase_number: string
  supplier_id: number
  supplier_name: string
  items_count: number
  total_value: number
  payment_status: string
  notes: string
  created_at: string
  items: PurchaseItem[]
}

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null)
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<PurchaseDetail>(`/purchases/${id}`)
      .then((res) => {
        setPurchase(res.data)
        setSupplierId(res.data.supplier_id)
        if (res.data.payment_status !== "PAGADO") {
          setPendingAmount(res.data.total_value)
        }
      })
      .catch(() => setError("Error al cargar compra"))
      .finally(() => setLoading(false))
  }, [id])

  async function handlePay(amount: number, method: string) {
    if (!supplierId) return
    setSubmitting(true)
    try {
      await api.post(`/accounts/payable/${supplierId}/pay`, { amount, method })
      addToast(`Pago de ${formatCurrency(amount)} registrado`, "success")
      setPayOpen(false)
      const { data } = await api.get<PurchaseDetail>(`/purchases/${id}`)
      setPurchase(data)
      setPendingAmount(data.payment_status !== "PAGADO" ? data.total_value : 0)
    } catch {
      addToast("Error al registrar el pago", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <header className="bg-abyssal-surface/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="p-2 -ml-2"><Skeleton className="w-5 h-5" /></div>
          <Skeleton className="h-5 w-40" />
          <div className="w-9" />
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

  if (error || !purchase) {
    return (
      <>
        <header className="bg-abyssal-surface/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-all active:scale-95">
            <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
          </button>
          <h1 className="text-title-large text-abyssal-text-primary">Detalle de Compra</h1>
          <div className="w-9" />
        </header>
        <div className="p-4">
          <p className="text-center text-body-medium text-abyssal-red py-8">{error || "Compra no encontrada"}</p>
        </div>
      </>
    )
  }

  const subtotal = purchase.items.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <>
      <header className="bg-abyssal-surface/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary">Compra #{purchase.purchase_number}</h1>
        <div className="w-9" />
      </header>

      <div className="p-4 space-y-4 pb-24">
        <div className="bg-abyssal-surface rounded-abyssal-md p-4 shadow-abyssal-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-medium text-abyssal-text-secondary">Estado de Pago</p>
            <StatusBadge status={purchase.payment_status} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-label-medium text-abyssal-text-secondary">Proveedor</p>
            <button
              onClick={() => router.push(`/suppliers/${purchase.supplier_id}`)}
              className="text-body-medium text-abyssal-primary font-semibold hover:underline"
            >
              {purchase.supplier_name}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-label-medium text-abyssal-text-secondary">Creado</p>
            <p className="text-body-medium text-abyssal-text-primary">{formatDateTime(purchase.created_at)}</p>
          </div>
        </div>

        <div className="bg-abyssal-surface rounded-abyssal-md p-4 shadow-abyssal-sm animate-fade-in" style={{ animationDelay: "50ms" }}>
          <p className="text-title-medium text-abyssal-text-primary mb-3">Productos ({purchase.items_count})</p>
          <div className="space-y-3">
            {purchase.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-body-medium text-abyssal-text-primary truncate">
                    {item.product_name || `Producto #${item.product_id}`}
                  </p>
                  <p className="text-label-small text-abyssal-text-secondary">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                    {item.presentation !== "Unidad" && ` (${item.presentation})`}
                  </p>
                </div>
                <p className="text-body-medium text-abyssal-text-primary font-semibold shrink-0 ml-2">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-abyssal-surface rounded-abyssal-md p-4 shadow-abyssal-sm space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-between text-body-medium">
            <span className="text-abyssal-text-secondary">Subtotal</span>
            <span className="text-abyssal-text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-title-medium pt-2 border-t border-abyssal-outline/50">
            <span className="text-abyssal-text-primary">Total</span>
            <span className="text-abyssal-text-primary font-bold">{formatCurrency(purchase.total_value)}</span>
          </div>
        </div>

        {pendingAmount > 0 && supplierId && (
          <Button
            variant="primary"
            className="w-full gap-2"
            onClick={() => setPayOpen(true)}
            loading={submitting}
          >
            <HandCoins className="w-4 h-4" />
            Pagar {formatCurrency(pendingAmount)}
          </Button>
        )}
      </div>

      <PayDialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        debtorName={purchase.supplier_name}
        pendingAmount={pendingAmount}
        type="payable"
        onPay={handlePay}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
