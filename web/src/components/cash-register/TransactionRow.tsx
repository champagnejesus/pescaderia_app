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
    <div className="flex items-center gap-3 p-3.5 bg-abyssal-surface glass rounded-2xl border border-abyssal-outline/20">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? "bg-abyssal-green/12" : "bg-abyssal-red/12"}`}>
        <Icon className={`w-5 h-5 ${amountColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
          {transaction.title}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5">{transaction.time}</p>
      </div>
      <p className={`text-[15px] font-semibold shrink-0 ${amountColor}`}>
        {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
      </p>
    </div>
  )
}
