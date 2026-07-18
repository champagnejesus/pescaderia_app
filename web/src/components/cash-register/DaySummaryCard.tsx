interface DaySummaryCardProps {
  totalSales: number
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function DaySummaryCard({ totalSales }: DaySummaryCardProps) {
  return (
    <div className="bg-abyssal-surface glass rounded-3xl p-6 text-center">
      <p className="text-[34px] font-bold text-abyssal-primary tracking-[-0.5px]">{formatCurrency(totalSales)}</p>
      <p className="text-[13px] mt-1 text-abyssal-text-secondary font-medium">Total del Día</p>
    </div>
  )
}
