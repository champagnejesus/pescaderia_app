"use client"
import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"

interface CollapsibleSearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function CollapsibleSearchBar({ value, onChange, placeholder = "Buscar..." }: CollapsibleSearchBarProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (!value) setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [value])

  function handleClear() {
    onChange("")
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="flex items-center justify-end">
      {open ? (
        <div className="relative w-full animate-fade-in">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-abyssal-text-secondary/60" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-abyssal-surface-high/80 backdrop-blur-sm rounded-2xl px-4 py-3 pl-11 pr-11 text-[15px] text-black outline-none border border-abyssal-outline/30 focus:border-abyssal-primary/50 focus:ring-4 focus:ring-abyssal-primary/10 placeholder:text-gray-400 transition-all duration-200"
          />
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-abyssal-surface-high transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4 text-abyssal-text-secondary/60" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full hover:bg-abyssal-surface-high transition-colors active:scale-95"
          aria-label="Abrir búsqueda"
        >
          <Search className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
      )}
    </div>
  )
}
