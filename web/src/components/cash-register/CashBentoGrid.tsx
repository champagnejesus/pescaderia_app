import { Banknote, CreditCard, ShoppingCart, Wallet } from "lucide-react"

interface DailySummaryResponse {
  total_sales: number
  total_expenses: number
  net_total: number
  cash_total: number
  card_total: number
  transaction_count: number
}

interface CashBentoGridProps {
  data: DailySummaryResponse
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

const cells = [
  { key: "cash", label: "Efectivo", icon: Banknote, color: "text-abyssal-green" },
  { key: "card", label: "Tarjeta", icon: CreditCard, color: "text-abyssal-primary" },
  { key: "expenses", label: "Gastos", icon: ShoppingCart, color: "text-abyssal-red" },
  { key: "net", label: "Balance Neto", icon: Wallet, color: "text-abyssal-text-primary" },
]

export function CashBentoGrid({ data }: CashBentoGridProps) {
  const values: Record<string, number> = {
    cash: data.cash_total,
    card: data.card_total,
    expenses: data.total_expenses,
    net: data.net_total,
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cells.map((cell) => (
        <div key={cell.key} className="bg-abyssal-surface glass rounded-2xl border border-abyssal-outline/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <cell.icon className={`w-[18px] h-[18px] ${cell.color}`} />
            <span className="text-[12px] text-abyssal-text-secondary font-medium">{cell.label}</span>
          </div>
          <p className={`text-[17px] font-semibold ${cell.color}`}>
            {formatCurrency(values[cell.key])}
          </p>
        </div>
      ))}
    </div>
  )
}
