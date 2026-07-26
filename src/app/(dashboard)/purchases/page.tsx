"use client"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plus, ShoppingCart } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { ExportDropdown } from "@/components/shared/ExportDropdown"
import { usePurchases } from "@/hooks/usePurchases"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { FAB } from "@/components/shared/FAB"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/formatters"
import { statusColor } from "@/lib/status-colors"

export default function PurchasesPage() {
  const [filter, setFilter] = useState("Todos")
  const [searchText, setSearchText] = useState("")
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()

  const STATUS_MAP: Record<string, string | undefined> = {
    Todos: undefined,
    Pendientes: "PENDIENTE",
    Pagados: "PAGADO",
    "Pago parcial": "PAGO PARCIAL",
  }

  const { data: purchases, loading, error } = usePurchases(STATUS_MAP[filter])

  const stats = useMemo(() => {
    if (!purchases.length) return { total: 0, spent: 0, pending: 0, pendingAmount: 0, avgPurchase: 0 }
    const spent = purchases.reduce((s, p) => s + p.total_value, 0)
    const pending = purchases.filter((p) => p.payment_status !== "PAGADO").length
    const pendingAmount = purchases.filter((p) => p.payment_status !== "PAGADO").reduce((s, p) => s + p.total_value, 0)
    return { total: purchases.length, spent, pending, pendingAmount, avgPurchase: spent / purchases.length }
  }, [purchases])

  const filteredPurchases = useMemo(() => {
    if (!searchText) return purchases
    const q = searchText.toLowerCase()
    return purchases.filter((p) => p.supplier_name.toLowerCase().includes(q) || p.purchase_number.toLowerCase().includes(q))
  }, [purchases, searchText])

  const recentPurchases = useMemo(() => [...filteredPurchases].slice(-6).reverse(), [filteredPurchases])

  return (
    <>
      <TopBar
        title="Órdenes de Compra"
        icon={<ShoppingCart size={18} />}
        subtitle="Órdenes a proveedores"
        rightAction={
          <div className="flex items-center gap-1">
            <CollapsibleSearchBar value={searchText} onChange={setSearchText} placeholder="Buscar por proveedor o #compra..." />
            <ExportDropdown
              data={purchases.map(p => ({ ...p, created_at: p.created_at || "" }))}
              filename="compras"
              headerMap={{ purchase_number: "# Compra", supplier_name: "Proveedor", total_value: "Total", payment_status: "Estado de Pago", created_at: "Fecha" }}
              title="Reporte de Compras"
              onExport={(f) => addToast(`Compras exportadas (${f})`, "success")}
            />
          </div>
        }
      />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Órdenes de Compra</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Órdenes a proveedores</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/purchases/new")}
              className="px-4 py-2 bg-abyssal-primary text-white rounded-xl text-[13px] font-semibold flex items-center gap-1.5 hover:bg-abyssal-primary/90 transition-colors"
            >
              <Plus size={16} />
              Nueva Compra
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Órdenes Totales</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{stats.total}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Completadas</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{stats.total - stats.pending}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">En Proceso</p>
            <p className="text-[26px] text-[#eab308] font-heading font-bold mt-2">{stats.pending}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Pendientes</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
            </p>
          </KpiCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "Todos", label: "Todos", count: purchases.length },
            { key: "Pendientes", label: "Pendientes", count: stats.pending },
            { key: "Pagados", label: "Pagados", count: purchases.filter((p) => p.payment_status === "PAGADO").length },
            { key: "Pago parcial", label: "Pago parcial", count: purchases.filter((p) => p.payment_status === "PAGO PARCIAL").length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                filter === t.key ? "bg-abyssal-primary text-white" : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-high/80"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-abyssal-lg" />)}
          </div>
        ) : error ? (
          <p className="text-center text-[14px] text-[#ef4444] font-body py-8">{error}</p>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-[16px] text-abyssal-text-primary font-heading mb-2">No hay compras</p>
            <p className="text-[14px] text-abyssal-text-secondary font-body mb-4">Registra tu primera compra para comenzar</p>
          </div>
        ) : (
          <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Todas las Órdenes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">PROVEEDOR</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">FECHA</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">MONTO</th>
                    <th className="text-right px-6 py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((purchase) => {
                    const status = purchase.payment_status === "PAGADO" ? "PAGADO" : purchase.payment_status === "PENDIENTE" ? "PENDIENTE" : "PAGO PARCIAL"
                    const colors = statusColor[status] || statusColor.PENDIENTE
                    return (
                      <tr key={purchase.id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => router.push(`/purchases/${purchase.id}`)}>
                        <td className="px-6 py-4 text-[12px] text-abyssal-text-secondary-variant font-mono">{purchase.purchase_number}</td>
                        <td className="px-6 py-4 text-[13px] text-abyssal-text-secondary font-body">{purchase.supplier_name}</td>
                        <td className="px-6 py-4 text-right text-[12px] text-abyssal-text-secondary-variant font-caption">
                          {purchase.created_at ? new Date(purchase.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">
                          {formatCurrency(purchase.total_value)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-caption font-medium ${colors.bg} ${colors.text}`}>{status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <FAB href="/purchases/new" aria-label="Nueva compra">
        <Plus className="w-6 h-6" />
      </FAB>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}