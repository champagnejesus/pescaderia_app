"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Package, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockBadge } from "@/components/products/StockBadge"
import { useToast } from "@/hooks/useToast"
import { ToastContainer } from "@/components/ui/ToastContainer"

interface Product {
  id: number
  name: string
  category: string
  stock: number
  unit: string
  price: number
  image_url: string
  description: string
  is_extra_quality: boolean
  low_stock_threshold: number
}

const DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjusting, setAdjusting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<Product>("/products/" + id).then((res) => setProduct(res.data)).catch(() => setProduct(null)).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-abyssal-bg p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full rounded-abyssal-md" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[250px]" />
        <Skeleton className="h-16" />
        <Skeleton className="h-20" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-abyssal-bg flex flex-col items-center justify-center gap-3 p-4">
        <AlertCircle className="w-12 h-12 text-abyssal-red" />
        <p className="text-title-medium text-abyssal-text-primary">Producto no encontrado</p>
        <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
      </div>
    )
  }

  const initial = product.name.charAt(0).toUpperCase()
  const priceHistory = DAYS.map((day) => ({
    day,
    price: Math.max(0, product.price * (0.85 + Math.random() * 0.3)),
  }))

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 backdrop-blur-xl border-b border-abyssal-outline/30 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary font-bold">Producto</h1>
        <button onClick={() => router.push("/products/" + id + "/edit")} className="p-2 -mr-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <Pencil className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
      </header>

      <div className="max-w-[480px] mx-auto">
        <div className="mx-4 rounded-abyssal-md overflow-hidden h-48 mt-4 animate-fade-in">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-abyssal-primary-light to-abyssal-primary flex items-center justify-center">
              <Package className="w-16 h-16 text-abyssal-on-primary/60" />
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
            <h1 className="text-title-large text-abyssal-text-primary font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-abyssal-surface-high text-abyssal-text-secondary rounded-abyssal-full px-3 py-0.5 text-label-small">
                {product.category}
              </span>
              {product.is_extra_quality && (
                <span className="bg-abyssal-yellow-bg text-abyssal-yellow rounded-abyssal-full px-3 py-0.5 text-label-small">
                  Calidad Extra
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="bg-abyssal-surface rounded-abyssal-md p-4">
              <p className="text-label-medium text-abyssal-text-secondary">Precio</p>
              <p className="text-headline-medium text-abyssal-text-primary font-bold mt-1">
                ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-abyssal-surface rounded-abyssal-md p-4">
              <p className="text-label-medium text-abyssal-text-secondary">Stock</p>
              <div className="flex items-center gap-2 mt-2">
                <StockBadge stock={product.stock} threshold={product.low_stock_threshold} />
                <span className="text-body-medium text-abyssal-text-secondary">{product.unit}</span>
              </div>
            </div>
          </div>

          <div className="bg-abyssal-surface rounded-abyssal-md p-4 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <p className="text-title-medium text-abyssal-text-primary mb-3">Tendencia de Precio</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--abyssal-outline)" />
                <XAxis dataKey="day" tick={{ fill: "var(--abyssal-text-secondary)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--abyssal-text-secondary)", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--abyssal-surface)", border: "1px solid var(--abyssal-outline)", borderRadius: "12px", color: "var(--abyssal-text-primary)" }} />
                <Bar dataKey="price" fill="var(--abyssal-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-abyssal-surface rounded-abyssal-md p-4 flex items-center justify-between animate-fade-in" style={{ animationDelay: "200ms" }}>
            <span className="text-body-medium text-abyssal-text-secondary">Stock mínimo</span>
            <span className="text-body-medium text-abyssal-text-primary font-semibold">{product.low_stock_threshold} {product.unit}</span>
          </div>

          {product.description && (
            <div className="bg-abyssal-surface rounded-abyssal-md p-4 animate-fade-in" style={{ animationDelay: "250ms" }}>
              <p className="text-label-medium text-abyssal-text-secondary mb-1">Descripción</p>
              <p className="text-body-medium text-abyssal-text-primary">{product.description}</p>
            </div>
          )}

          <div className="bg-abyssal-surface rounded-abyssal-md p-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <p className="text-title-medium text-abyssal-text-primary mb-3">Ajustar Stock</p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={adjustQty || ""}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                placeholder="Cantidad"
                className="flex-1"
              />
              <Button variant="primary" size="md" loading={adjusting} onClick={async () => {
                setAdjusting(true)
                try {
                  await api.patch("/products/" + id + "/stock", { stock: adjustQty })
                  const res = await api.get<Product>("/products/" + id)
                  setProduct(res.data)
                  setAdjustQty(0)
                } catch (e: any) {
                  const msg = e.response?.data?.detail || e.message || "Error al actualizar stock"
                  addToast(msg, "error")
                } finally {
                  setAdjusting(false)
                }
              }}>{adjusting ? "" : "Actualizar"}</Button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
