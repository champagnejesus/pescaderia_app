import { formatCurrency } from "@/lib/formatters"

interface ClientStatsProps {
  totalClients: number
  totalBalance: number
}

export function ClientStats({ totalClients, totalBalance }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-abyssal-surface glass rounded-2xl p-4 text-center">
        <p className="text-[20px] font-semibold text-abyssal-text-primary">
          {totalClients}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5 font-medium">
          Total Clientes
        </p>
      </div>
      <div className="bg-abyssal-surface glass rounded-2xl p-4 text-center">
        <p className="text-[20px] font-semibold text-abyssal-red">
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5 font-medium">
          Saldo Pendiente
        </p>
      </div>
    </div>
  )
}
