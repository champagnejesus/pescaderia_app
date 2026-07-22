"use client"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Truck, ShoppingCart, HandCoins, ArrowRightFromLine, Clock } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PayDialog } from "@/components/cash-register/PayDialog"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { useToast } from "@/hooks/useToast"

interface SupplierDetail {
  id: number
  name: string
  category: string
  pending_payment: number
  status: string
  image_url: string
}

interface PurchaseItem {
  id: number
  purchase_number: string
  total_value: number
  payment_status: string
  created_at: string
}

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null)
  const [purchases, setPurchases] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [payOpen, setPayOpen] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [supRes, purRes] = await Promise.all([
        api.get<SupplierDetail>("/suppliers/" + id),
        api.get<PurchaseItem[]>("/purchases", { params: { supplier_id: id, limit: 20 } }),
      ])
      setSupplier(supRes.data)
      setPurchases(purRes.data || [])
    } catch {
      addToast("Error al cargar proveedor", "error")
    } finally {
      setLoading(false)
    }
  }, [id, addToast])

  useEffect(() => { fetch() }, [fetch])

  const handlePay = async (amount: number, method: string) => {
    if (!supplier) return
    try {
      await api.post(`/accounts/payable/${supplier.id}/pay`, { amount, method })
      addToast(`Pago de ${formatCurrency(amount)} registrado`, "success")
      fetch()
    } catch {
      addToast("Error al registrar el pago", "error")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-abyssal-bg p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-abyssal-bg flex flex-col items-center justify-center gap-3 p-4">
        <Truck className="w-12 h-12 text-abyssal-red" />
        <p className="text-title-medium text-abyssal-text-primary">Proveedor no encontrado</p>
        <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    )
  }

  const totalPurchases = purchases.reduce((s, p) => s + p.total_value, 0)
  const pendingPurchases = purchases.filter((p) => p.payment_status !== "PAGADO")

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 backdrop-blur-xl border-b border-abyssal-primary/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary font-bold">Proveedor</h1>
        <button
          onClick={() => router.push(`/suppliers/${supplier.id}/edit`)}
          className="p-2 -mr-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95"
        >
          <Pencil className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
      </header>

      <div className="max-w-[480px] mx-auto">
        <div className="mx-4 rounded-2xl overflow-hidden h-48 mt-4 animate-fade-in">
          {supplier.image_url ? (
            <img src={supplier.image_url} alt={supplier.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-abyssal-primary-light to-abyssal-primary flex items-center justify-center">
              <Truck className="w-16 h-16 text-white/60" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-title-large text-abyssal-text-primary font-bold">{supplier.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-abyssal-surface-high text-abyssal-text-secondary rounded-full px-3 py-0.5 text-label-small">
                    {supplier.category}
                  </span>
                </div>
              </div>
              {supplier.pending_payment > 0 && (
                <button
                  onClick={() => setPayOpen(true)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-abyssal-red/12 text-abyssal-red text-[13px] font-semibold hover:bg-abyssal-red/20 transition-colors shrink-0"
                >
                  <HandCoins className="w-4 h-4" />
                  Pagar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <Card className="p-3">
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Estado</p>
              <div className="mt-1">
                <StatusBadge status={supplier.status} />
              </div>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Pendiente</p>
              <p className={cn("text-[18px] font-bold mt-0.5", supplier.pending_payment > 0 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
                {formatCurrency(supplier.pending_payment)}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Compras</p>
              <p className="text-[18px] text-abyssal-text-primary font-bold mt-0.5">{purchases.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Total Comprado</p>
              <p className="text-[18px] text-abyssal-text-primary font-bold mt-0.5">{formatCurrency(totalPurchases)}</p>
            </Card>
          </div>

          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-title-medium text-abyssal-text-primary flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-abyssal-text-secondary" />
                Historial de Compras
              </h2>
              {pendingPurchases.length > 0 && (
                <span className="text-[11px] text-abyssal-red font-medium bg-abyssal-red/8 px-2 py-0.5 rounded-lg">
                  {pendingPurchases.length} pendientes
                </span>
              )}
            </div>
            {purchases.length === 0 ? (
              <Card className="p-6 text-center">
                <ShoppingCart size={40} className="text-abyssal-text-secondary mx-auto mb-2" strokeWidth={1} />
                <p className="text-[13px] text-abyssal-text-secondary">Sin compras registradas</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {purchases.map((p) => {
                  const isPending = p.payment_status !== "PAGADO"
                  return (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/purchases/${p.id}`)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors",
                        isPending ? "bg-abyssal-surface-high" : "bg-abyssal-green/5"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-[13px] font-medium", isPending ? "text-abyssal-text-primary" : "text-abyssal-text-secondary")}>
                          {p.purchase_number}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-abyssal-text-secondary">{formatDate(p.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-[13px] font-semibold", isPending ? "text-abyssal-text-primary" : "text-abyssal-text-secondary")}>
                          {formatCurrency(p.total_value)}
                        </span>
                        <StatusBadge status={p.payment_status} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <PayDialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        debtorName={supplier.name}
        pendingAmount={supplier.pending_payment}
        type="payable"
        onPay={handlePay}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
