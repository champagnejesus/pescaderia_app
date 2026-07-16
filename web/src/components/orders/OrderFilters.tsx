"use client"
import { FilterChip } from "@/components/shared/FilterChip"

const FILTERS = ["Todos", "Pendientes", "Entregados", "Anulados"]

interface OrderFiltersProps {
  selected: string
  onSelect: (s: string) => void
}

export function OrderFilters({ selected, onSelect }: OrderFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((label) => (
        <FilterChip
          key={label}
          label={label}
          selected={selected === label}
          onClick={() => onSelect(label)}
        />
      ))}
    </div>
  )
}
