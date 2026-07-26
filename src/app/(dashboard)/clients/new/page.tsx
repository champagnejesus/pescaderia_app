"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"

export default function NewClientPage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", ruc: "", email: "", phone: "", address: "", city: "Lima", type: "Empresa" })
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [field]: e.target.value }))
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { addToast("El nombre es obligatorio", "error"); return }
    setLoading(true)
    try {
      await api.post("/clients", { name: form.name.trim(), ruc: form.ruc.trim() || undefined, email: form.email.trim() || undefined, phone: form.phone.trim() || undefined, address: form.address.trim() || undefined, city: form.city })
      addToast("Cliente creado exitosamente", "success")
      setTimeout(() => router.push("/clients"), 800)
    } catch (err: any) { addToast(err.response?.data?.detail || err.message || "Error", "error") }
    finally { setLoading(false) }
  }
  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary p-1"><ArrowLeftIcon className="w-5 h-5" /></button>
          <div><h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Nuevo Cliente</h1><p className="text-[14px] text-abyssal-text-secondary-variant">Registrar nuevo cliente en el sistema</p></div>
          <button onClick={() => router.back()} className="ml-auto text-abyssal-text-secondary hover:text-abyssal-text-primary p-1"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden">
            <div className="p-6 border-b border-abyssal-outline"><h2 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Información del Cliente</h2></div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Razón Social</label>
                  <Input placeholder="Nombre de la empresa" value={form.name} onChange={handleChange("name")} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">RUC</label>
                  <Input placeholder="Ingrese RUC" value={form.ruc} onChange={handleChange("ruc")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Correo Electrónico</label>
                  <Input type="email" placeholder="ej: contacto@empresa.pe" value={form.email} onChange={handleChange("email")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Teléfono</label>
                  <Input placeholder="+51 1 234 5678" value={form.phone} onChange={handleChange("phone")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Tipo Cliente</label>
                  <div className="relative">
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full h-10 bg-abyssal-surface-high rounded-xl px-3 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline appearance-none cursor-pointer">
                      <option>Empresa</option><option>Restaurante</option><option>Distribuidor</option><option>Exportador</option><option>Minorista</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyssal-text-secondary pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Dirección</label>
                  <Input placeholder="Av. Principal 123, Lima" value={form.address} onChange={handleChange("address")} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Ciudad</label>
                  <Input placeholder="Lima" value={form.city} onChange={handleChange("city")} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={loading}>Guardar Cliente</Button>
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
