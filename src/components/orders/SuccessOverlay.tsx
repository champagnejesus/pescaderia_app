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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center px-6">
      <div className="bg-abyssal-surface glass rounded-3xl p-8 flex flex-col items-center max-w-sm w-full">
        <div className="w-20 h-20 rounded-full bg-abyssal-green/15 flex items-center justify-center mb-5">
          <Check className="w-10 h-10 text-abyssal-green" />
        </div>
        <h2 className="text-[22px] font-semibold text-abyssal-text-primary mb-1">¡Pedido Creado!</h2>
        <p className="text-[15px] text-abyssal-text-secondary">
          Pedido #{order?.order_number}
        </p>
        <div className="flex gap-3 mt-6 w-full">
          <Button variant="primary" onClick={onView} className="flex-1">
            Ver Pedido
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
}
