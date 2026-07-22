"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, ShoppingCart, Download, TrendingUp, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import { TopBar } from "@/components/layout/TopBar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FilterChip } from "@/components/shared/FilterChip"
import { PurchaseCard } from "@/components/purchases/PurchaseCard"
import { usePurchases } from "@/hooks/usePurchases"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { exportCSV } from "@/lib/export"

const FILTERS = ["Todos", "Pagados", "Pendientes", "Pago parcial"]
const STATUS_MAP: Record<string, string | undefined> = {
  Todos: undefined,
  Pagados: "PAGADO",
  Pendientes: "PENDIENTE",
  "Pago parcial": "PAGO PARCIAL",
}

export default function PurchasesPage() {
  const [filter, setFilter] = useState("Todos")
  const [searchText, setSearchText] = useState("")
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const { data: purchases, loading, error } = usePurchases(STATUS_MAP[filter])

  const stats = useMemo(() => {
    if (!purchases.length) return { total: 0, spent: 0, pending: 0, pendingAmount: 0 }
    return {
      total: purchases.length,
      spent: purchases.reduce((s, p) => s + p.total_value, 0),
      pending: purchases.filter((p) => p.payment_status !== "PAGADO").length,
      pendingAmount: purchases.filter((p) => p.payment_status !== "PAGADO").reduce((s, p) => s + p.total_value, 0),
    }
  }, [purchases])

  const filteredPurchases = useMemo(() => {
    if (!searchText) return purchases
    const q = searchText.toLowerCase()
    return purchases.filter(
      (p) =>
        p.supplier_name.toLowerCase().includes(q) ||
        p.purchase_number.toLowerCase().includes(q)
    )
  }, [purchases, searchText])

  return (
    <>
      <TopBar
        title="Compras"
        rightAction={
          <div className="flex items-center gap-1">
            <CollapsibleSearchBar value={searchText} onChange={setSearchText} placeholder="Buscar por proveedor o #compra..." />
            <button
              onClick={() => {
                if (purchases.length === 0) { addToast("No hay datos para exportar", "error"); return }
                exportCSV(purchases.map(p => ({ ...p, created_at: p.created_at || "" })), "compras", {
                  purchase_number: "# Compra", supplier_name: "Proveedor", total_value: "Total",
                  payment_status: "Estado de Pago", created_at: "Fecha"
                })
                addToast("Compras exportadas", "success")
              }}
              className="p-2 rounded-full hover:bg-abyssal-surface-high transition-colors active:scale-95"
              aria-label="Exportar compras"
            >
              <Download className="w-5 h-5 text-abyssal-text-secondary" />
            </button>
          </div>
        }
      />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-abyssal-surface rounded-abyssal-md p-3 shadow-abyssal-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-abyssal-primary" />
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Total Compras</p>
            </div>
            <p className="text-title-large text-abyssal-text-primary font-bold">{stats.total}</p>
          </div>
          <div className="bg-abyssal-surface rounded-abyssal-md p-3 shadow-abyssal-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-abyssal-primary" />
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Total Gastado</p>
            </div>
            <p className="text-title-large text-abyssal-text-primary font-bold">{stats.spent.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-abyssal-surface rounded-abyssal-md p-3 shadow-abyssal-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-abyssal-red" />
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Pendientes</p>
            </div>
            <p className="text-title-large text-abyssal-red font-bold">{stats.pending}</p>
          </div>
          <div className="bg-abyssal-surface rounded-abyssal-md p-3 shadow-abyssal-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-abyssal-red" />
              <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Por Pagar</p>
            </div>
            <p className="text-title-large text-abyssal-red font-bold">{stats.pendingAmount.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 })}</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((label) => (
            <FilterChip key={label} label={label} selected={filter === label} onClick={() => setFilter(label)} />
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-body-medium text-abyssal-red py-8">{error}</p>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No hay compras</p>
            <p className="text-body-medium text-abyssal-text-secondary mb-4">Registra tu primera compra para comenzar</p>
            <Link href="/purchases/new">
              <Button variant="primary">Registrar Compra</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onPress={(id) => router.push(`/purchases/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <Link
        href="/purchases/new"
        className="bg-abyssal-primary rounded-abyssal-full p-4 fixed bottom-20 right-4 text-abyssal-on-primary shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 z-30"
        aria-label="Registrar compra"
      >
        <Plus className="w-6 h-6" />
      </Link>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
