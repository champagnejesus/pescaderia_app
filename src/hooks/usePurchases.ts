"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"
import type { Purchase } from "@/lib/types"

export function usePurchases(statusFilter?: string) {
  const [data, setData] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 }
      const { data: purchases } = await api.get<Purchase[]>("/purchases", { params })
      setData(purchases)
    } catch {
      setError("Error al cargar compras")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
