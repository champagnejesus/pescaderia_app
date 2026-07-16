"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface Order {
  id: number
  order_number: string
  client_id: number
  client_name: string
  delivery_date: string
  items_count: number
  status: string
  total_value: number
  created_at: string
}

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
