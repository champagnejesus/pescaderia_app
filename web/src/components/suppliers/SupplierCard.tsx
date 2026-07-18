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
      className="flex items-center gap-3 p-3.5 bg-abyssal-surface glass rounded-2xl w-full text-left transition-all duration-200 active:scale-[0.98]"
    >
      {supplier.image_url ? (
        <img src={supplier.image_url} alt={supplier.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-[17px] font-bold shrink-0">
          {initial}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-abyssal-text-primary font-medium truncate">
          {supplier.name}
        </p>
        <p className="text-[12px] text-abyssal-text-secondary mt-0.5">
          {supplier.category}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={supplier.status} />
        <p className="text-[15px] text-abyssal-red font-semibold">
          {formatCurrency(supplier.pending_payment)}
        </p>
      </div>
    </button>
  )
}
