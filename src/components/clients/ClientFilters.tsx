"use client"
import { FilterChip } from "@/components/shared/FilterChip"

const FILTERS = ["Todos", "Con Deuda", "Al Corriente", "Excede Límite"]

interface ClientFiltersProps {
  selected: string
  onSelect: (s: string) => void
}

export function ClientFilters({ selected, onSelect }: ClientFiltersProps) {
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
