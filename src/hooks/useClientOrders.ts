"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface ClientOrder {
  id: number
  order_number: string
  delivery_date: string | null
  items_count: number
  status: string
  total_value: number
  created_at: string | null
}

export function useClientOrders(clientId: string | null, limit: number = 5) {
  const [orders, setOrders] = useState<ClientOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchOrders = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<{ orders: ClientOrder[]; count: number }>(
        `/clients/${clientId}/orders`,
        { params: { limit } }
      )
      setOrders(data.orders)
    } catch {
      setError("Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [clientId, limit])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}
