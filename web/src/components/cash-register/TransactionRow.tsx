import { ArrowUpCircle, ArrowDownCircle, Banknote, CreditCard, Truck } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface TransactionRowProps {
  transaction: Transaction
}

const typeIcons: Record<string, typeof Banknote> = {
  Efectivo: Banknote,
  Tarjeta: CreditCard,
  Transfer: Truck,
  Transferencia: Truck,
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.amount > 0
  const isExpense = transaction.amount < 0
  const iconColor = isIncome ? "text-abyssal-green" : "text-abyssal-red"
  const bgColor = isIncome ? "bg-abyssal-green/12" : "bg-abyssal-red/12"
  const TypeIcon = typeIcons[transaction.type]
  const Icon = isExpense ? ArrowDownCircle : TypeIcon || ArrowUpCircle

  return (
    <div className="flex items-center gap-3 p-3.5 bg-abyssal-surface glass rounded-2xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
          {transaction.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[12px] text-abyssal-text-secondary">{transaction.time}</span>
          <span className="text-[10px] text-abyssal-text-secondary">•</span>
          <span className="text-[12px] text-abyssal-text-secondary">{transaction.type}</span>
          {transaction.status && (
            <>
              <span className="text-[10px] text-abyssal-text-secondary">•</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${transaction.status === "PAGADO" ? "text-abyssal-green" : "text-abyssal-red"}`}>
                {transaction.status}
              </span>
            </>
          )}
        </div>
      </div>
      <p className={`text-[15px] font-semibold shrink-0 ${iconColor}`}>
        {isIncome ? "+" : "-"}${Math.abs(transaction.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}
