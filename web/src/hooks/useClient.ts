"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface ClientDetail {
  id: number
  name: string
  phone: string
  email: string
  address: string
  outstanding_balance: number
  credit_limit: number
  initials: string
}

export function useClient(id: string | null) {
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchClient = useCallback(async () => {
    if (!id) {
      setClient(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<ClientDetail>(`/clients/${id}`)
      setClient(data)
    } catch {
      setError("Error al cargar cliente")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchClient() }, [fetchClient])

  return { client, loading, error, refetch: fetchClient }
}
