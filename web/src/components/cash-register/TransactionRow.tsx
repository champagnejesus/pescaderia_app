import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

interface TransactionRowTransaction {
  id: number
  title: string
  time: string
  type: string
  amount: number
  status: string
}

interface TransactionRowProps {
  transaction: TransactionRowTransaction
}

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.amount > 0
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle
  const amountColor = isIncome ? "text-abyssal-green" : "text-abyssal-red"

  return (
    <div className="flex items-center gap-3 p-3 bg-abyssal-surface rounded-abyssal-sm">
      <Icon className={`w-5 h-5 shrink-0 ${amountColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">
          {transaction.title}
        </p>
        <p className="text-label-small text-abyssal-text-secondary">{transaction.time}</p>
      </div>
      <p className={`text-body-medium font-semibold shrink-0 ${amountColor}`}>
        {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
      </p>
    </div>
  )
}
