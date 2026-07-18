import { memo } from "react"
import { Banknote, CreditCard, ShoppingCart, Scale } from "lucide-react"
import type { DailySummary } from "@/lib/types"

interface CashBentoGridProps {
  data: DailySummary
}

function fmt(n: number) {
  return `$${Math.abs(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

const cells = [
  {
    key: "cash",
    label: "Efectivo",
    icon: Banknote,
    getValue: (d: DailySummary) => fmt(d.cash_total),
    color: "text-abyssal-green",
  },
  {
    key: "card",
    label: "Tarjeta",
    icon: CreditCard,
    getValue: (d: DailySummary) => fmt(d.card_total),
    color: "text-abyssal-primary",
  },
  {
    key: "expenses",
    label: "Gastos",
    icon: ShoppingCart,
    getValue: (d: DailySummary) => `-${fmt(d.total_expenses)}`,
    color: "text-abyssal-red",
  },
  {
    key: "diff",
    label: "Diferencia",
    icon: Scale,
    getValue: (d: DailySummary) => {
      const accounted = d.cash_total + d.card_total
      const diff = d.total_sales - accounted
      return `${diff >= 0 ? "+" : "-"}${fmt(diff)}`
    },
    color: "text-abyssal-text-primary",
  },
]

function CashBentoGridComponent({ data }: CashBentoGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map((cell) => (
        <div key={cell.key} className="bg-abyssal-surface glass rounded-2xl p-4 contain-render">
          <div className="flex items-center gap-2 mb-2">
            <cell.icon className={`w-[18px] h-[18px] ${cell.color}`} />
            <span className="text-[12px] text-abyssal-text-secondary font-medium">{cell.label}</span>
          </div>
          <p className={`text-[17px] font-semibold ${cell.color}`}>
            {cell.getValue(data)}
          </p>
        </div>
      ))}
    </div>
  )
}

export const CashBentoGrid = memo(CashBentoGridComponent)
