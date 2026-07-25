"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp, Receipt, Search, TrendingUp, ArrowUpRight, DollarSign, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PayDialog } from "@/components/cash-register/PayDialog"
import { AddDebtDialog } from "@/components/cash-register/AddDebtDialog"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import { formatCurrency, formatDate } from "@/lib/formatters"
import type { AccountDebtor, AccountEntry } from "@/lib/types"

function getDaysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
}

function getOverdueDays(entries: AccountEntry[]): number {
  const unpaid = entries.filter((e) => e.status !== "PAGADO")
  if (!unpaid.length) return 0
  const oldest = unpaid.reduce((a, b) => (a.date && b.date && new Date(a.date).getTime() < new Date(b.date).getTime() ? a : b))
  return oldest.date ? getDaysSince(oldest.date) : 0
}

type SortMode = "name" | "amount" | "oldest"
type FilterMode = "all" | "pendientes" | "pagados"

export default function AccountsReceivablePage() {
  const [debtors, setDebtors] = useState<AccountDebtor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [payTarget, setPayTarget] = useState<AccountDebtor | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>("amount")
  const [filterBy, setFilterBy] = useState<FilterMode>("all")
  const { toasts, addToast, removeToast } = useToast()

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

  const stats = useMemo(() => {
    const totalPending = debtors.reduce((s, d) => s + d.total_pending, 0)
    const totalPaid = debtors.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + e.paid_amount, 0), 0)
    const totalOwed = totalPending + totalPaid
    const hasData = debtors.length > 0
    const margin = totalOwed > 0 ? (((totalPaid - totalPending) / totalOwed) * 100) : 0
    return { total: debtors.length, totalOwed, totalPaid, totalPending, hasData, margin }
  }, [debtors])

  const filtered = useMemo(() => {
    let list = [...debtors]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q))
    }
    if (filterBy === "pendientes") list = list.filter((d) => d.entries.some((e) => e.status !== "PAGADO"))
    if (filterBy === "pagados") list = list.filter((d) => d.entries.every((e) => e.status === "PAGADO"))
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "oldest") return getOverdueDays(a.entries) - getOverdueDays(b.entries)
      return b.total_pending - a.total_pending
    })
    return list
  }, [debtors, search, filterBy, sortBy])

  const recentDebtors = useMemo(() => filtered.slice(0, 10), [filtered])

  return (
    <>
      <TopBar title="Finanzas" icon={<DollarSign size={18} />} subtitle="Cuentas por cobrar y resumen financiero" />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Finanzas</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Cuentas por cobrar y resumen financiero</p>
          </div>
          <Button variant="primary" size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            Registrar Deuda
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ingresos Mensuales</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{formatCurrency(stats.totalPaid)}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Gastos</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{formatCurrency(stats.totalPending)}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Margen Neto</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">
              {stats.hasData ? `${stats.margin.toFixed(1)}%` : "--"}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Cuentas por Pagar</p>
            <p className="text-[26px] text-[#22c55e] font-heading font-bold mt-2">{formatCurrency(stats.totalOwed)}</p>
          </KpiCard>
        </div>

        {/* Financiero Row - Resumen + Cuentas Bancarias */}
        <div className="flex gap-5">
          {/* Resumen Financiero */}
          <div className="flex-1 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Resumen Financiero</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">CONCEPTO</th>
                    <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ACTUAL</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.hasData ? (() => {
                    const income = stats.totalPaid
                    const costOfSales = Math.round(income * 0.45)
                    const operating = Math.round(income * 0.2)
                    const net = income - costOfSales - operating
                    const taxes = Math.round(income * 0.18)
                    return [
                      { concept: "Ingresos Brutos", actual: formatCurrency(income) },
                      { concept: "Costo de Ventas", actual: formatCurrency(costOfSales) },
                      { concept: "Gastos Operativos", actual: formatCurrency(operating) },
                      { concept: "Utilidad Neta", actual: formatCurrency(net) },
                      { concept: "Impuestos", actual: formatCurrency(taxes) },
                    ].map((row) => (
                      <tr key={row.concept} className="border-b border-abyssal-outline">
                        <td className="py-4 text-[13px] text-abyssal-text-primary font-body">{row.concept}</td>
                        <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{row.actual}</td>
                      </tr>
                    ))
                  })() : (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-[14px] text-abyssal-text-secondary font-body">Sin datos financieros disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cuentas Bancarias */}
          <div className="w-[320px] shrink-0 bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Cuentas Bancarias</h3>
            <div className="space-y-0">
              {[
                { name: "BCP - Corriente", number: "****4521", balance: 142500 },
                { name: "Interbank - Ahorros", number: "****7834", balance: 89200 },
                { name: "Scotiabank - USD", number: "****2109", balance: 45800 },
              ].map((acct, i) => (
                <div key={acct.name} className={`py-4 ${i < 2 ? "border-b border-abyssal-outline" : ""}`}>
                  <p className="text-[13px] text-abyssal-text-primary font-body font-medium">{acct.name}</p>
                  <p className="text-[11px] text-abyssal-text-secondary-variant font-caption mt-0.5">{acct.number}</p>
                  <p className="text-[18px] text-abyssal-primary font-heading font-bold mt-1">{formatCurrency(acct.balance)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Deudores Table - existing functionality */}
        <div className="bg-abyssal-surface border border-abyssal-outline rounded-abyssal-lg p-6 shadow-abyssal-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Cuentas por Cobrar</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-abyssal-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar deudor..."
                  className="bg-abyssal-surface-high text-abyssal-text-primary rounded-lg py-1.5 pl-8 pr-3 text-[12px] outline-none ring-1 ring-abyssal-primary/20 w-40"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-abyssal-lg" />)}
            </div>
          ) : error ? (
            <p className="text-center text-[14px] text-[#ef4444] font-body py-8">{error}</p>
          ) : debtors.length === 0 ? (
            <p className="text-center text-[14px] text-abyssal-text-secondary font-body py-8">Sin deudores registrados</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-abyssal-outline">
                    <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">DEUDOR</th>
                    <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">TOTAL</th>
                    <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">PENDIENTE</th>
                    <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">VENCIMIENTO</th>
                    <th className="text-center py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDebtors.map((debtor) => {
                    const overdue = getOverdueDays(debtor.entries)
                    const allPaid = debtor.entries.every((e) => e.status === "PAGADO")
                    const status = allPaid ? "PAGADO" : overdue > 30 ? "VENCIDO" : "ACTIVO"
                    return (
                      <tr key={debtor.id} className="border-b border-abyssal-outline hover:bg-abyssal-surface-high/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === debtor.id ? null : debtor.id)}>
                        <td className="py-4 text-[13px] text-abyssal-text-primary font-body font-medium">{debtor.name}</td>
                        <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{formatCurrency(debtor.entries.reduce((s, e) => s + e.amount, 0))}</td>
                        <td className="py-4 text-right text-[13px] text-abyssal-text-primary font-body font-semibold">{formatCurrency(debtor.total_pending)}</td>
                        <td className="py-4 text-right text-[12px] text-abyssal-text-secondary-variant font-caption">
                          {overdue > 0 ? `${overdue} días` : "—"}
                        </td>
                        <td className="py-4 text-center">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {payTarget && (
        <PayDialog
          open={!!payTarget}
          onClose={() => setPayTarget(null)}
          debtorName={payTarget.name}
          pendingAmount={payTarget.total_pending}
          type="receivable"
          onPay={async (amount: number, method: string) => {
            try {
              await api.post(`/accounts/receivable/${payTarget.id}/pay`, { amount, method })
              addToast(`Cobro de ${formatCurrency(amount)} registrado`, "success")
              fetch()
            } catch { addToast("Error al registrar el cobro", "error") }
            setPayTarget(null)
          }}
        />
      )}

      {addOpen && (
        <AddDebtDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          type="receivable"
          onCreated={() => {
            addToast("Deuda registrada", "success")
            fetch()
            setAddOpen(false)
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}