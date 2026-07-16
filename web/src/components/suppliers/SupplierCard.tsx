import { StatusBadge } from "@/components/shared/StatusBadge"

interface SupplierCardSupplier {
  id: number
  name: string
  category: string
  pending_payment: number
  status: string
  image_url: string
}

interface SupplierCardProps {
  supplier: SupplierCardSupplier
  onPress: (id: number) => void
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

export function SupplierCard({ supplier, onPress }: SupplierCardProps) {
  const initial = supplier.name.charAt(0).toUpperCase()

  return (
    <button
      onClick={() => onPress(supplier.id)}
      className="flex items-center gap-3 p-3 bg-abyssal-surface rounded-abyssal-sm w-full text-left transition-colors hover:bg-abyssal-surface-high"
    >
      {supplier.image_url ? (
        <img src={supplier.image_url} alt={supplier.name} className="w-12 h-12 rounded-abyssal-sm object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-abyssal-sm bg-abyssal-primary-light flex items-center justify-center text-abyssal-primary text-title-medium font-bold shrink-0">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body-medium text-abyssal-text-primary font-medium truncate">
          {supplier.name}
        </p>
        <p className="text-label-small text-abyssal-text-secondary">
          {supplier.category}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={supplier.status} />
        <p className="text-body-medium text-abyssal-red font-semibold">
          {formatCurrency(supplier.pending_payment)}
        </p>
      </div>
    </button>
  )
}
