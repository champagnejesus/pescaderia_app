"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

import type { Category } from "@/lib/types"

export function useCategories() {
  const [data, setData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: categories } = await api.get<Category[]>("/categories")
      setData(categories)
    } catch {
      setError("Error al cargar categorías")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}