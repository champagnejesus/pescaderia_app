"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Minus, Search } from "lucide-react"
import api from "@/lib/api"
import { ClientSelector } from "@/components/orders/ClientSelector"
import { ProductPicker } from "@/components/orders/ProductPicker"
import { PaymentMethodSelector } from "@/components/orders/PaymentMethodSelector"
import { CheckoutSummary } from "@/components/orders/CheckoutSummary"
import { SuccessOverlay } from "@/components/orders/SuccessOverlay"
import { Skeleton } from "@/components/ui/skeleton"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"

interface Client {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  stock: number
  unit: string
  price_compra: number
  price_venta: number
}

const PRESENTATIONS = ["Caja", "Unidad", "Kilogramo"]

interface SelectedItem {
  product_id: number
  product_name: string
  presentation: string
  quantity: number
  unit_price: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")
  const [paymentStatus, setPaymentStatus] = useState("PENDIENTE")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<{ id: number; order_number: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [clientSearchQuery, setClientSearchQuery] = useState("")
  const [clientsLoading, setClientsLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [productsError, setProductsError] = useState<string | null>(null)
  const isQuickSale = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("quickSale") === "true"

  useEffect(() => {
    api.get<Client[]>("/clients")
      .then(({ data }) => {
        setClients(data)
        if (isQuickSale && data.length > 0) setSelectedClient(data[0])
        setClientsLoading(false)
      })
      .catch(() => { setClientsError("Error al cargar clientes"); setClientsLoading(false) })
    api.get<Product[]>("/products")
      .then(({ data }) => { setAllProducts(data); setProductsLoading(false) })
      .catch(() => { setProductsError("Error al cargar productos"); setProductsLoading(false) })
  }, [isQuickSale])

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()),
  )

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProduct = useCallback((product: Product) => {
    const existing = selectedItems.find((s) => s.product_id === product.id)
    const currentQty = existing ? existing.quantity : 0
    if (currentQty >= product.stock) {
      addToast(`Stock insuficiente para ${product.name} (disponible: ${product.stock} ${product.unit})`, "error")
      return
    }
    if (existing) {
      setSelectedItems((prev) =>
        prev.map((s) =>
          s.product_id === product.id ? { ...s, quantity: s.quantity + 1 } : s,
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
        unit_price: product.price_venta,
      },
    ])
  }, [selectedItems, addToast])

  const handleUpdateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setSelectedItems((prev) => prev.filter((s) => s.product_id !== productId))
      return
    }
    const product = allProducts.find((p) => p.id === productId)
    if (product && qty > product.stock) {
      addToast(`Stock insuficiente (máximo: ${product.stock} ${product.unit})`, "error")
      return
    }
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, quantity: qty } : s)),
    )
  }, [allProducts, addToast])

  const handleUpdatePresentation = useCallback((productId: number, presentation: string) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, presentation } : s))
    )
  }, [])

  const handleUpdatePrice = useCallback((productId: number, price: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, unit_price: price } : s))
    )
  }, [])

  const handleSubmit = async () => {
    if (!selectedClient || selectedItems.length === 0) return
    setSubmitting(true)
    try {
      const items = selectedItems.map((s) => ({
        product_id: s.product_id,
        presentation: s.presentation,
        quantity: s.quantity,
        unit_price: s.unit_price,
        subtotal: s.quantity * s.unit_price,
      }))
      const { data } = await api.post("/orders", {
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        items,
        payment_method: paymentMethod.toUpperCase(),
        payment_status: paymentStatus,
        delivery_date: deliveryDate || "",
      })
      setSuccessOrder({ id: data?.id, order_number: data?.order_number || "N/A" })
    } catch {
      addToast("Error al crear el pedido. Intente de nuevo.", "error")
    } finally {
      setSubmitting(false)
    }
  }

  if (successOrder) {
    return (
      <SuccessOverlay
        open
        order={successOrder}
        onView={() => router.push(`/orders/${successOrder.id}`)}
        onClose={() => router.push("/orders")}
      />
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary">{isQuickSale ? "Registrar Venta" : "Nuevo Pedido"}</h1>
      </div>

      {clientsError ? (
        <p className="text-body-medium text-abyssal-red">{clientsError}</p>
      ) : clientsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
        </div>
      ) : (
        <div>
          <ClientSelector
            clients={filteredClients}
            selectedId={selectedClient?.id ?? null}
            onSelect={(client) => setSelectedClient(client)}
            onSearch={setClientSearchQuery}
            searchValue={clientSearchQuery}
          />
          {isQuickSale && selectedClient && (
            <p className="text-label-small text-abyssal-text-secondary mt-1 ml-1">
              Venta directa &mdash; puedes cambiar el cliente si es necesario
            </p>
          )}
        </div>
      )}

      {productsError ? (
        <p className="text-body-medium text-abyssal-red">{productsError}</p>
      ) : productsLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : (
        <ProductPicker
          products={filteredProducts}
          selected={selectedItems}
          onAdd={handleAddProduct}
          onUpdateQty={handleUpdateQty}
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      {selectedItems.length > 0 && (
        <div className="space-y-3">
          <p className="text-title-medium text-abyssal-text-primary">Productos Agregados</p>
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
                    className="w-full bg-abyssal-surface-high rounded-lg px-2 py-2 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline/30 mt-1"
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
                    className="w-full bg-abyssal-surface-high rounded-lg px-2 py-2 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline/30 mt-1"
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
                    className="w-full bg-abyssal-surface-high rounded-lg px-2 py-2 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline/30 mt-1"
                  />
                </div>
              </div>
              <p className="text-right text-[13px] text-abyssal-text-secondary">
                Subtotal: <span className="text-abyssal-text-primary font-semibold">
                  ${(item.quantity * item.unit_price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

      <div className="bg-abyssal-surface rounded-abyssal-sm p-4 space-y-3">
        <p className="text-title-medium text-abyssal-text-primary">Estado de Pago</p>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full bg-abyssal-surface-high rounded-xl px-4 py-3 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline/30 focus:border-abyssal-primary/40"
        >
          <option value="PENDIENTE">Pendiente</option>
          <option value="PAGADO">Pagado</option>
          <option value="PAGO PARCIAL">Pago parcial</option>
        </select>
      </div>

      {!isQuickSale && (
        <div>
          <p className="text-title-medium text-abyssal-text-primary mb-2">Fecha de Entrega</p>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary transition-colors"
          />
        </div>
      )}

      <CheckoutSummary
        items={selectedItems}
        paymentMethod={paymentMethod}
        paymentStatus={paymentStatus}
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
