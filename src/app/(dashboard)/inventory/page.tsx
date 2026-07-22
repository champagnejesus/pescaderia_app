"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Package, X, AlertCircle, Search, Package as PackageIcon } from "lucide-react"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import type { InventoryItem, InventoryMovement } from "@/lib/types"

type FilterTab = "todos" | "bajo" | "disponible"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterTab>("todos")
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "stock">("name")
  const searchRef = useRef<HTMLInputElement>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<InventoryItem[]>("/inventory")
      setItems(data)
    } catch {
      setError("Error al cargar inventario")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const stats = useMemo(() => {
    const total = items.length
    const lowStock = items.filter((i) => i.status === "Stock Bajo").length
    const totalValue = items.reduce((sum, i) => sum + i.stock * i.price_compra, 0)
    const totalVenta = items.reduce((sum, i) => sum + i.stock * i.price_venta, 0)
    return { total, lowStock, totalValue, totalVenta, margin: totalValue > 0 ? ((totalVenta - totalValue) / totalValue) * 100 : 0 }
  }, [items])

  const filtered = useMemo(() => {
    let list = items
    if (activeFilter === "bajo") list = list.filter((i) => i.status === "Stock Bajo")
    if (activeFilter === "disponible") list = list.filter((i) => i.status !== "Stock Bajo")
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((i) => i.product_name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q))
    }
    if (sortBy === "stock") list = [...list].sort((a, b) => a.stock - b.stock)
    else list = [...list].sort((a, b) => a.product_name.localeCompare(b.product_name))
    return list
  }, [items, activeFilter, search, sortBy])

  const openMovements = async (item: InventoryItem) => {
    setSelectedProduct(item)
    setMovementsLoading(true)
    setMovements([])
    try {
      const { data } = await api.get<InventoryMovement[]>(`/inventory/${item.product_id}/movements`)
      setMovements(data)
    } catch {
    } finally {
      setMovementsLoading(false)
    }
  }

  const stockPercent = (item: InventoryItem) => {
    const threshold = item.low_stock_threshold || 5
    const max = Math.max(threshold * 4, 50)
    return Math.min((item.stock / max) * 100, 100)
  }

  const stockColor = (item: InventoryItem) => {
    if (item.stock <= item.low_stock_threshold) return "bg-abyssal-red"
    if (item.stock <= item.low_stock_threshold * 2) return "bg-abyssal-yellow"
    return "bg-abyssal-green"
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "todos", label: "Todos", count: stats.total },
    { key: "bajo", label: "Stock Bajo", count: stats.lowStock },
    { key: "disponible", label: "Disponible", count: stats.total - stats.lowStock },
  ]

  return (
    <>
      <TopBar title="Inventario" icon={<PackageIcon size={18} />} />
      <div className="p-4 space-y-3">

        {loading ? null : error ? null : items.length === 0 ? null : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Card className="bg-abyssal-surface glass p-3">
              <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider">Productos</p>
              <p className="text-xl font-bold text-abyssal-text-primary mt-1">{stats.total}</p>
            </Card>
            <Card className="bg-abyssal-surface glass p-3">
              <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider">Stock Bajo</p>
              <p className={`text-xl font-bold mt-1 ${stats.lowStock > 0 ? "text-abyssal-red" : "text-abyssal-green"}`}>
                {stats.lowStock}
              </p>
            </Card>
            <Card className="bg-abyssal-surface glass p-3">
              <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider">Valor Compra</p>
              <p className="text-xl font-bold text-abyssal-text-primary mt-1">{formatCurrency(stats.totalValue)}</p>
            </Card>
            <Card className="bg-abyssal-surface glass p-3">
              <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider">Margen</p>
              <p className={`text-xl font-bold mt-1 ${stats.margin >= 30 ? "text-abyssal-green" : "text-abyssal-yellow"}`}>
                {stats.margin.toFixed(0)}%
              </p>
            </Card>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto o categoría..."
              className="w-full bg-abyssal-surface-high text-abyssal-text-primary rounded-xl py-2.5 pl-9 pr-9 text-[14px] outline-none ring-1 ring-abyssal-outline/20 focus:ring-abyssal-primary transition-all placeholder:text-abyssal-text-secondary/60"
            />
            {search && (
              <button onClick={() => { setSearch(""); searchRef.current?.focus() }} className="absolute right-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary hover:text-abyssal-text-primary">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setSortBy((s) => s === "name" ? "stock" : "name")}
            className="bg-abyssal-surface-high text-abyssal-text-secondary rounded-xl px-3 py-2.5 text-[13px] whitespace-nowrap hover:text-abyssal-text-primary transition-colors ring-1 ring-abyssal-outline/20"
          >
            {sortBy === "name" ? "A-Z" : "Stock"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveFilter(t.key)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ${
                activeFilter === t.key
                  ? "bg-abyssal-primary text-white"
                  : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-high/80"
              }`}
            >
              {t.label} {t.count !== undefined && `(${t.count})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={48} className="text-abyssal-red mb-3" />
            <p className="text-body-medium text-abyssal-red">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">Inventario vacío</p>
            <p className="text-body-medium text-abyssal-text-secondary">Registra compras para ver el inventario</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-body-medium text-abyssal-text-secondary">Sin resultados para "{search}"</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-small text-abyssal-text-secondary border-b border-abyssal-outline/20">
                    <th className="py-3 px-2 font-medium">Producto</th>
                    <th className="py-3 px-2 font-medium">Categoría</th>
                    <th className="py-3 px-2 font-medium text-right">Existencias</th>
                    <th className="py-3 px-2 font-medium text-right">P. Compra</th>
                    <th className="py-3 px-2 font-medium text-right">P. Venta</th>
                    <th className="py-3 px-2 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.product_id}
                      onClick={() => openMovements(item)}
                      className="border-b border-abyssal-outline/10 hover:bg-abyssal-surface-high/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {item.status === "Stock Bajo" && <AlertCircle size={14} className="text-abyssal-red shrink-0" />}
                          <span className="text-[14px] text-abyssal-text-primary font-medium">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[13px] text-abyssal-text-secondary">{item.category || "—"}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[14px] text-abyssal-text-primary font-semibold">{item.stock} {item.unit}</span>
                          <div className="w-20 h-1.5 bg-abyssal-surface-high rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${stockColor(item)}`} style={{ width: `${stockPercent(item)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[14px] text-abyssal-text-primary text-right">{formatCurrency(item.price_compra)}</td>
                      <td className="py-3 px-2 text-[14px] text-abyssal-text-primary text-right">{formatCurrency(item.price_venta)}</td>
                      <td className="py-3 px-2 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {filtered.map((item) => (
                <button
                  key={item.product_id}
                  onClick={() => openMovements(item)}
                  className="bg-abyssal-surface glass rounded-2xl p-3.5 w-full text-left transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.status === "Stock Bajo" && <AlertCircle size={14} className="text-abyssal-red shrink-0" />}
                      <p className="text-[15px] text-abyssal-text-primary font-medium truncate">{item.product_name}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-abyssal-surface-high rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${stockColor(item)}`} style={{ width: `${stockPercent(item)}%` }} />
                    </div>
                    <span className="text-[12px] text-abyssal-text-primary font-semibold shrink-0">{item.stock} {item.unit}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <span className="text-abyssal-text-secondary">Compra: </span>
                      <span className="text-abyssal-text-primary font-semibold">{formatCurrency(item.price_compra)}</span>
                    </div>
                    <div>
                      <span className="text-abyssal-text-secondary">Venta: </span>
                      <span className="text-abyssal-text-primary font-semibold">{formatCurrency(item.price_venta)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.product_name || "Historial"}
        showClose
      >
        <div className="space-y-3">
          {selectedProduct && (
            <>
              <div className="grid grid-cols-2 gap-2 text-[13px] mb-1">
                <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
                  <p className="text-abyssal-text-secondary text-[11px]">Stock actual</p>
                  <p className={`text-[17px] font-bold mt-1 ${selectedProduct.status === "Stock Bajo" ? "text-abyssal-red" : "text-abyssal-text-primary"}`}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
                <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
                  <p className="text-abyssal-text-secondary text-[11px]">Umbral mínimo</p>
                  <p className="text-[17px] font-bold text-abyssal-text-primary mt-1">{selectedProduct.low_stock_threshold} {selectedProduct.unit}</p>
                </div>
              </div>
              <div className="h-2 bg-abyssal-surface-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${stockColor(selectedProduct)}`} style={{ width: `${stockPercent(selectedProduct)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="bg-abyssal-surface-high rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-abyssal-text-secondary text-[11px]">P. Compra</span>
                  <span className="text-abyssal-text-primary font-semibold">{formatCurrency(selectedProduct.price_compra)}</span>
                </div>
                <div className="bg-abyssal-surface-high rounded-xl p-2.5 flex items-center justify-between">
                  <span className="text-abyssal-text-secondary text-[11px]">P. Venta</span>
                  <span className="text-abyssal-text-primary font-semibold">{formatCurrency(selectedProduct.price_venta)}</span>
                </div>
              </div>
            </>
          )}

          <p className="text-title-medium text-abyssal-text-primary pt-2 border-t border-abyssal-outline/20">Movimientos</p>

          {movementsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <p className="text-body-medium text-abyssal-text-secondary text-center py-4">
              Sin movimientos registrados
            </p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {movements.map((mov) => (
                <div
                  key={`${mov.type}-${mov.id}`}
                  className="flex items-center justify-between bg-abyssal-surface-high rounded-xl p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${mov.type === "compra" ? "bg-abyssal-green" : "bg-abyssal-primary"}`} />
                      <p className="text-[13px] text-abyssal-text-primary font-medium">
                        {mov.type === "compra" ? "Compra" : "Venta"}
                      </p>
                      <span className="text-[11px] text-abyssal-text-secondary font-mono">{mov.reference}</span>
                    </div>
                    <p className="text-[11px] text-abyssal-text-secondary mt-0.5 ml-4">
                      <span className="font-medium">{mov.quantity} {mov.unit}</span> × {formatCurrency(mov.unit_price)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[13px] font-semibold text-abyssal-text-primary">{formatCurrency(mov.total)}</p>
                    <p className="text-[10px] text-abyssal-text-secondary">{formatDateTime(mov.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}
