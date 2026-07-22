"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp, DollarSign, AlertCircle, Search, Clock, ArrowRightFromLine, HandCoins, Building2, AlertTriangle, Filter, ArrowUpDown, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PayDialog } from "@/components/cash-register/PayDialog"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { FilterChip } from "@/components/shared/FilterChip"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { AccountDebtor, AccountEntry } from "@/lib/types"

function getDaysSince(date: string): number {
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / 86400000)
}

function getOverdueDays(entries: AccountEntry[]): number {
  const unpaid = entries.filter((e) => e.status !== "PAGADO")
  if (unpaid.length === 0) return 0
  const oldest = unpaid.reduce((a, b) => (new Date(a.date) < new Date(b.date) ? a : b))
  return getDaysSince(oldest.date)
}

function getProgress(entries: AccountEntry[]): { paid: number; total: number } {
  const total = entries.reduce((s, e) => s + e.amount, 0)
  const paid = entries.reduce((s, e) => s + (e.amount - (e.pending_amount ?? e.amount)), 0)
  return { paid, total }
}

type SortMode = "name" | "amount" | "oldest"
type FilterMode = "all" | "pendientes" | "pagados"

export default function AccountsPayablePage() {
  const [debtors, setDebtors] = useState<AccountDebtor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [payTarget, setPayTarget] = useState<AccountDebtor | null>(null)
  const [sortBy, setSortBy] = useState<SortMode>("amount")
  const [filterBy, setFilterBy] = useState<FilterMode>("all")
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

  const processed = useMemo(() => {
    let result = debtors.map((d) => ({
      ...d,
      overdueDays: d.entries.length > 0 ? getOverdueDays(d.entries) : 0,
      progress: d.entries.length > 0 ? getProgress(d.entries) : { paid: 0, total: d.total_pending },
      isOverdue: d.entries.length > 0 && getOverdueDays(d.entries) > 7,
    }))

    if (filterBy === "pendientes") {
      result = result.filter((d) => d.total_pending > 0)
    } else if (filterBy === "pagados") {
      result = result.filter((d) => d.total_pending === 0)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((d) => d.name.toLowerCase().includes(q))
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "amount") {
      result.sort((a, b) => b.total_pending - a.total_pending)
    } else if (sortBy === "oldest") {
      result.sort((a, b) => b.overdueDays - a.overdueDays)
    }

    return result
  }, [debtors, search, sortBy, filterBy])

  const totalPending = debtors.reduce((s, d) => s + d.total_pending, 0)
  const overdueAmount = debtors
    .filter((d) => d.entries.length > 0 && getOverdueDays(d.entries) > 7)
    .reduce((s, d) => s + d.total_pending, 0)
  const totalCount = debtors.length

  return (
    <>
      <TopBar title="Cuentas por Pagar" />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Pendiente</p>
            <p className="text-[16px] text-abyssal-text-primary font-bold mt-0.5">{formatCurrency(totalPending)}</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Vencido</p>
            <p className={cn("text-[16px] font-bold mt-0.5", overdueAmount > 0 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
              {formatCurrency(overdueAmount)}
            </p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-[10px] text-abyssal-text-secondary uppercase tracking-wider font-medium">Proveedores</p>
            <p className="text-[16px] text-abyssal-text-primary font-bold mt-0.5">{totalCount}</p>
          </Card>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "pendientes", "pagados"] as const).map((f) => (
            <FilterChip
              key={f}
              label={f === "all" ? "Todos" : f === "pendientes" ? "Pendientes" : "Pagados"}
              selected={filterBy === f}
              onClick={() => setFilterBy(f)}
            />
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setSortBy(sortBy === "name" ? "amount" : sortBy === "amount" ? "oldest" : "name")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyssal-surface-high text-[11px] text-abyssal-text-secondary font-medium hover:text-abyssal-text-primary transition-colors shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === "name" ? "A-Z" : sortBy === "amount" ? "Monto" : "Antigüedad"}
          </button>
        </div>

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
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={48} className="text-abyssal-red mb-3" />
            <p className="text-body-medium text-abyssal-red">{error}</p>
          </div>
        ) : processed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 size={64} className="text-abyssal-text-secondary mb-3" strokeWidth={1} />
            <p className="text-title-medium text-abyssal-text-primary mb-2">
              {search ? "Sin resultados" : "No hay cuentas por pagar"}
            </p>
            <p className="text-body-medium text-abyssal-text-secondary">
              {search ? "Prueba con otro nombre" : "Todos los proveedores están al corriente"}
            </p>
          </div>
        ) : (
          processed.map((debtor) => {
            const progressPct = debtor.progress.total > 0
              ? Math.round((debtor.progress.paid / debtor.progress.total) * 100)
              : 0
            const isFullyPaid = debtor.total_pending === 0 && debtor.progress.total > 0

            return (
              <Card key={debtor.id} className="overflow-hidden">
                <button
                  onClick={() => toggleExpand(debtor.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] text-abyssal-text-primary font-medium">{debtor.name}</p>
                      {debtor.isOverdue && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-abyssal-red/12 text-[10px] font-semibold text-abyssal-red">
                          <AlertTriangle className="w-3 h-3" />
                          Vencido
                        </span>
                      )}
                      {isFullyPaid && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-abyssal-green/12 text-[10px] font-semibold text-abyssal-green">
                          <CheckCircle2 className="w-3 h-3" />
                          Pagado
                        </span>
                      )}
                    </div>
                    <p className="text-label-small text-abyssal-text-secondary mt-0.5 flex items-center gap-1.5">
                      <span className={cn("font-semibold", isFullyPaid ? "text-abyssal-green" : "text-abyssal-red")}>
                        {formatCurrency(debtor.total_pending)}
                      </span>
                      {debtor.entries.length > 0 && (
                        <>
                          <span className="text-abyssal-text-secondary">&middot;</span>
                          <span>{debtor.entries.length} movimientos</span>
                        </>
                      )}
                      {debtor.overdueDays > 0 && (
                        <>
                          <span className="text-abyssal-text-secondary">&middot;</span>
                          <span className={cn("flex items-center gap-0.5", debtor.overdueDays > 30 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
                            <Clock className="w-3 h-3" />
                            {debtor.overdueDays}d
                          </span>
                        </>
                      )}
                    </p>
                    {debtor.entries.length > 0 && (
                      <div className="mt-2 h-1.5 rounded-full bg-abyssal-surface-high overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", isFullyPaid ? "bg-abyssal-green" : "bg-abyssal-primary/30")}
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {!isFullyPaid && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPayTarget(debtor) }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyssal-red/12 text-abyssal-red text-[12px] font-semibold hover:bg-abyssal-red/20 transition-colors shrink-0 mr-1"
                    >
                      <HandCoins className="w-4 h-4" />
                      Pagar
                    </button>
                  )}
                  {expandedId === debtor.id ? (
                    <ChevronUp className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                  )}
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    expandedId === debtor.id ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
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
                        const paidAmount = entry.amount - (entry.pending_amount ?? entry.amount)
                        const isEntryPaid = entry.status === "PAGADO"
                        return (
                          <div
                            key={entry.id}
                            className={cn(
                              "flex items-center justify-between rounded-xl p-3 transition-colors",
                              isEntryPaid ? "bg-abyssal-green/5" : "bg-abyssal-surface-high"
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={cn("text-[13px] font-medium", isEntryPaid ? "text-abyssal-text-secondary" : "text-abyssal-text-primary")}>
                                  {entry.reference_number}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-abyssal-text-secondary">{formatDate(entry.date)}</span>
                                {entry.reference_type && (
                                  <>
                                    <span className="text-[9px] text-abyssal-text-secondary">&middot;</span>
                                    <span className="text-[10px] text-abyssal-text-secondary uppercase">{entry.reference_type}</span>
                                  </>
                                )}
                                {days > 0 && !isEntryPaid && (
                                  <>
                                    <span className="text-[9px] text-abyssal-text-secondary">&middot;</span>
                                    <span className={cn("text-[10px] flex items-center gap-0.5", days > 30 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
                                      <Clock className="w-3 h-3" />
                                      {days}d
                                    </span>
                                  </>
                                )}
                              </div>
                              {paidAmount > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[10px] text-abyssal-green font-medium">
                                    Pagado: {formatCurrency(paidAmount)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={cn("text-[13px] font-semibold", isEntryPaid ? "text-abyssal-text-secondary" : "text-abyssal-text-primary")}>
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
            )
          })
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
