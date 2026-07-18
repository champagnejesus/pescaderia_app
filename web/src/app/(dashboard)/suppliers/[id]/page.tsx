"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Truck } from "lucide-react"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency } from "@/lib/formatters"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"

interface SupplierDetail {
  id: number
  name: string
  category: string
  pending_payment: number
  status: string
  image_url: string
}

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<SupplierDetail>("/suppliers/" + id)
      .then((res) => setSupplier(res.data))
      .catch(() => addToast("Error al cargar proveedor", "error"))
      .finally(() => setLoading(false))
  }, [id])

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
        <p className="text-[20px] font-bold text-abyssal-text-primary">Proveedor no encontrado</p>
        <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-[20px] font-bold text-abyssal-text-primary">Proveedor</h1>
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
            <h1 className="text-[20px] font-bold text-abyssal-text-primary">{supplier.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-abyssal-surface-high/60 glass-subtle text-abyssal-text-secondary rounded-full px-3 py-0.5 text-[12px] font-medium">
                {supplier.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <div className="bg-abyssal-surface glass rounded-2xl p-4">
              <p className="text-[12px] text-abyssal-text-secondary">Estado</p>
              <div className="mt-2">
                <StatusBadge status={supplier.status} />
              </div>
            </div>
            <div className="bg-abyssal-surface glass rounded-2xl p-4">
              <p className="text-[12px] text-abyssal-text-secondary">Pago Pendiente</p>
              <p className="text-[20px] font-bold text-abyssal-red mt-1">
                {formatCurrency(supplier.pending_payment)}
              </p>
            </div>
          </div>

          <div className="bg-abyssal-surface glass rounded-2xl p-4 animate-fade-in">
            <p className="text-[17px] font-semibold text-abyssal-text-primary mb-2">Información</p>
            <div className="space-y-2 text-[15px]">
              <div className="flex justify-between">
                <span className="text-abyssal-text-secondary">Categoría</span>
                <span className="text-abyssal-text-primary font-medium">{supplier.category}</span>
              </div>
              <div className="flex justify-between border-t border-abyssal-outline/15 pt-2">
                <span className="text-abyssal-text-secondary">Estado</span>
                <span className="text-abyssal-text-primary font-medium">{supplier.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
