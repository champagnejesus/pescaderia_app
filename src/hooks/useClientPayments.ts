"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"
import type { AccountEntry } from "@/lib/types"

export function useClientPayments(clientId: string | number | null) {
  const [entries, setEntries] = useState<AccountEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchEntries = useCallback(async () => {
    if (!clientId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<AccountEntry[]>(`/accounts/receivable/${clientId}/entries`)
      setEntries(data)
    } catch {
      setError("Error al cargar historial de pagos")
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  return { entries, loading, error, refetch: fetchEntries }
}
