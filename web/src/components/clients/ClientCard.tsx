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

export function ClientCard({ client, onPress }: ClientCardProps) {
  const balanceColor =
    client.outstanding_balance > 0 ? "text-abyssal-red" : "text-abyssal-green"

  return (
    <button
      onClick={() => onPress(client.id)}
      className="flex items-center gap-3 p-3.5 bg-abyssal-surface glass rounded-2xl w-full text-left transition-all duration-200 active:scale-[0.98]"
    >
      <div className="w-11 h-11 rounded-full bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary font-semibold text-[15px] shrink-0">
        {client.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
          {client.name}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5 truncate">
          {client.phone}
        </p>
      </div>
      <p className={`text-[15px] font-semibold shrink-0 ${balanceColor}`}>
        {formatCurrency(client.outstanding_balance)}
      </p>
    </button>
  )
}
