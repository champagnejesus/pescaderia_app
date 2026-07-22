"use client"
import { useState, useEffect, useCallback } from "react"
import { Package, X, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import type { InventoryItem, InventoryMovement } from "@/lib/types"

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null)
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)

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

  const openMovements = async (item: InventoryItem) => {
    setSelectedProduct(item)
    setMovementsLoading(true)
    setMovements([])
    try {
      const { data } = await api.get<InventoryMovement[]>(`/inventory/${item.product_id}/movements`)
      setMovements(data)
    } catch {
      // silently fail
    } finally {
      setMovementsLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Inventario" />
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
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
                  {items.map((item) => (
                    <tr
                      key={item.product_id}
                      onClick={() => openMovements(item)}
                      className="border-b border-abyssal-outline/10 hover:bg-abyssal-surface-high/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-2 text-[14px] text-abyssal-text-primary font-medium">{item.product_name}</td>
                      <td className="py-3 px-2 text-[13px] text-abyssal-text-secondary">{item.category}</td>
                      <td className="py-3 px-2 text-[14px] text-abyssal-text-primary font-semibold text-right">
                        {item.stock} {item.unit}
                      </td>
                      <td className="py-3 px-2 text-[14px] text-abyssal-text-primary text-right">{formatCurrency(item.price_compra)}</td>
                      <td className="py-3 px-2 text-[14px] text-abyssal-text-primary text-right">{formatCurrency(item.price_venta)}</td>
                      <td className="py-3 px-2 text-center">
                        <StatusBadge status={item.status === "Stock Bajo" ? "PENDIENTE" : "PAGADO"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {items.map((item) => (
                <button
                  key={item.product_id}
                  onClick={() => openMovements(item)}
                  className="bg-abyssal-surface glass rounded-2xl p-3.5 w-full text-left transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[15px] text-abyssal-text-primary font-medium truncate">{item.product_name}</p>
                    <StatusBadge status={item.status === "Stock Bajo" ? "PENDIENTE" : "PAGADO"} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[12px]">
                    <div>
                      <span className="text-abyssal-text-secondary">Stock: </span>
                      <span className="text-abyssal-text-primary font-semibold">{item.stock} {item.unit}</span>
                    </div>
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
            <div className="grid grid-cols-2 gap-2 text-[13px] mb-3">
              <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
                <p className="text-abyssal-text-secondary text-[11px]">Stock actual</p>
                <p className="text-abyssal-text-primary font-bold text-[17px]">{selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
              <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
                <p className="text-abyssal-text-secondary text-[11px]">Estado</p>
                <div className="mt-1">
                  <StatusBadge status={selectedProduct.status === "Stock Bajo" ? "PENDIENTE" : "PAGADO"} />
                </div>
              </div>
            </div>
          )}

          <p className="text-title-medium text-abyssal-text-primary">Movimientos</p>

          {movementsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <p className="text-body-medium text-abyssal-text-secondary text-center py-4">
              Sin movimientos registrados
            </p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {movements.map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center justify-between bg-abyssal-surface-high rounded-xl p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${mov.type === "compra" ? "bg-abyssal-green" : "bg-abyssal-primary"}`} />
                      <p className="text-[13px] text-abyssal-text-primary font-medium">
                        {mov.type === "compra" ? "Compra" : "Venta"} — {mov.reference}
                      </p>
                    </div>
                    <p className="text-[11px] text-abyssal-text-secondary mt-0.5 ml-4">
                      {mov.quantity} {mov.unit} × {formatCurrency(mov.unit_price)} · {formatDateTime(mov.created_at)}
                    </p>
                  </div>
                  <span className="text-[13px] text-abyssal-text-primary font-semibold shrink-0 ml-2">
                    {formatCurrency(mov.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}
