"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import api from "@/lib/api"

interface DebtorOption {
  id: number
  name: string
}

interface AddDebtDialogProps {
  open: boolean
  onClose: () => void
  type: "receivable" | "payable"
  onCreated: () => void
}

export function AddDebtDialog({ open, onClose, type, onCreated }: AddDebtDialogProps) {
  const [debtors, setDebtors] = useState<DebtorOption[]>([])
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedName, setSelectedName] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [customName, setCustomName] = useState("")
  const [useCustom, setUseCustom] = useState(false)

  useEffect(() => {
    if (!open) return
    const endpoint = type === "receivable" ? "/clients" : "/suppliers"
    api.get<DebtorOption[]>(endpoint, { params: { limit: 100 } }).then(({ data }) => {
      setDebtors(data)
    }).catch(() => {})
    setSearch("")
    setSelectedId(null)
    setSelectedName("")
    setDescription("")
    setAmount("")
    setCustomName("")
    setUseCustom(false)
  }, [open, type])

  const filtered = debtors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async () => {
    const name = useCustom ? customName : selectedName
    if (!name || !description || !amount || parseFloat(amount) <= 0) return
    setSaving(true)
    try {
      await api.post(`/accounts/${type}`, {
        debtor_id: useCustom ? 0 : selectedId,
        debtor_name: name,
        description,
        amount: parseFloat(amount),
      })
      onCreated()
      onClose()
    } catch {
      // handled by parent
    } finally {
      setSaving(false)
    }
  }

  const label = type === "receivable" ? "Cobrar" : "Pagar"

  return (
    <Dialog open={open} onClose={onClose} title={`Agregar Cuenta por ${label}`}>
      <div className="space-y-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} className="rounded" />
          <span className="text-[13px] text-abyssal-text-primary">Nombre personalizado</span>
        </label>

        {useCustom ? (
          <div>
            <label className="text-[12px] text-abyssal-text-secondary font-medium block mb-1.5">Nombre</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nombre del deudor"
              className="w-full h-11 px-3 rounded-xl bg-abyssal-surface-high text-[14px] text-abyssal-text-primary placeholder-abyssal-text-secondary outline-none border border-abyssal-outline/20 focus:border-abyssal-primary/40 transition-colors"
            />
          </div>
        ) : (
          <div>
            <label className="text-[12px] text-abyssal-text-secondary font-medium block mb-1.5">
              {type === "receivable" ? "Cliente" : "Proveedor"}
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyssal-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-abyssal-surface-high text-[13px] text-abyssal-text-primary placeholder-abyssal-text-secondary outline-none border border-abyssal-outline/20 focus:border-abyssal-primary/40 transition-colors"
              />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedId(d.id); setSelectedName(d.name) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                    selectedId === d.id
                      ? "bg-abyssal-primary/12 text-abyssal-primary font-medium"
                      : "text-abyssal-text-primary hover:bg-abyssal-surface-high"
                  }`}
                >
                  {d.name}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-[12px] text-abyssal-text-secondary text-center py-2">
                  Sin resultados
                </p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-[12px] text-abyssal-text-secondary font-medium block mb-1.5">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Préstamo, productos fiados..."
            className="w-full h-11 px-3 rounded-xl bg-abyssal-surface-high text-[14px] text-abyssal-text-primary placeholder-abyssal-text-secondary outline-none border border-abyssal-outline/20 focus:border-abyssal-primary/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-[12px] text-abyssal-text-secondary font-medium block mb-1.5">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-abyssal-text-secondary font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 pl-7 pr-3 rounded-xl bg-abyssal-surface-high text-[15px] text-abyssal-text-primary font-semibold outline-none border border-abyssal-outline/20 focus:border-abyssal-primary/40 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" size="lg" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            loading={saving}
            disabled={saving || !description || !amount || parseFloat(amount) <= 0 || (!useCustom && !selectedId) || (useCustom && !customName)}
          >
            {saving ? "" : "Agregar"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
