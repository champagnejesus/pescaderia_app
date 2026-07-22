"use client"

import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/formatters"

interface PayDialogProps {
  open: boolean
  onClose: () => void
  debtorName: string
  pendingAmount: number
  type: "receivable" | "payable"
  onPay: (amount: number, method: string) => Promise<void>
}

export function PayDialog({ open, onClose, debtorName, pendingAmount, type, onPay }: PayDialogProps) {
  const [amount, setAmount] = useState(pendingAmount)
  const [method, setMethod] = useState("Efectivo")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (amount <= 0 || amount > pendingAmount) return
    setSaving(true)
    try {
      await onPay(amount, method)
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setSaving(false)
    }
  }

  const label = type === "receivable" ? "Cobrar" : "Pagar"

  return (
    <Dialog open={open} onClose={onClose} title={`${label} a ${debtorName}`}>
      <div className="space-y-4 pt-2">
        <div className="bg-abyssal-surface-high rounded-xl p-3 text-center">
          <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider">Saldo pendiente</p>
          <p className="text-title-large text-abyssal-text-primary font-bold">{formatCurrency(pendingAmount)}</p>
        </div>

        <div>
          <label className="text-[12px] text-abyssal-text-secondary font-medium block mb-1.5">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-abyssal-text-secondary font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min={0}
              max={pendingAmount}
              value={amount}
              onChange={(e) => setAmount(Math.min(Number(e.target.value), pendingAmount))}
              className="w-full h-11 pl-7 pr-3 rounded-xl bg-abyssal-surface-high text-[15px] text-abyssal-text-primary font-semibold outline-none border border-abyssal-outline/20 focus:border-abyssal-primary/40 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] text-abyssal-text-secondary font-medium block mb-1.5">Método de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {["Efectivo", "Tarjeta", "Transferencia"].map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                  method === m
                    ? "bg-abyssal-primary text-white"
                    : "bg-abyssal-surface-high text-abyssal-text-secondary border border-abyssal-outline/20"
                }`}
              >
                {m}
              </button>
            ))}
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
            disabled={saving || amount <= 0}
          >
            {saving ? "" : `${label} $${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
