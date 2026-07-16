interface DaySummaryCardProps {
  totalSales: number
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function DaySummaryCard({ totalSales }: DaySummaryCardProps) {
  return (
    <div className="bg-abyssal-primary text-abyssal-on-primary rounded-abyssal-md p-6 text-center">
      <p className="text-display-large font-bold">{formatCurrency(totalSales)}</p>
      <p className="text-body-medium mt-1 opacity-80">Total del Día</p>
    </div>
  )
}
