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
      className="flex items-center gap-3 p-3 bg-abyssal-surface rounded-abyssal-sm w-full text-left transition-colors hover:bg-abyssal-surface-high"
    >
      <div className="w-10 h-10 rounded-full bg-abyssal-primary-light flex items-center justify-center text-abyssal-primary text-label-large font-bold shrink-0">
        {client.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">
          {client.name}
        </p>
        <p className="text-label-small text-abyssal-text-secondary truncate">
          {client.phone}
        </p>
      </div>
      <p className={`text-body-medium font-semibold shrink-0 ${balanceColor}`}>
        {formatCurrency(client.outstanding_balance)}
      </p>
    </button>
  )
}
