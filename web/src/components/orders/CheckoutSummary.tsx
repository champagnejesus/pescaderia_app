"use client"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface CheckoutItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
}

interface CheckoutSummaryProps {
  items: CheckoutItem[]
  paymentMethod: string
  onSubmit: () => void
  loading: boolean
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function CheckoutSummary({ items, paymentMethod, onSubmit, loading }: CheckoutSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax = subtotal * 0.10
  const total = subtotal + tax

  return (
    <div className="bg-abyssal-surface rounded-abyssal-sm p-4 space-y-3">
      <p className="text-title-medium text-abyssal-text-primary">Resumen</p>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center justify-between text-body-medium">
            <span className="text-abyssal-text-primary truncate flex-1">
              {item.product_name}
            </span>
            <span className="text-abyssal-text-secondary mx-2 shrink-0">
              {item.quantity} × {formatCurrency(item.unit_price)}
            </span>
            <span className="text-abyssal-text-primary font-semibold shrink-0 min-w-[64px] text-right">
              {formatCurrency(item.quantity * item.unit_price)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-abyssal-outline pt-2 space-y-1">
        <div className="flex justify-between text-body-medium">
          <span className="text-abyssal-text-secondary">Subtotal</span>
          <span className="text-abyssal-text-primary">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-body-medium">
          <span className="text-abyssal-text-secondary">IVA (10%)</span>
          <span className="text-abyssal-text-primary">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-title-medium pt-1 border-t border-abyssal-outline">
          <span className="text-abyssal-text-primary">Total</span>
          <span className="text-abyssal-text-primary font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <StatusBadge status={paymentMethod} />
        <Button onClick={onSubmit} disabled={loading || items.length === 0} size="md">
          {loading ? "Creando..." : "Realizar Pedido"}
        </Button>
      </div>
    </div>
  )
}
