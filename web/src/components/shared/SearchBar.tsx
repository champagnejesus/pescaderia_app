import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Buscar...", className }: SearchBarProps) {
  return (
    <div className={cn("relative group", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-abyssal-text-secondary/60 group-focus-within:text-abyssal-primary transition-colors duration-200" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/70 dark:bg-abyssal-surface-high/80 backdrop-blur-sm rounded-2xl px-4 py-3.5 pl-11 pr-11 text-[15px] text-abyssal-text-primary outline-none border border-abyssal-outline/30 focus:border-abyssal-primary/50 focus:ring-4 focus:ring-abyssal-primary/10 placeholder:text-abyssal-text-secondary/60 transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-abyssal-surface-high transition-colors"
        >
          <X className="w-4 h-4 text-abyssal-text-secondary/60" />
        </button>
      )}
    </div>
  )
}
