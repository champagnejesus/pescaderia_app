"use client"
import { cn } from "@/lib/utils"

interface PaymentMethodSelectorProps {
  value: string
  onChange: (v: string) => void
}

const OPTIONS = ["Efectivo", "Tarjeta"]

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div>
      <p className="text-[17px] font-semibold text-abyssal-text-primary mb-2">Método de Pago</p>
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 py-3 px-4 rounded-full text-[15px] font-medium transition-all duration-200 active:scale-[0.97]",
              value === option
                ? "bg-abyssal-primary text-white shadow-[0_2px_8px_rgba(94,92,230,0.35)]"
                : "bg-abyssal-surface-high/60 glass-subtle text-abyssal-text-secondary",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
