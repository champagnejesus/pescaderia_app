"use client"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import ExpenseCategorySelect from "@/components/transactions/ExpenseCategorySelect"

interface ExpenseDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function ExpenseDialog({ open, onClose, onCreated }: ExpenseDialogProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [expenseCategoryId, setExpenseCategoryId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    const num = Number.parseFloat(amount)
    if (!title.trim() || Number.isNaN(num) || num <= 0) return
    setSaving(true)
    setError("")
    try {
      const now = new Date()
      const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false })
      await api.post("/transactions", {
        title: title.trim(),
        time,
        type: "Gasto",
        amount: -num,
        status: "EGRESO",
        expense_category_id: expenseCategoryId,
      })
      setTitle("")
      setAmount("")
      setExpenseCategoryId(null)
      onCreated()
      onClose()
    } catch {
      setError("Error al registrar el gasto")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Registrar Gasto">
      <div className="space-y-4">
        <Input
          placeholder="ej. Compra de hielo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-abyssal-text-secondary font-medium">$</span>
          <Input
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const v = e.target.value
              if (/^\d*\.?\d{0,2}$/.test(v)) setAmount(v)
            }}
            className="pl-8"
          />
        </div>
        <div>
          <label className="block text-sm text-abyssal-text-secondary mb-1">Categoría del gasto</label>
          <ExpenseCategorySelect
            value={expenseCategoryId}
            onChange={setExpenseCategoryId}
          />
        </div>
        {error && <p className="text-[12px] font-medium text-abyssal-red">{error}</p>}
        <div className="flex gap-3 pt-1">
          <Button variant="ghost" size="lg" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSave}
            loading={saving}
            disabled={!title.trim() || !amount || Number.parseFloat(amount) <= 0}
          >
            Registrar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
