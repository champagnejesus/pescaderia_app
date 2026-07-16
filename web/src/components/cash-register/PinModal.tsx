"use client"
import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import { X, Delete } from "lucide-react"

interface PinModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
}

export function PinModal({ open, onClose, onConfirm }: PinModalProps) {
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

  const digits = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "", "0", "",
  ]

  return (
    <Dialog open={open} onClose={handleClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-title-medium text-abyssal-text-primary">Ingrese PIN de Seguridad</h2>
        <button onClick={handleClose} className="text-abyssal-text-secondary hover:text-abyssal-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              pin.length > i
                ? "bg-abyssal-primary border-abyssal-primary"
                : "border-abyssal-outline"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
        {digits.map((d, i) => {
          if (d === "") {
            return <div key={i} />
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              className="h-14 rounded-abyssal-sm bg-abyssal-surface-high text-title-large text-abyssal-text-primary font-bold hover:bg-abyssal-surface transition-colors"
            >
              {d}
            </button>
          )
        })}
        <button
          onClick={handleDelete}
          className="h-14 rounded-abyssal-sm bg-abyssal-surface-high flex items-center justify-center text-abyssal-text-secondary hover:bg-abyssal-surface transition-colors"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={handleConfirm}
        disabled={pin.length < 4}
        className="w-full mt-4 bg-abyssal-primary text-abyssal-on-primary rounded-abyssal-sm py-3 text-body-medium font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        Confirmar
      </button>
    </Dialog>
  )
}
