"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Package, X, WarningCircle, MagnifyingGlass, Gear, Package as PackageIcon } from "@phosphor-icons/react"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import type { InventoryItem, InventoryMovement } from "@/lib/types"
import AdjustmentModal from "@/components/inventory/AdjustmentModal"
import PhysicalCountModal from "@/components/inventory/PhysicalCountModal"
import AdjustmentHistory from "@/components/inventory/AdjustmentHistory"

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
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showPhysicalCountModal, setShowPhysicalCountModal] = useState(false)
  const [adjustmentProduct, setAdjustmentProduct] = useState<InventoryItem | null>(null)

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

  const lowStockItems = useMemo(() => items.filter((i) => i.status === "Stock Bajo").slice(0, 10), [items])

  // Compute category breakdown
  const categoryData = useMemo(() => {
    const catMap = new Map<string, number>()
    items.forEach((i) => {
      const cat = i.category || "Sin categoría"
      catMap.set(cat, (catMap.get(cat) || 0) + 1)
    })
    const total = items.length || 1
    return Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
    }))
  }, [items])

  // Top products by sales value
  const topProducts = useMemo(() => {
    return [...items]
      .sort((a, b) => (b.stock * b.price_venta) - (a.stock * a.price_venta))
      .slice(0, 5)
  }, [items])

  const openMovements = async (item: InventoryItem) => {
    setSelectedProduct(item)
    setMovementsLoading(true)
    try {
      const { data } = await api.get<InventoryMovement[]>(`/inventory/${item.product_id}/movements`)
      setMovements(data)
    } catch {} finally { setMovementsLoading(false) }
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
      <TopBar title="Inventario" icon={<PackageIcon size={18} />} subtitle="Control de productos y stock" />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Inventario</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Control de productos y stock</p>
          </div>
          <button
            onClick={() => setShowPhysicalCountModal(true)}
            className="px-4 py-2 bg-[rgba(74,159,216,0.1)] text-abyssal-primary border border-[rgba(74,159,216,0.3)] rounded-xl text-[13px] font-medium hover:bg-[rgba(74,159,216,0.2)] transition-colors"
          >
            Conteo Físico
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Total Productos</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{stats.total}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Stock Bajo</p>
            <p className={`text-[26px] font-heading font-bold mt-2 ${stats.lowStock > 0 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>{stats.lowStock}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Valor Inventario</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{formatCurrency(stats.totalValue)}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Rotación Stock</p>
            <p className={`text-[26px] font-heading font-bold mt-2 ${stats.margin >= 30 ? "text-abyssal-text-primary" : "text-[#eab308]"}`}>
              {stats.margin > 0 ? (stats.totalVenta / (stats.totalValue || 1)).toFixed(1) : "--"}x
            </p>
          </KpiCard>
        </div>

        {/* MagnifyingGlass + Sort */}

        {/* Categories + Stock Alerts row */}
        <div className="flex gap-5">
          {/* Categorías */}
          <div className="flex-1 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Categorías de Productos</h3>
            <div className="space-y-5">
              {categoryData.map((cat, i) => {
                const barColors = ["#4A9FD8", "#6AB4E3", "#A8D5F0", "#C5E3F7", "#DEEDF9"]
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-abyssal-text-secondary font-body font-medium">{cat.name}</span>
                      <span className="text-[13px] text-abyssal-text-primary font-body font-semibold">{cat.count} items</span>
                    </div>
                    <div className="h-[6px] bg-abyssal-outline rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: barColors[i % barColors.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alertas de Stock Bajo */}
          <div className="w-[380px] shrink-0 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Alertas de Stock Bajo</h3>
            <div className="space-y-0">
              {lowStockItems.length > 0 ? lowStockItems.slice(0, 5).map((item, i) => (
                <div key={item.product_id} className={`flex items-center justify-between py-3 ${i < Math.min(lowStockItems.length, 5) - 1 ? "border-b border-abyssal-outline" : ""}`}>
                  <span className="text-[13px] text-abyssal-text-primary font-body">{item.product_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#eab308] font-caption">{item.stock} {item.unit}</span>
                    <span className="text-[12px] text-abyssal-text-secondary-variant font-caption">mín: {item.low_stock_threshold} {item.unit}</span>
                  </div>
                </div>
              )) : (
                <p className="text-[13px] text-abyssal-text-secondary-variant font-body text-center py-4">Sin alertas de stock bajo</p>
              )}
            </div>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
          <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-abyssal-outline">
                  <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">PRODUCTO</th>
                  <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">CATEGORÍA</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">PRECIO</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">STOCK</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">VENTAS</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((item) => (
                  <tr key={item.product_id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => openMovements(item)}>
                    <td className="py-4 text-[13px] text-abyssal-text-primary font-body">{item.product_name}</td>
                    <td className="py-4 text-[13px] text-abyssal-text-secondary font-body">{item.category || "—"}</td>
                    <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{formatCurrency(item.price_venta)}</td>
                    <td className="py-4 text-right text-[12px] text-abyssal-text-secondary font-body">{item.stock}</td>
                    <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{formatCurrency(item.stock * item.price_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabs + MagnifyingGlass Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto o categoría..."
              className="w-full bg-abyssal-surface-high text-abyssal-text-primary rounded-xl py-2.5 pl-9 pr-9 text-[14px] outline-none ring-1 ring-abyssal-primary/20 focus:ring-abyssal-primary transition-all placeholder:text-abyssal-text-secondary/60"
            />
            {search && (
              <button onClick={() => { setSearch(""); searchRef.current?.focus() }} className="absolute right-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary hover:text-abyssal-text-primary">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setSortBy((s) => s === "name" ? "stock" : "name")}
            className="bg-abyssal-surface-high text-abyssal-text-secondary rounded-xl px-3 py-2.5 text-[13px] whitespace-nowrap hover:text-abyssal-text-primary transition-colors ring-1 ring-abyssal-primary/20"
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
                activeFilter === t.key ? "bg-abyssal-primary text-white" : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-high/80"
              }`}
            >
              {t.label} {t.count !== undefined ? `(${t.count})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-abyssal-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <WarningCircle size={48} className="text-[#ef4444] mb-3" />
            <p className="text-[14px] text-[#ef4444] font-body">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-[16px] text-abyssal-text-primary font-heading mb-2">Inventario vacío</p>
            <p className="text-[14px] text-abyssal-text-secondary font-body">Registra compras para ver el inventario</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MagnifyingGlass size={48} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-[14px] text-abyssal-text-secondary font-body">Sin resultados para "{search}"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-abyssal-outline">
                  <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">Producto</th>
                  <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">Categoría</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">Existencias</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">P. Compra</th>
                  <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">P. Venta</th>
                  <th className="text-center py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">Estado</th>
                  <th className="text-center py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.product_id} onClick={() => openMovements(item)} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer">
                    <td className="py-4 text-[13px] text-abyssal-text-primary font-body">
                      <div className="flex items-center gap-2">
                        {item.status === "Stock Bajo" && <WarningCircle size={14} className="text-[#ef4444] shrink-0" />}
                        {item.product_name}
                      </div>
                    </td>
                    <td className="py-4 text-[13px] text-abyssal-text-secondary font-body">{item.category || "—"}</td>
                    <td className="py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[13px] text-abyssal-text-primary font-body font-semibold">{item.stock} {item.unit}</span>
                        <div className="w-20 h-1.5 bg-abyssal-surface-high rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${stockColor(item)}`} style={{ width: `${stockPercent(item)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{formatCurrency(item.price_compra)}</td>
                    <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{formatCurrency(item.price_venta)}</td>
                    <td className="py-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setAdjustmentProduct(item); setShowAdjustmentModal(true); }}
                        className="text-abyssal-text-secondary hover:text-abyssal-primary transition-colors">
                        <Gear size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={selectedProduct?.product_name || "Historial"} showClose>
        <div className="space-y-3">
          {selectedProduct && (
            <>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
                  <p className="text-abyssal-text-secondary text-[11px]">Stock actual</p>
                  <p className={`text-[17px] font-bold mt-1 ${selectedProduct.status === "Stock Bajo" ? "text-[#ef4444]" : "text-abyssal-text-primary"}`}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
                <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
                  <p className="text-abyssal-text-secondary text-[11px]">Umbral mínimo</p>
                  <p className="text-[17px] font-bold text-abyssal-text-primary mt-1">{selectedProduct.low_stock_threshold} {selectedProduct.unit}</p>
                </div>
              </div>
              <div className="h-2 bg-abyssal-surface-high rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${stockColor(selectedProduct)}`} style={{ width: `${stockPercent(selectedProduct)}%` }} />
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
          <p className="text-[16px] text-abyssal-text-primary font-heading font-semibold pt-2 border-t border-abyssal-outline">Movimientos</p>
          {movementsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-abyssal-lg" />)}
            </div>
          ) : movements.length === 0 ? (
            <p className="text-[14px] text-abyssal-text-secondary font-body text-center py-4">Sin movimientos registrados</p>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {movements.map((mov) => (
                <div key={`${mov.type}-${mov.id}`} className="flex items-center justify-between bg-abyssal-surface-high rounded-xl p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${mov.type === "compra" ? "bg-[#22c55e]" : "bg-abyssal-primary"}`} />
                      <p className="text-[13px] text-abyssal-text-primary font-body font-medium">{mov.type === "compra" ? "Compra" : "Venta"}</p>
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
        {selectedProduct && (
          <div className="pt-2 border-t border-abyssal-outline">
            <AdjustmentHistory productId={selectedProduct.product_id} />
          </div>
        )}
      </Dialog>

      {showAdjustmentModal && adjustmentProduct && (
        <AdjustmentModal
          productId={adjustmentProduct.product_id}
          productName={adjustmentProduct.product_name}
          currentStock={adjustmentProduct.stock}
          unit={adjustmentProduct.unit}
          onClose={() => { setShowAdjustmentModal(false); setAdjustmentProduct(null) }}
          onAdjustment={fetch}
        />
      )}

      {showPhysicalCountModal && (
        <PhysicalCountModal
          products={items.map(i => ({ id: i.product_id, name: i.product_name, stock: i.stock, unit: i.unit }))}
          onClose={() => setShowPhysicalCountModal(false)}
          onCount={fetch}
        />
      )}
    </>
  )
}