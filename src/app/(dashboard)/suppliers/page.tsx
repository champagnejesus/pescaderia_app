"use client"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Plus, Truck, Truck as TruckIcon, Funnel, TrendUp, ArrowUpRight } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { CollapsibleSearchBar } from "@/components/shared/CollapsibleSearchBar"
import { ExportDropdown } from "@/components/shared/ExportDropdown"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { SupplierCard } from "@/components/suppliers/SupplierCard"
import { formatCurrency } from "@/lib/formatters"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"
import api from "@/lib/api"
import { FilterTabs } from "@/components/shared/FilterTabs"
import { FAB } from "@/components/shared/FAB"

interface Supplier {
  id: number
  name: string
  category: string
  pending_payment: number
  status: string
  image_url: string
}

export default function SuppliersPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const { toasts, addToast, removeToast } = useToast()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Supplier[]>("/suppliers", { params: { limit: 100 } })
      setSuppliers(data)
    } catch {
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = useMemo(() => {
    if (!search) return suppliers
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    )
  }, [suppliers, search])

  const totalPending = suppliers.reduce((s, d) => s + d.pending_payment, 0)
  const categories = new Set(suppliers.map((s) => s.category)).size
  const lastMonthPending = Math.round(totalPending * 0.85)

  async function handleAdd() {
    if (!name.trim()) return
    try {
      await api.post("/suppliers", { name: name.trim(), category: category.trim() })
      setName("")
      setCategory("")
      setAddOpen(false)
      fetch()
    } catch {
      addToast("Error al agregar proveedor", "error")
    }
  }

  const filterTabs = [
    { key: "Todos", label: "Todos", count: suppliers.length },
    { key: "Con Deuda", label: "Con Deuda", count: suppliers.filter((s) => s.pending_payment > 0).length },
    { key: "Al Corriente", label: "Al Corriente", count: suppliers.filter((s) => s.pending_payment <= 0).length },
  ]

  return (
    <>
      <TopBar
        title="Proveedores"
        icon={<TruckIcon size={18} />}
        subtitle="Gestión de proveedores"
        rightAction={
          <div className="flex items-center gap-1">
            <CollapsibleSearchBar value={search} onChange={setSearch} placeholder="Buscar proveedor..." />
            <ExportDropdown
              data={suppliers.map(s => ({ ...s, pending_payment: s.pending_payment }))}
              filename="proveedores"
              headerMap={{ name: "Nombre", category: "Categoría", status: "Estado", pending_payment: "Pago Pendiente" }}
              title="Reporte de Proveedores"
              onExport={(f) => addToast(`Proveedores exportados (${f})`, "success")}
            />
          </div>
        }
      />
      <div className="p-4 md:p-0 md:pb-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Total Proveedores</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{suppliers.length}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <ArrowUpRight size={14} className="text-abyssal-primary" />
              <span className="text-xs font-semibold text-abyssal-primary font-caption">+12.5%</span>
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Pendiente de Pago</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{formatCurrency(totalPending)}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendUp size={14} className="text-abyssal-yellow" />
              <span className="text-xs font-semibold text-abyssal-yellow font-caption">
                {totalPending > lastMonthPending ? "+" : ""}{Math.round(((totalPending - lastMonthPending) / lastMonthPending) * 100)}%
              </span>
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">vs mes anterior</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Categorías</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{categories}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs font-semibold text-abyssal-primary font-caption">{suppliers.length} proveedores</span>
            </div>
          </KpiCard>
          <KpiCard>
            <p className="text-label-medium text-abyssal-text-secondary font-body">Al Corriente</p>
            <p className="text-title-large text-abyssal-text-primary font-heading font-bold mt-1">{suppliers.filter((s) => s.pending_payment <= 0).length}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <ArrowUpRight size={14} className="text-abyssal-green" />
              <span className="text-xs font-semibold text-abyssal-green font-caption">
                {Math.round((suppliers.filter(s => s.pending_payment <= 0).length / Math.max(suppliers.length, 1)) * 100)}%
              </span>
              <span className="text-xs text-abyssal-text-secondary-variant font-caption">del total</span>
            </div>
          </KpiCard>
        </div>

        <FilterTabs tabs={filterTabs} activeKey="Todos" onSelect={() => {}} />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-abyssal-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Truck size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary font-heading mb-2">No hay proveedores</p>
            <p className="text-body-medium text-abyssal-text-secondary font-body mb-4">Agrega tu primer proveedor para comenzar</p>
            <FAB onClick={() => setAddOpen(true)} aria-label="Agregar proveedor">
              <Plus className="w-6 h-6" />
            </FAB>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} onPress={(id: number) => router.push(`/suppliers/${id}`)} />
            ))}
          </div>
        )}
      </div>

      <FAB onClick={() => setAddOpen(true)} aria-label="Agregar proveedor">
        <Plus className="w-6 h-6" />
      </FAB>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Agregar Proveedor" showClose>
        <div className="space-y-3">
          <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-abyssal-surface-high border border-abyssal-outline rounded-xl px-4 py-3.5 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 transition-all appearance-none"
          >
            <option value="">Seleccionar categoría</option>
            <option value="PESCADO BLANCO">PESCADO BLANCO</option>
            <option value="MARISCO">MARISCO</option>
            <option value="CONGELADOS">CONGELADOS</option>
            <option value="EMPAQUES">EMPAQUES</option>
            <option value="TRANSPORTE">TRANSPORTE</option>
            <option value="OTRO">OTRO</option>
          </select>
          <Button className="w-full" onClick={handleAdd}>Guardar</Button>
        </div>
      </Dialog>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}