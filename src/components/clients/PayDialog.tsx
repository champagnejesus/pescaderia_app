"use client"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PaymentMethodSelector } from "@/components/orders/PaymentMethodSelector"
import api from "@/lib/api"
import { useToast } from "@/hooks/useToast"

interface PayDialogProps {
  client: { id: number; name: string; outstanding_balance: number } | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PayDialog({ client, open, onClose, onSuccess }: PayDialogProps) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("Efectivo")
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const maxAmount = client?.outstanding_balance ?? 0

  async function handlePay() {
    if (!client || !amount || parseFloat(amount) <= 0) return
    const payAmount = parseFloat(amount)
    if (payAmount > maxAmount) {
      addToast("El pago excede el saldo pendiente", "error")
      return
    }
    setLoading(true)
    try {
      await api.post(`/accounts/receivable/${client.id}/pay`, { amount: payAmount, method })
      addToast(`Cobro registrado — $${payAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, "success")
      onSuccess()
      onClose()
      setAmount("")
      setMethod("Efectivo")
    } catch {
      addToast("Error al registrar el cobro", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Cobrar a ${client?.name ?? ""}`} showClose>
      <div className="space-y-4">
        <div className="bg-abyssal-surface-high rounded-abyssal-sm p-3 flex justify-between">
          <span className="text-body-medium text-abyssal-text-secondary">Saldo actual</span>
          <span className="text-title-medium text-abyssal-red font-semibold">
            ${maxAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <label className="text-label-small text-abyssal-text-secondary mb-1 block">Monto a cobrar</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <PaymentMethodSelector value={method} onChange={setMethod} />
        <Button className="w-full" onClick={handlePay} loading={loading} disabled={!amount || parseFloat(amount) <= 0}>
          {loading ? "" : "Registrar Cobro"}
        </Button>
      </div>
    </Dialog>
  )
}
