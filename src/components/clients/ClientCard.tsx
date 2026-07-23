import { memo } from "react"
import { cn } from "@/lib/utils"

interface ClientCardClient {
  id: number
  name: string
  initials: string
  phone: string
  email: string
  outstanding_balance: number
  credit_limit: number
}

interface ClientCardProps {
  client: ClientCardClient
  onPress: (id: number) => void
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function getBalanceColor(balance: number, limit: number) {
  if (balance <= 0) return "bg-abyssal-green"
  if (balance >= limit) return "bg-abyssal-red"
  if (balance > limit * 0.5) return "bg-abyssal-yellow"
  return "bg-abyssal-green"
}

function getCreditBarWidth(balance: number, limit: number) {
  if (limit <= 0) return 0
  return Math.min((balance / limit) * 100, 100)
}

function ClientCardComponent({ client, onPress }: ClientCardProps) {
  const initial = client.name.charAt(0).toUpperCase()
  const balanceColor = getBalanceColor(client.outstanding_balance, client.credit_limit)
  const creditPct = getCreditBarWidth(client.outstanding_balance, client.credit_limit)

  return (
    <button
      onClick={() => onPress(client.id)}
      className="flex items-center gap-3 p-3.5 bg-abyssal-surface glass rounded-2xl w-full text-left transition-all duration-200 active:scale-[0.98] contain-render"
    >
      <div className="w-12 h-12 rounded-xl bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-[17px] font-bold shrink-0 relative">
        {initial}
        <span className={cn(
          "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-abyssal-surface",
          balanceColor
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
            {client.name}
          </p>
          {client.outstanding_balance > 0 && (
            <p className="text-[13px] text-abyssal-red font-semibold ml-2 shrink-0">
              {formatCurrency(client.outstanding_balance)}
            </p>
          )}
        </div>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5 truncate">
          {client.phone}
        </p>
        {client.credit_limit > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-abyssal-surface-high rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", balanceColor)}
                style={{ width: `${creditPct}%` }}
              />
            </div>
            <span className="text-[10px] text-abyssal-text-secondary shrink-0">
              {creditPct.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </button>
  )
}

export const ClientCard = memo(ClientCardComponent)
