"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp, DollarSign, AlertCircle, Search, Clock, ArrowRightFromLine, HandCoins } from "lucide-react"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PayDialog } from "@/components/cash-register/PayDialog"
import { ToastContainer, useToast } from "@/components/ui/ToastContainer"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { AccountDebtor, AccountEntry } from "@/lib/types"

function getDaysSince(date: string): number {
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / 86400000)
}

export default function AccountsPayablePage() {
  const [debtors, setDebtors] = useState<AccountDebtor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [payTarget, setPayTarget] = useState<AccountDebtor | null>(null)
  const { toasts, addToast, removeToast } = useToast()

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<AccountDebtor[]>("/accounts/payable")
      setDebtors(data)
    } catch {
      setError("Error al cargar cuentas por pagar")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handlePay = async (amount: number, method: string) => {
    if (!payTarget) return
    try {
      await api.post(`/accounts/payable/${payTarget.id}/pay`, { amount, method })
      addToast(`Pago de ${formatCurrency(amount)} registrado`, "success")
      fetch()
    } catch {
      addToast("Error al registrar el pago", "error")
    }
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    const existing = debtors.find((d) => d.id === id)
    if (existing && existing.entries.length === 0) {
      try {
        const { data } = await api.get<AccountEntry[]>(`/accounts/payable/${id}/entries`)
        setDebtors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, entries: data } : d))
        )
      } catch {
        // silently fail
      }
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return debtors
    const q = search.toLowerCase()
    return debtors.filter((d) => d.name.toLowerCase().includes(q))
  }, [debtors, search])

  const totalPending = debtors.reduce((s, d) => s + d.total_pending, 0)
  const totalCount = debtors.length

  return (
    <>
      <TopBar title="Cuentas por Pagar" />
      <div className="p-4 space-y-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-abyssal-red/12 flex items-center justify-center">
              <ArrowRightFromLine className="w-5 h-5 text-abyssal-red" />
            </div>
            <div>
              <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Total Pendiente</p>
              <p className="text-title-medium text-abyssal-text-primary font-bold">{formatCurrency(totalPending)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Acreedores</p>
            <p className="text-title-medium text-abyssal-text-primary font-bold">{totalCount}</p>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyssal-text-secondary" />
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-abyssal-surface-high text-[13px] text-abyssal-text-primary placeholder-abyssal-text-secondary outline-none border border-abyssal-outline/20 focus:border-abyssal-primary/40 transition-colors"
          />
        </div>

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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <DollarSign size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">
              {search ? "Sin resultados" : "No hay cuentas por pagar"}
            </p>
            <p className="text-body-medium text-abyssal-text-secondary">
              {search ? "Prueba con otro nombre" : "Todos los proveedores están al corriente"}
            </p>
          </div>
        ) : (
          filtered.map((debtor) => (
            <Card key={debtor.id} className="overflow-hidden">
              <button
                onClick={() => toggleExpand(debtor.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-abyssal-text-primary font-medium">{debtor.name}</p>
                  <p className="text-label-small text-abyssal-text-secondary mt-0.5">
                    Saldo pendiente: <span className="text-abyssal-red font-semibold">{formatCurrency(debtor.total_pending)}</span>
                    {debtor.entries.length > 0 && (
                      <span className="text-abyssal-text-secondary"> &middot; {debtor.entries.length} movimientos</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setPayTarget(debtor) }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyssal-red/12 text-abyssal-red text-[12px] font-semibold hover:bg-abyssal-red/20 transition-colors shrink-0 mr-1"
                >
                  <HandCoins className="w-4 h-4" />
                  Pagar
                </button>
                {expandedId === debtor.id ? (
                  <ChevronUp className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
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
                    debtor.entries.map((entry) => {
                      const days = getDaysSince(entry.date)
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between bg-abyssal-surface-high rounded-xl p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] text-abyssal-text-primary font-medium">
                              {entry.reference_number}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-abyssal-text-secondary">{formatDate(entry.date)}</span>
                              {entry.reference_type && (
                                <>
                                  <span className="text-[9px] text-abyssal-text-secondary">&middot;</span>
                                  <span className="text-[10px] text-abyssal-text-secondary uppercase">{entry.reference_type}</span>
                                </>
                              )}
                              {days > 0 && (
                                <>
                                  <span className="text-[9px] text-abyssal-text-secondary">&middot;</span>
                                  <span className={cn("text-[10px] flex items-center gap-0.5", days > 30 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
                                    <Clock className="w-3 h-3" />
                                    {days}d
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[13px] text-abyssal-text-primary font-semibold">
                              {formatCurrency(entry.pending_amount ?? entry.amount)}
                            </span>
                            <StatusBadge status={entry.status} />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <PayDialog
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        debtorName={payTarget?.name || ""}
        pendingAmount={payTarget?.total_pending || 0}
        type="payable"
        onPay={handlePay}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
