interface ClientStatsProps {
  totalClients: number
  totalBalance: number
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function ClientStats({ totalClients, totalBalance }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-abyssal-surface rounded-abyssal-md p-4 text-center">
        <p className="text-title-large text-abyssal-text-primary font-bold">
          {totalClients}
        </p>
        <p className="text-label-small text-abyssal-text-secondary">
          Total Clientes
        </p>
      </div>
      <div className="bg-abyssal-surface rounded-abyssal-md p-4 text-center">
        <p className="text-title-large text-abyssal-red font-bold">
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-label-small text-abyssal-text-secondary">
          Saldo Pendiente
        </p>
      </div>
    </div>
  )
}
