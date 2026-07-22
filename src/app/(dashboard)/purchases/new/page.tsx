"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Minus, Search } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import { formatCurrency } from "@/lib/formatters"

interface Supplier {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  stock: number
  unit: string
  price_compra: number
}

interface SelectedItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
}

const PRESENTATIONS = ["Caja", "Unidad", "Kilogramo"]

export default function NewPurchasePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [paymentStatus, setPaymentStatus] = useState("PENDIENTE")
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [supplierSearch, setSupplierSearch] = useState("")
  const [suppliersLoading, setSuppliersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    api.get<Supplier[]>("/suppliers")
      .then(({ data }) => { setSuppliers(data); setSuppliersLoading(false) })
      .catch(() => { addToast("Error al cargar proveedores", "error"); setSuppliersLoading(false) })
    api.get<Product[]>("/products")
      .then(({ data }) => { setAllProducts(data); setProductsLoading(false) })
      .catch(() => { addToast("Error al cargar productos", "error"); setProductsLoading(false) })
  }, [addToast])

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  )

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddProduct = useCallback((product: Product) => {
    const existing = selectedItems.find((s) => s.product_id === product.id)
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((s) =>
          s.product_id === product.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      )
      return
    }
    setSelectedItems((prev) => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        presentation: product.unit === "kg" ? "Kilogramo" : "Unidad",
        quantity: 1,
        unit_price: product.price_compra,
      },
    ])
  }, [selectedItems])

  const handleUpdateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setSelectedItems((prev) => prev.filter((s) => s.product_id !== productId))
      return
    }
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, quantity: qty } : s))
    )
  }, [])

  const handleUpdatePrice = useCallback((productId: number, price: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, unit_price: price } : s))
    )
  }, [])

  const handleUpdatePresentation = useCallback((productId: number, presentation: string) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, presentation } : s))
    )
  }, [])

  const handleSubmit = async () => {
    if (!selectedSupplier || selectedItems.length === 0) return
    setSubmitting(true)
    try {
      const items = selectedItems.map((s) => ({
        product_id: s.product_id,
        presentation: s.presentation,
        quantity: s.quantity,
        unit_price: s.unit_price,
        subtotal: s.quantity * s.unit_price,
      }))
      await api.post("/purchases", {
        supplier_id: selectedSupplier.id,
        supplier_name: selectedSupplier.name,
        items,
        payment_status: paymentStatus,
      })
      addToast("Compra registrada exitosamente", "success")
      router.push("/purchases")
    } catch {
      addToast("Error al registrar la compra. Intente de nuevo.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const totalValue = selectedItems.reduce((sum, s) => sum + s.quantity * s.unit_price, 0)

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary">Registrar Compra</h1>
      </div>

      {suppliersLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div>
          <p className="text-title-medium text-abyssal-text-primary mb-2">Proveedor</p>
          <div className="relative mb-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-abyssal-text-secondary/60" />
            <input
              type="text"
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              placeholder="Buscar proveedor..."
              className="w-full bg-abyssal-surface-high rounded-xl px-4 py-3 pl-11 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-primary/20 focus:border-abyssal-primary/40 mb-2"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filteredSuppliers.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedSupplier(s); setSupplierSearch("") }}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                  selectedSupplier?.id === s.id
                    ? "bg-abyssal-primary text-white"
                    : "bg-abyssal-surface-high text-abyssal-text-secondary hover:bg-abyssal-surface-highest"
                }`}
              >
                {s.name}
              </button>
            ))}
            {filteredSuppliers.length === 0 && (
              <p className="text-body-medium text-abyssal-text-secondary py-2">No se encontraron proveedores</p>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-title-medium text-abyssal-text-primary mb-2">Productos</p>
        {productsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-abyssal-text-secondary/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full bg-abyssal-surface-high rounded-xl px-4 py-3 pl-11 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-primary/20 focus:border-abyssal-primary/40"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
              {filteredProducts
                .filter((p) => !selectedItems.find((s) => s.product_id === p.id))
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between bg-abyssal-surface-high rounded-xl p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-body-medium text-abyssal-text-primary truncate">{product.name}</p>
                      <p className="text-label-small text-abyssal-text-secondary">
                        Stock: {product.stock} {product.unit} · Costo: {formatCurrency(product.price_compra)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="w-8 h-8 rounded-full bg-abyssal-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 ml-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-body-medium text-abyssal-text-secondary py-4">
                  No se encontraron productos
                </p>
              )}
            </div>
          </>
        )}

        {selectedItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-body-medium text-abyssal-text-primary font-medium">Agregados</p>
            {selectedItems.map((item) => (
              <div key={item.product_id} className="bg-abyssal-surface glass rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] text-abyssal-text-primary font-medium truncate">{item.product_name}</p>
                  <button
                    onClick={() => setSelectedItems((prev) => prev.filter((s) => s.product_id !== item.product_id))}
                    className="text-abyssal-text-secondary hover:text-abyssal-red transition-colors p-1"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-abyssal-text-secondary font-medium">Presentación</label>
                    <select
                      value={item.presentation}
                      onChange={(e) => handleUpdatePresentation(item.product_id, e.target.value)}
                      className="w-full bg-abyssal-surface-high rounded-lg px-2 py-2 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-primary/20 mt-1"
                    >
                      {PRESENTATIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-abyssal-text-secondary font-medium">Cantidad</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQty(item.product_id, Number(e.target.value))}
                      className="w-full bg-abyssal-surface-high rounded-lg px-2 py-2 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-primary/20 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-abyssal-text-secondary font-medium">Precio</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleUpdatePrice(item.product_id, Number(e.target.value))}
                      className="w-full bg-abyssal-surface-high rounded-lg px-2 py-2 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-primary/20 mt-1"
                    />
                  </div>
                </div>
                <p className="text-right text-[13px] text-abyssal-text-secondary">
                  Subtotal: <span className="text-abyssal-text-primary font-semibold">{formatCurrency(item.quantity * item.unit_price)}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-abyssal-surface glass rounded-2xl p-4 space-y-3">
        <div className="flex justify-between text-title-medium">
          <span className="text-abyssal-text-secondary">Total</span>
          <span className="text-abyssal-text-primary font-bold">{formatCurrency(totalValue)}</span>
        </div>
        <div>
          <label className="text-label-small text-abyssal-text-secondary block mb-1.5">Estado de Pago</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full bg-abyssal-surface-high rounded-xl px-4 py-3 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-primary/20 focus:border-abyssal-primary/40"
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="PAGADO">Pagado</option>
            <option value="PAGO PARCIAL">Pago parcial</option>
          </select>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
          onClick={handleSubmit}
          disabled={!selectedSupplier || selectedItems.length === 0}
        >
          {submitting ? "" : "Guardar Compra"}
        </Button>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
