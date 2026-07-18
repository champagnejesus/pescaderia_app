"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"

export default function EditSupplierPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const { toasts, addToast, removeToast } = useToast()
  const [form, setForm] = useState({ name: "", category: "" })

  useEffect(() => {
    api.get(`/suppliers/${id}`).then((res) => {
      setForm({ name: res.data.name, category: res.data.category })
    }).catch(() => setError("Error al cargar proveedor")).finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.put(`/suppliers/${id}`, form)
      addToast("Proveedor actualizado", "success")
      router.push(`/suppliers/${id}`)
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Error al actualizar proveedor"
      setError(typeof detail === "string" ? detail : JSON.stringify(detail))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-abyssal-bg p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-[20px] font-bold text-abyssal-text-primary flex-1">Editar Proveedor</h1>
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
            <option value="">Seleccionar categoría</option>
            <option value="PESCADO BLANCO">PESCADO BLANCO</option>
            <option value="MARISCO">MARISCO</option>
            <option value="CONGELADOS">CONGELADOS</option>
            <option value="EMPAQUES">EMPAQUES</option>
            <option value="TRANSPORTE">TRANSPORTE</option>
            <option value="OTRO">OTRO</option>
          </select>
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "" : "Guardar Cambios"}
        </Button>
      </form>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
