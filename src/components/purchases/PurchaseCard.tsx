"use client"
import { memo } from "react"
import { StatusBadge } from "@/components/shared/StatusBadge"

interface PurchaseCardPurchase {
  id: number
  purchase_number: string
  supplier_name: string
  total_value: number
  payment_status: string
  created_at: string
}

interface PurchaseCardProps {
  purchase: PurchaseCardPurchase
  onPress: (id: number) => void
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  } catch {
    return dateStr
  }
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function PurchaseCardComponent({ purchase, onPress }: PurchaseCardProps) {
  return (
    <button
      onClick={() => onPress(purchase.id)}
      className="bg-abyssal-surface glass rounded-2xl p-3.5 flex items-center justify-between w-full text-left transition-all duration-200 active:scale-[0.98] contain-render"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
          {purchase.supplier_name}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5">
          #{purchase.purchase_number} · {formatDate(purchase.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={purchase.payment_status} />
        <span className="text-[15px] text-abyssal-text-primary font-semibold">
          {formatCurrency(purchase.total_value)}
        </span>
      </div>
    </button>
  )
}

export const PurchaseCard = memo(PurchaseCardComponent)
