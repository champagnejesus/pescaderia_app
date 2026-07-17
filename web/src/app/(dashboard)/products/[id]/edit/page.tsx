"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", category: "PESCADO BLANCO", stock: 0, unit: "kg",
    price: 0, description: "", image_url: "", is_extra_quality: false, low_stock_threshold: 5,
  })

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      const p = res.data
      setForm({ name: p.name, category: p.category, stock: p.stock, unit: p.unit, price: p.price, description: p.description || "", image_url: p.image_url || "", is_extra_quality: p.is_extra_quality, low_stock_threshold: p.low_stock_threshold })
    }).catch(() => setError("Error al cargar producto")).finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.put(`/products/${id}`, form)
      router.push(`/products/${id}`)
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data || err.message || "Error al actualizar producto"
      setError(typeof detail === "string" ? detail : JSON.stringify(detail))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex items-center justify-center h-40 text-body-medium text-abyssal-text-secondary">Cargando...</div>

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary flex-1">Editar Producto</h1>
        <button onClick={handleSubmit} disabled={loading} className="text-abyssal-primary hover:opacity-80">
          <Save className="w-5 h-5" />
        </button>
      </header>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && <p className="text-body-medium text-abyssal-red">{error}</p>}
        <div className="space-y-1">
          <label className="text-label-small text-abyssal-text-secondary">Nombre</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <label className="text-label-small text-abyssal-text-secondary">Categoría</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-abyssal-surface border border-abyssal-outline rounded-abyssal-sm px-3 py-2.5 text-body-medium text-abyssal-text-primary">
            {["PESCADO BLANCO", "MARISCO", "CONGELADOS"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-label-small text-abyssal-text-secondary">Stock</label>
            <Input type="number" step="0.1" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-label-small text-abyssal-text-secondary">Unidad</label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-label-small text-abyssal-text-secondary">Precio</label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
          </div>
          <div className="space-y-1">
            <label className="text-label-small text-abyssal-text-secondary">Stock mínimo</label>
            <Input type="number" step="0.1" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: +e.target.value })} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-label-small text-abyssal-text-secondary">Descripción</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-abyssal-surface border border-abyssal-outline rounded-abyssal-sm px-3 py-2.5 text-body-medium text-abyssal-text-primary min-h-[80px]" />
        </div>
        <div className="space-y-1">
          <label className="text-label-small text-abyssal-text-secondary">URL de imagen</label>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-body-medium text-abyssal-text-primary">
          <input type="checkbox" checked={form.is_extra_quality} onChange={(e) => setForm({ ...form, is_extra_quality: e.target.checked })} />
          Calidad extra
        </label>
        <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </div>
  )
}
