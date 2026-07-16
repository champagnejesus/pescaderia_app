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
      <p className="text-title-medium text-abyssal-text-primary mb-2">Método de Pago</p>
      <div className="flex gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "flex-1 py-3 px-4 rounded-abyssal-sm text-body-medium font-medium transition-colors",
              value === option
                ? "bg-abyssal-primary text-abyssal-on-primary"
                : "bg-abyssal-surface-high text-abyssal-text-secondary",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
