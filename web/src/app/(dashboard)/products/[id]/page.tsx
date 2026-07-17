"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockBadge } from "@/components/products/StockBadge"

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

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjustQty, setAdjustQty] = useState(0)

  useEffect(() => {
    api.get<Product>("/products/" + id).then((res) => setProduct(res.data)).catch(() => setProduct(null)).finally(() => setLoading(false))
  }, [id])

  const priceHistory = Array.from({ length: 7 }, (_, i) => ({
    day: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"][i],
    price: product ? Math.max(0, product.price * (0.85 + Math.random() * 0.3)) : 0,
  }))

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-body-medium text-abyssal-text-secondary">Cargando...</div>
  }

  if (!product) {
    return <div className="flex items-center justify-center h-40 text-body-medium text-abyssal-red">Producto no encontrado</div>
  }

  const initial = product.name.charAt(0).toUpperCase()

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary font-bold">Producto</h1>
        <button onClick={() => router.push("/products/" + id + "/edit")} className="text-abyssal-text-secondary hover:text-abyssal-text-primary transition-colors">
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      <div className="mx-4 rounded-abyssal-md overflow-hidden h-48">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-abyssal-primary-light to-abyssal-primary flex items-center justify-center">
            <span className="text-display-large text-abyssal-on-primary font-bold">{initial}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-title-large text-abyssal-text-primary font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-abyssal-surface rounded-abyssal-md p-4">
            <p className="text-label-medium text-abyssal-text-secondary">Precio</p>
            <p className="text-headline-medium text-abyssal-text-primary font-bold">
              ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-abyssal-surface rounded-abyssal-md p-4">
            <p className="text-label-medium text-abyssal-text-secondary">Stock</p>
            <div className="flex items-center gap-2 mt-1">
              <StockBadge stock={product.stock} threshold={product.low_stock_threshold} />
              <span className="text-body-medium text-abyssal-text-secondary">{product.unit}</span>
            </div>
          </div>
        </div>

        <div className="bg-abyssal-surface rounded-abyssal-md p-4">
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

        <div className="bg-abyssal-surface rounded-abyssal-md p-4 flex items-center justify-between">
          <span className="text-body-medium text-abyssal-text-secondary">Stock minimo</span>
          <span className="text-body-medium text-abyssal-text-primary font-semibold">{product.low_stock_threshold}</span>
        </div>

        <div className="bg-abyssal-surface rounded-abyssal-md p-4">
          <p className="text-title-medium text-abyssal-text-primary mb-3">Ajustar Stock</p>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={adjustQty || ""}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              placeholder="Cantidad"
              className="flex-1"
            />
            <Button variant="primary" size="md" onClick={async () => {
              try {
                const res = await api.patch("/products/" + id + "/stock", { stock: adjustQty })
                setProduct(res.data)
              } catch (e) {
                alert("Error al actualizar stock")
              }
            }}>Actualizar</Button>
          </div>
        </div>
      </div>
    </>
  )
}
