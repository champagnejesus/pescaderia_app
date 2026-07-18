"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
  price: number
}

interface SelectedItem {
  product_id: number
  product_name: string
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
    setSelectedItems((prev) => {
      const existing = prev.find((s) => s.product_id === product.id)
      if (existing) {
        return prev.map((s) =>
          s.product_id === product.id ? { ...s, quantity: s.quantity + 1 } : s,
        )
      }
      const newItem: SelectedItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
      }
      return [...prev, newItem]
    })
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

  const handleSubmit = async () => {
    if (!selectedClient || selectedItems.length === 0) return
    setSubmitting(true)
    try {
      const items = selectedItems.map((s) => ({
        product_id: s.product_id,
        quantity: s.quantity,
        unit_price: s.unit_price,
        subtotal: s.quantity * s.unit_price,
      }))
      const { data } = await api.post("/orders", {
        client_id: selectedClient.id,
        client_name: selectedClient.name,
        items,
        payment_method: paymentMethod.toUpperCase(),
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

      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

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
        onSubmit={handleSubmit}
        loading={submitting}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
