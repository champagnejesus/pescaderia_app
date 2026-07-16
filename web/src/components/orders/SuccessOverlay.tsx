"use client"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessOrder {
  order_number: string
}

interface SuccessOverlayProps {
  open: boolean
  order: SuccessOrder | null
  onView: () => void
  onClose: () => void
}

export function SuccessOverlay({ open, order, onView, onClose }: SuccessOverlayProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-abyssal-bg flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-abyssal-green-bg flex items-center justify-center mb-6 animate-bounce">
        <Check className="w-10 h-10 text-abyssal-green" />
      </div>
      <h2 className="text-headline-medium text-abyssal-text-primary font-bold mb-2">¡Pedido Creado!</h2>
      <p className="text-body-medium text-abyssal-text-secondary mb-2">
        Pedido #{order?.order_number}
      </p>
      <div className="flex gap-3 mt-6">
        <Button variant="primary" onClick={onView}>
          Ver Pedido
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Volver
        </Button>
      </div>
    </div>
  )
}
