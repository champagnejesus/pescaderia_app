"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: "", category: "PESCADO BLANCO", stock: 0, unit: "kg",
    price_compra: 0, price_venta: 0, description: "", image_url: "", is_extra_quality: false, low_stock_threshold: 5,
  })

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      const p = res.data
      setForm({ name: p.name, category: p.category, stock: p.stock, unit: p.unit, price_compra: p.price_compra ?? 0, price_venta: p.price_venta ?? p.price, description: p.description || "", image_url: p.image_url || "", is_extra_quality: p.is_extra_quality, low_stock_threshold: p.low_stock_threshold })
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

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/products/${id}`)
      router.push("/products")
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Error al eliminar producto"
      setError(typeof detail === "string" ? detail : JSON.stringify(detail))
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-abyssal-bg p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-10" />
        <Skeleton className="h-20" />
        <Skeleton className="h-10" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary flex-1">Editar Producto</h1>
      </header>
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-[480px] mx-auto">
        {error && (
          <div className="bg-abyssal-red-bg rounded-abyssal-sm px-4 py-2 text-body-medium text-abyssal-red">{error}</div>
        )}
        <div className="space-y-1.5">
          <label className="text-label-small text-abyssal-text-secondary">Nombre</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-label-small text-abyssal-text-secondary">Categoría</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-body-medium text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary focus:ring-2 focus:ring-abyssal-primary/20 transition-all appearance-none">
            {["PESCADO BLANCO", "MARISCO", "CONGELADOS"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-label-small text-abyssal-text-secondary">Stock</label>
            <Input type="number" step="0.1" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-small text-abyssal-text-secondary">Unidad</label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-label-small text-abyssal-text-secondary">Precio Compra</label>
            <Input type="number" step="0.01" value={form.price_compra} onChange={(e) => setForm({ ...form, price_compra: +e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-label-small text-abyssal-text-secondary">Precio Venta</label>
            <Input type="number" step="0.01" value={form.price_venta} onChange={(e) => setForm({ ...form, price_venta: +e.target.value })} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-label-small text-abyssal-text-secondary">Stock mínimo</label>
          <Input type="number" step="0.1" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: +e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-label-small text-abyssal-text-secondary">Descripción</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-abyssal-surface-high rounded-abyssal-sm px-4 py-3 text-body-medium text-abyssal-text-primary outline-none border border-abyssal-outline focus:border-abyssal-primary focus:ring-2 focus:ring-abyssal-primary/20 transition-all min-h-[80px] resize-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-label-small text-abyssal-text-secondary">URL de imagen</label>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <div className={cn(
            "w-5 h-5 rounded flex items-center justify-center border-2 transition-all",
            form.is_extra_quality ? "bg-abyssal-primary border-abyssal-primary" : "border-abyssal-outline"
          )}>
            {form.is_extra_quality && (
              <svg className="w-3 h-3 text-abyssal-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-body-medium text-abyssal-text-primary">Calidad extra</span>
        </label>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "" : "Guardar Cambios"}
        </Button>
        <Button type="button" variant="ghost" size="lg" className="w-full text-abyssal-red hover:bg-abyssal-red/10" onClick={() => setDeleteOpen(true)}>
          Eliminar Producto
        </Button>
      </form>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar Producto" showClose>
        <p className="text-[15px] text-abyssal-text-secondary mb-4">
          ¿Estás seguro de que deseas eliminar <strong className="text-abyssal-text-primary">{form.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" className="flex-1 bg-abyssal-red hover:bg-abyssal-red/90" loading={deleting} onClick={handleDelete}>
            {deleting ? "" : "Eliminar"}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
