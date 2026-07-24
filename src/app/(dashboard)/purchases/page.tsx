"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, ShoppingCart, Download, TrendingUp, DollarSign, Clock, ShoppingCart as CartIcon, Filter } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { PurchaseCard } from "@/components/purchases/PurchaseCard"
import { usePurchases } from "@/hooks/usePurchases"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { exportCSV } from "@/lib/export"
import { StatCard } from "@/components/shared/StatCard"
import { FilterTabs } from "@/components/shared/FilterTabs"
import { FAB } from "@/components/shared/FAB"
import { Skeleton } from "@/components/ui/skeleton"

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

  const filterTabs = [
    { key: "Todos", label: "Todos", count: purchases.length },
    { key: "Pendientes", label: "Pendientes", count: stats.pending },
    { key: "Pagados", label: "Pagados", count: purchases.filter((p) => p.payment_status === "PAGADO").length },
    { key: "Pago parcial", label: "Pago parcial", count: purchases.filter((p) => p.payment_status === "PAGO PARCIAL").length },
  ]

  return (
    <>
      <TopBar
        title="Compras"
        icon={<CartIcon size={18} />}
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
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Compras" value={stats.total} icon={CartIcon} />
          <StatCard label="Total Gastado" value={`$${stats.spent.toLocaleString("es-MX", { minimumFractionDigits: 0 })}`} icon={DollarSign} iconColor="abyssal-green" />
          <StatCard label="Por Pagar" value={`$${stats.pendingAmount.toLocaleString("es-MX", { minimumFractionDigits: 0 })}`} icon={Clock} iconColor="abyssal-red" />
        </div>

        <FilterTabs tabs={filterTabs} activeKey={filter} onSelect={setFilter} />

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
            <FAB href="/purchases/new" aria-label="Registrar compra">
              <Plus className="w-6 h-6" />
            </FAB>
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
      <FAB href="/purchases/new" aria-label="Registrar compra">
        <Plus className="w-6 h-6" />
      </FAB>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}