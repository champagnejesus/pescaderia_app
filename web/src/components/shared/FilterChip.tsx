import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-95",
        selected
          ? "bg-abyssal-primary text-white shadow-[0_2px_8px_rgba(94,92,230,0.3)]"
          : "bg-abyssal-surface-high/60 glass-subtle text-abyssal-text-secondary border border-abyssal-outline/30 hover:bg-abyssal-surface-highest/60"
      )}
    >
      {label}
    </button>
  )
}
