interface DaySummaryCardProps {
  totalSales: number
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function DaySummaryCard({ totalSales }: DaySummaryCardProps) {
  return (
    <div className="bg-abyssal-surface border border-abyssal-outline/50 rounded-abyssal-md p-6 text-center">
      <p className="text-display-large font-bold text-abyssal-primary">{formatCurrency(totalSales)}</p>
      <p className="text-body-medium mt-1 text-abyssal-text-secondary">Total del Día</p>
    </div>
  )
}
