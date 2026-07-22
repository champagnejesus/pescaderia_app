interface ClientStatsProps {
  totalClients: number
}

export function ClientStats({ totalClients }: ClientStatsProps) {
  return (
    <div className="bg-abyssal-surface rounded-abyssal-md p-4 text-center">
      <p className="text-title-large text-abyssal-text-primary font-bold">
        {totalClients}
      </p>
      <p className="text-label-small text-abyssal-text-secondary">
        Total Clientes
      </p>
    </div>
  )
}
