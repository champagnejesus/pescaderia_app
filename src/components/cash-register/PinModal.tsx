"use client"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { Delete } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DailySummary } from "@/lib/types"

interface PinModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
  summary: DailySummary | null
}

export function PinModal({ open, onClose, onConfirm, summary }: PinModalProps) {
  const [pin, setPin] = useState("")

  function handleDigit(d: string) {
    if (pin.length < 4) setPin((prev) => prev + d)
  }

  function handleDelete() {
    setPin((prev) => prev.slice(0, -1))
  }

  function handleConfirm() {
    if (pin.length === 4) {
      onConfirm(pin)
      setPin("")
    }
  }

  function handleClose() {
    setPin("")
    onClose()
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""]

  return (
    <Dialog open={open} onClose={handleClose} title="Confirmar Cierre" showClose>
      {summary && (
        <div className="flex justify-center gap-4 mb-5 text-center">
          <div>
            <p className="text-[11px] text-abyssal-text-secondary font-medium">Ventas</p>
            <p className="text-[15px] font-semibold text-abyssal-green">
              ${summary.total_sales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-px bg-abyssal-outline/30" />
          <div>
            <p className="text-[11px] text-abyssal-text-secondary font-medium">Gastos</p>
            <p className="text-[15px] font-semibold text-abyssal-red">
              -${Math.abs(summary.total_expenses).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-px bg-abyssal-outline/30" />
          <div>
            <p className="text-[11px] text-abyssal-text-secondary font-medium">Neto</p>
            <p className="text-[15px] font-semibold text-abyssal-text-primary">
              ${summary.net_total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <p className="text-[13px] text-abyssal-text-secondary text-center mb-5">Ingresa el PIN de seguridad</p>

      <div className="flex justify-center gap-3.5 mb-7">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-3.5 h-3.5 rounded-full transition-all duration-300",
              pin.length > i
                ? "bg-abyssal-primary scale-110"
                : "bg-abyssal-surface-high border-2 border-abyssal-primary/20/50"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {digits.map((d, i) => {
          if (d === "") return <div key={i} />
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className="h-[52px] rounded-full bg-abyssal-surface-high/60 glass-subtle text-[17px] text-abyssal-text-primary font-semibold hover:bg-abyssal-surface-highest/60 transition-all active:scale-90"
            >
              {d}
            </button>
          )
        })}
        <button
          onClick={handleDelete}
          className="h-[52px] rounded-full bg-abyssal-surface-high/60 glass-subtle flex items-center justify-center text-abyssal-text-secondary hover:bg-abyssal-surface-highest/60 transition-all active:scale-90"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={handleConfirm}
        disabled={pin.length < 4}
        className={cn(
          "w-full mt-5 bg-abyssal-primary text-white rounded-full py-3.5 text-[15px] font-semibold transition-all shadow-[0_2px_8px_rgba(94,92,230,0.35)]",
          pin.length === 4 ? "hover:brightness-110 active:scale-[0.97]" : "opacity-40 cursor-not-allowed"
        )}
      >
        Confirmar
      </button>
    </Dialog>
  )
}
