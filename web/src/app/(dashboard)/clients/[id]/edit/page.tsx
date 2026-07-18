"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", credit_limit: 1500,
  })

  useEffect(() => {
    api.get(`/clients/${id}`).then((res) => {
      const c = res.data
      setForm({ name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "", credit_limit: c.credit_limit })
    }).catch(() => setError("Error al cargar cliente")).finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.put(`/clients/${id}`, form)
      router.push(`/clients/${id}`)
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data || err.message || "Error al actualizar cliente"
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
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full mt-6" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 glass sticky top-0 z-40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-abyssal-surface-high transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-[20px] font-bold text-abyssal-text-primary flex-1">Editar Cliente</h1>
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
          <label className="text-[12px] text-abyssal-text-secondary">Teléfono</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">Email</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">Dirección</label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-abyssal-text-secondary">Límite de Crédito</label>
          <Input type="number" step="0.01" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: +e.target.value })} />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "" : "Guardar Cambios"}
        </Button>
      </form>
    </div>
  )
}
