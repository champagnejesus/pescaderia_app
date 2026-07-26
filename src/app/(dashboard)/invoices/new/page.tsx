"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ChevronDownIcon, CalendarIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"

interface Client { id: number; name: string; ruc?: string }

export default function NewInvoicePage() {
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [description, setDescription] = useState("")
  const [currency, setCurrency] = useState("PEN")
  const [baseAmount, setBaseAmount] = useState("")
  const [igv, setIgv] = useState("")
  const [total, setTotal] = useState("")

  useEffect(() => { api.get("/clients").then(({ data }) => setClients(data)).catch(() => {}) }, [])

  function calcTotal(base: string) {
    const b = parseFloat(base) || 0
    const i = b * 0.18
    setIgv(i.toFixed(2))
    setTotal((b + i).toFixed(2))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient) { addToast("Seleccione un cliente", "error"); return }
    if (!baseAmount) { addToast("Ingrese el monto base", "error"); return }
    setLoading(true)
    try {
      await api.post("/invoices", { client_id: selectedClient.id, description: description || "Factura electrónica", currency, base_amount: parseFloat(baseAmount), igv: parseFloat(igv), total: parseFloat(total) })
      addToast("Factura emitida exitosamente", "success")
      setTimeout(() => router.push("/invoices"), 800)
    } catch (err: any) { addToast(err.response?.data?.detail || err.message || "Error", "error") }
    finally { setLoading(false) }
  }

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-abyssal-text-secondary hover:text-abyssal-text-primary p-1"><ArrowLeftIcon className="w-5 h-5" /></button>
          <div><h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Nueva Factura</h1><p className="text-[14px] text-abyssal-text-secondary-variant">Emitir nueva factura electrónica</p></div>
          <button onClick={() => router.back()} className="ml-auto text-abyssal-text-secondary hover:text-abyssal-text-primary p-1"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-abyssal-outline"><h2 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Datos del Cliente</h2></div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Cliente</label>
                  <div className="relative">
                    <select value={selectedClient?.id || ""} onChange={(e) => { const c = clients.find((c) => c.id === Number(e.target.value)); setSelectedClient(c || null) }} className="w-full h-10 bg-abyssal-surface-high rounded-xl px-3 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline appearance-none cursor-pointer">
                      <option value="">Seleccionar cliente</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyssal-text-secondary pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">RUC</label>
                  <Input value={selectedClient?.ruc || ""} readOnly />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Fecha Emisión</label>
                  <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg shadow-abyssal-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-abyssal-outline"><h2 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Detalle de Factura</h2></div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Descripción</label>
                  <Input placeholder="Ej: Venta de productos pesqueros" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Moneda</label>
                  <div className="relative">
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-10 bg-abyssal-surface-high rounded-xl px-3 text-[13px] text-abyssal-text-primary outline-none border border-abyssal-outline appearance-none cursor-pointer">
                      <option value="PEN">Soles (PEN)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyssal-text-secondary pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Base Imponible</label>
                  <Input type="number" step="0.01" placeholder="0.00" value={baseAmount} onChange={(e) => { setBaseAmount(e.target.value); calcTotal(e.target.value) }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">IGV (18%)</label>
                  <Input value={igv ? `S/ ${igv}` : ""} readOnly className="bg-abyssal-surface-high" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-abyssal-text-secondary font-medium">Total</label>
                  <Input value={total ? `S/ ${total}` : ""} readOnly className="bg-abyssal-primary/5 border-abyssal-primary/30 text-abyssal-primary font-semibold" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" variant="primary" loading={loading}>Emitir Factura</Button>
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
