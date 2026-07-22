"use client"
import { FilterChip } from "@/components/shared/FilterChip"

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <FilterChip label="TODOS" selected={selected === "TODOS"} onClick={() => onSelect("TODOS")} />
      {categories.map((cat) => (
        <FilterChip key={cat} label={cat} selected={selected === cat} onClick={() => onSelect(cat)} />
      ))}
    </div>
  )
}
