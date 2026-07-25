"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"
import { Order } from "@/lib/types"

export type { Order }

export function useOrders(statusFilter?: string) {
  const [data, setData] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 }
      const { data: orders } = await api.get<Order[]>("/orders", { params })
      setData(orders)
    } catch {
      setError("Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
