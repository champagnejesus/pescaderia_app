"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface DailySummary {
  total_sales: number
  total_expenses: number
  net_total: number
  cash_total: number
  card_total: number
  transaction_count: number
}

export function useTransactions() {
  const [data, setData] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data: summary } = await api.get<DailySummary>("/transactions/daily-summary")
      setData(summary)
    } catch {
      setError("Error al cargar transacciones")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}
