"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", category: "PESCADO BLANCO", stock: 0, unit: "kg",
    price: 0, description: "", image_url: "", is_extra_quality: false, low_stock_threshold: 5,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/products", form)
      router.push("/products")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al crear producto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-[20px] font-bold text-abyssal-text-primary flex-1">Nuevo Producto</h1>
      </header>
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-[480px] mx-auto">
        {error && (
          <div className="bg-abyssal-red/15 rounded-xl px-4 py-2.5 text-[15px] text-abyssal-red">{error}</div>
        )}
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">Nombre</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">Categoría</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-abyssal-surface-high/60 glass-subtle rounded-xl px-4 py-3 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline/40 focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 transition-all appearance-none">
            {["PESCADO BLANCO", "MARISCO", "CONGELADOS"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[12px] text-abyssal-text-secondary">Stock</label>
            <Input type="number" step="0.1" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-abyssal-text-secondary">Unidad</label>
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[12px] text-abyssal-text-secondary">Precio</label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-abyssal-text-secondary">Stock mínimo</label>
            <Input type="number" step="0.1" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: +e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">Descripción</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-abyssal-surface-high/60 glass-subtle rounded-xl px-4 py-3 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline/40 focus:border-abyssal-primary/60 focus:ring-4 focus:ring-abyssal-primary/10 transition-all min-h-[80px] resize-none" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">URL de imagen</label>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        </div>
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all",
            form.is_extra_quality ? "bg-abyssal-primary border-abyssal-primary" : "border-abyssal-outline/40"
          )}>
            {form.is_extra_quality && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-[15px] text-abyssal-text-primary">Calidad extra</span>
        </label>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "" : "Guardar Producto"}
        </Button>
      </form>
    </div>
  )
}
