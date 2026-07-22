"use client"
import { useState, useEffect, useCallback } from "react"
import { ChevronDown, ChevronUp, Receipt, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { AccountDebtor, AccountEntry } from "@/lib/types"

export default function AccountsReceivablePage() {
  const [debtors, setDebtors] = useState<AccountDebtor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<AccountDebtor[]>("/accounts/receivable")
      setDebtors(data)
    } catch {
      setError("Error al cargar cuentas por cobrar")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    const existing = debtors.find((d) => d.id === id)
    if (existing && existing.entries.length === 0) {
      try {
        const { data } = await api.get<AccountEntry[]>(`/accounts/receivable/${id}/entries`)
        setDebtors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, entries: data } : d))
        )
      } catch {
        // silently fail
      }
    }
  }

  return (
    <>
      <TopBar title="Cuentas por Cobrar" />
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={48} className="text-abyssal-red mb-3" />
            <p className="text-body-medium text-abyssal-red">{error}</p>
          </div>
        ) : debtors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Receipt size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">No hay cuentas por cobrar</p>
            <p className="text-body-medium text-abyssal-text-secondary">Todos los clientes están al corriente</p>
          </div>
        ) : (
          debtors.map((debtor) => (
            <Card key={debtor.id} className="overflow-hidden">
              <button
                onClick={() => toggleExpand(debtor.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-abyssal-text-primary font-medium">{debtor.name}</p>
                  <p className="text-label-small text-abyssal-text-secondary mt-0.5">
                    Saldo pendiente: <span className="text-abyssal-red font-semibold">{formatCurrency(debtor.total_pending)}</span>
                  </p>
                </div>
                {expandedId === debtor.id ? (
                  <ChevronUp className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-2" />
                )}
              </button>

              <div
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  expandedId === debtor.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="border-t border-abyssal-outline/20 mx-4" />
                <div className="p-4 space-y-2">
                  {debtor.entries.length === 0 ? (
                    <p className="text-body-medium text-abyssal-text-secondary text-center py-2">
                      Cargando historial...
                    </p>
                  ) : (
                    debtor.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-abyssal-surface-high rounded-xl p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-abyssal-text-primary font-medium">
                            {entry.reference_number}
                          </p>
                          <p className="text-[11px] text-abyssal-text-secondary mt-0.5">
                            {formatDate(entry.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[13px] text-abyssal-text-primary font-semibold">
                            {formatCurrency(entry.amount)}
                          </span>
                          <StatusBadge status={entry.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
