interface ClientStatsProps {
  totalClients: number
  debtClients: number
  frequentClients: number
}

export function ClientStats({ totalClients, debtClients, frequentClients }: ClientStatsProps) {
  const stats = [
    { label: "Clientes", value: totalClients, color: "text-abyssal-primary", bg: "bg-abyssal-primary/15" },
    { label: "Con Deuda", value: debtClients, color: "text-abyssal-red", bg: "bg-abyssal-red/15" },
    { label: "Frecuentes", value: frequentClients, color: "text-abyssal-green", bg: "bg-abyssal-green/15" },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="bg-abyssal-surface rounded-abyssal-md p-3 text-center">
          <p className={`text-title-large font-bold ${s.color}`}>{s.value}</p>
          <p className="text-label-small text-abyssal-text-secondary mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
