"use client"
import { useState, useEffect, useRef } from "react"
import { SearchBar } from "@/components/shared/SearchBar"

interface ProductSearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function ProductSearchBar({ value: externalValue, onChange }: ProductSearchBarProps) {
  const [value, setValue] = useState(externalValue)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timerRef.current = setTimeout(() => onChange(value), 300)
    return () => clearTimeout(timerRef.current)
  }, [value])

  useEffect(() => { setValue(externalValue) }, [externalValue])

  return <SearchBar value={value} onChange={setValue} placeholder="Buscar productos..." />
}
