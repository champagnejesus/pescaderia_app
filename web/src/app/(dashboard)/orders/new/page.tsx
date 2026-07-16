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
  id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("Efectivo")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [successOrder, setSuccessOrder] = useState<{ order_number: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    api.get<Client[]>("/clients").then(({ data }) => setClients(data)).catch(() => {})
    api.get<Product[]>("/products").then(({ data }) => setAllProducts(data)).catch(() => {})
  }, [])

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProduct = useCallback((product: Product) => {
    setSelectedItems((prev) => {
      const existing = prev.find((s) => s.product_id === product.id)
      if (existing) {
        return prev.map((s) =>
          s.product_id === product.id ? { ...s, quantity: s.quantity + 1 } : s,
        )
      }
      const newItem: SelectedItem = {
        id: Date.now(),
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
      }
      return [...prev, newItem]
    })
  }, [])

  const handleUpdateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setSelectedItems((prev) => prev.filter((s) => s.product_id !== productId))
      return
    }
    setSelectedItems((prev) =>
      prev.map((s) => (s.product_id === productId ? { ...s, quantity: qty } : s)),
    )
  }, [])

  const handleSubmit = async () => {
    if (!selectedClient || selectedItems.length === 0) return
    setSubmitting(true)
    try {
      const items = selectedItems.map((s) => ({
        product_id: s.product_id,
        quantity: s.quantity,
        unit_price: s.unit_price,
      }))
      const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
      const { data } = await api.post("/orders", {
        client_id: selectedClient.id,
        items,
        total_value: subtotal * 1.10,
        payment_method: paymentMethod.toUpperCase(),
        delivery_date: deliveryDate || null,
        status: "PENDIENTE",
      })
      setSuccessOrder({ order_number: data.order_number || data.order_number || "N/A" })
    } catch {
      // error handled silently
    } finally {
      setSubmitting(false)
    }
  }

  if (successOrder) {
    return (
      <SuccessOverlay
        open
        order={successOrder}
        onView={() => router.push(`/orders/${successOrder.order_number}`)}
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
        <h1 className="text-title-large text-abyssal-text-primary">Nuevo Pedido</h1>
      </div>

      <ClientSelector
        clients={clients}
        selectedId={selectedClient?.id ?? null}
        onSelect={(client) => setSelectedClient(client)}
        onSearch={() => {}}
      />

      <ProductPicker
        products={filteredProducts}
        selected={selectedItems}
        onAdd={handleAddProduct}
        onUpdateQty={handleUpdateQty}
        onSearch={setSearchQuery}
      />

      <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

      <div>
        <p className="text-title-medium text-abyssal-text-primary mb-2">Fecha de Entrega</p>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className="bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-abyssal-text-primary w-full outline-none border border-abyssal-outline focus:border-abyssal-primary transition-colors"
        />
      </div>

      <CheckoutSummary
        items={selectedItems}
        paymentMethod={paymentMethod}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  )
}
