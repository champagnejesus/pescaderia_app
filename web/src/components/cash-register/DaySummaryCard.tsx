import { memo } from "react"

interface DaySummaryCardProps {
  totalSales: number
  netTotal: number
  transactionCount: number
}

function DaySummaryCardComponent({ totalSales, netTotal, transactionCount }: DaySummaryCardProps) {
  return (
    <div className="bg-abyssal-surface glass rounded-3xl p-6 text-center contain-render">
      <p className="text-[34px] font-bold text-abyssal-primary tracking-[-0.5px]">
        ${totalSales.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[13px] mt-1 text-abyssal-text-secondary font-medium">Total del Día</p>
      <div className="flex items-center justify-center gap-4 mt-3">
        <span className="text-[12px] text-abyssal-green font-medium">
          Neto: ${netTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-[12px] text-abyssal-text-secondary">
          {transactionCount} transacciones
        </span>
      </div>
    </div>
  )
}

export const DaySummaryCard = memo(DaySummaryCardComponent)
