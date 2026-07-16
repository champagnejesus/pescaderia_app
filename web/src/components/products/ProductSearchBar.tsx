"use client"
import { useState, useEffect } from "react"
import { SearchBar } from "@/components/shared/SearchBar"

interface ProductSearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function ProductSearchBar({ value: externalValue, onChange }: ProductSearchBarProps) {
  const [value, setValue] = useState(externalValue)

  useEffect(() => {
    const timer = setTimeout(() => onChange(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  useEffect(() => { setValue(externalValue) }, [externalValue])

  return <SearchBar value={value} onChange={setValue} placeholder="Buscar productos..." />
}
