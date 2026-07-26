"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  CaretDown, CaretUp, MagnifyingGlass, TrendUp, ArrowUpRight,
  CurrencyDollar, Plus, X, Building, Users, Wallet, Clock,
  ArrowsDownUp, CheckCircle, WarningCircle, Warning, HandCoins
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { TopBar } from "@/components/layout/TopBar"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PayDialog } from "@/components/cash-register/PayDialog"
import { AddDebtDialog } from "@/components/cash-register/AddDebtDialog"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { FilterChip } from "@/components/shared/FilterChip"
import { useToast } from "@/hooks/useToast"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { cn } from "@/lib/utils"
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

function getProgress(entries: AccountEntry[]): { paid: number; total: number } {
  const total = entries.reduce((s, e) => s + e.amount, 0)
  const paid = entries.reduce((s, e) => s + (e.amount - (e.pending_amount ?? e.amount)), 0)
  return { paid, total }
}

type SortMode = "name" | "amount" | "oldest"
type FilterMode = "all" | "pendientes" | "pagados"
type ActiveTab = "resumen" | "cobrar" | "pagar"

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("resumen")
  const [receivables, setReceivables] = useState<AccountDebtor[]>([])
  const [payables, setPayables] = useState<AccountDebtor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Shared state for dialogs and searching
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortMode>("amount")
  const [filterBy, setFilterBy] = useState<FilterMode>("all")

  // Dialog controls
  const [payTarget, setPayTarget] = useState<{ debtor: AccountDebtor; type: "receivable" | "payable" } | null>(null)
  const [addOpen, setAddOpen] = useState<{ type: "receivable" | "payable" } | null>(null)

  const { toasts, addToast, removeToast } = useToast()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [recRes, payRes] = await Promise.all([
        api.get<AccountDebtor[]>("/accounts/receivable"),
        api.get<AccountDebtor[]>("/accounts/payable")
      ])
      setReceivables(recRes.data)
      setPayables(payRes.data)
    } catch (e) {
      setError("Error al cargar los datos financieros")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Expansion loading details
  const toggleExpand = async (id: number, type: "receivable" | "payable") => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    const list = type === "receivable" ? receivables : payables
    const setter = type === "receivable" ? setReceivables : setPayables
    const existing = list.find((d) => d.id === id)
    if (existing && existing.entries.length === 0) {
      try {
        const { data } = await api.get<AccountEntry[]>(`/accounts/${type}/${id}/entries`)
        setter((prev) =>
          prev.map((d) => (d.id === id ? { ...d, entries: data } : d))
        )
      } catch {
        // fail silently
      }
    }
  }

  // Payments registration handlers
  const handlePayment = async (amount: number, method: string) => {
    if (!payTarget) return
    const { debtor, type } = payTarget
    try {
      await api.post(`/accounts/${type}/${debtor.id}/pay`, { amount, method })
      const actionStr = type === "receivable" ? "Cobro" : "Pago"
      addToast(`${actionStr} de ${formatCurrency(amount)} registrado`, "success")
      fetchAll()
    } catch {
      addToast("Error al registrar la transacción", "error")
    }
    setPayTarget(null)
  }

  // Global KPIs consolidator
  const stats = useMemo(() => {
    const totalPendingReceivable = receivables.reduce((s, d) => s + d.total_pending, 0)
    const totalPaidReceivable = receivables.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + e.paid_amount, 0), 0)

    const totalPendingPayable = payables.reduce((s, d) => s + d.total_pending, 0)
    const totalPaidPayable = payables.reduce((s, d) => s + d.entries.reduce((ss, e) => ss + (e.amount - (e.pending_amount ?? e.amount)), 0), 0)

    const flowBalance = totalPaidReceivable - totalPaidPayable
    const margin = (totalPaidReceivable + totalPendingReceivable) > 0 
      ? ((totalPaidReceivable / (totalPaidReceivable + totalPendingReceivable)) * 100)
      : 0

    return {
      totalPendingReceivable,
      totalPaidReceivable,
      totalPendingPayable,
      totalPaidPayable,
      flowBalance,
      margin
    }
  }, [receivables, payables])

  // Funnel & Sort for Client Debtors (Cuentas por Cobrar)
  const filteredReceivables = useMemo(() => {
    let result = receivables.map((d) => ({
      ...d,
      overdueDays: d.entries.length > 0 ? getOverdueDays(d.entries) : 0,
      progress: d.entries.length > 0 ? getProgress(d.entries) : { paid: 0, total: d.total_pending },
      isOverdue: d.entries.length > 0 && getOverdueDays(d.entries) > 30,
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

    return result;
  }, [receivables, search, sortBy, filterBy])

  // Funnel & Sort for Supplier Debtors (Cuentas por Pagar)
  const filteredPayables = useMemo(() => {
    let result = payables.map((d) => ({
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

    return result;
  }, [payables, search, sortBy, filterBy])

  return (
    <>
      <TopBar title="Finanzas" icon={<CurrencyDollar size={18} />} subtitle="Resumen financiero y gestión de deudas" />
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] text-abyssal-text-primary font-heading font-semibold">Finanzas</h1>
            <p className="text-[14px] text-abyssal-text-secondary-variant font-body">Resumen financiero y gestión de deudas</p>
          </div>
          {activeTab !== "resumen" && (
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => setAddOpen({ type: activeTab === "cobrar" ? "receivable" : "payable" })}
            >
              <Plus size={16} />
              Registrar {activeTab === "cobrar" ? "Deuda" : "Obligación"}
            </Button>
          )}
        </div>

        {/* KPIs Consolidados */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Flujo de Caja Neto</p>
            <p className={cn("text-[26px] font-heading font-bold mt-2", stats.flowBalance >= 0 ? "text-abyssal-text-primary" : "text-abyssal-red")}>
              {formatCurrency(stats.flowBalance)}
            </p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Ingresos Cobrados</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{formatCurrency(stats.totalPaidReceivable)}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Por Cobrar (Clientes)</p>
            <p className="text-[26px] text-abyssal-text-primary font-heading font-bold mt-2">{formatCurrency(stats.totalPendingReceivable)}</p>
          </KpiCard>
          <KpiCard>
            <p className="text-[13px] text-abyssal-text-secondary font-body font-medium">Por Pagar (Proveedores)</p>
            <p className="text-[26px] text-[#ef4444] font-heading font-bold mt-2">{formatCurrency(stats.totalPendingPayable)}</p>
          </KpiCard>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800">
          {[
            { id: "resumen", label: "Resumen", icon: <Wallet size={16} /> },
            { id: "cobrar", label: "Cuentas por Cobrar", icon: <Users size={16} /> },
            { id: "pagar", label: "Cuentas por Pagar", icon: <Building size={16} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ActiveTab)
                  setSearch("")
                  setFilterBy("all")
                  setExpandedId(null)
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all duration-200",
                  isActive
                    ? "border-abyssal-primary text-abyssal-primary bg-abyssal-primary/5"
                    : "border-transparent text-abyssal-text-secondary hover:text-abyssal-text-primary hover:bg-abyssal-surface-high/50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Contenido según pestaña */}
        {activeTab === "resumen" && (
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Resumen Financiero */}
            <div className="flex-1 bg-abyssal-surface border border-slate-800 rounded-abyssal-lg p-6 shadow-abyssal-lg">
              <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold mb-5">Resumen Financiero</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">CONCEPTO</th>
                      <th className="text-right py-3 text-[10px] text-abyssal-text-secondary-variant font-caption font-semibold tracking-wider uppercase">MONTO ACTUAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.totalPaidReceivable > 0 || stats.totalPaidPayable > 0 ? (() => {
                      const income = stats.totalPaidReceivable
                      const costOfSales = Math.round(income * 0.45)
                      const operating = stats.totalPaidPayable
                      const net = income - costOfSales - operating
                      const taxes = Math.round(income * 0.18)
                      return [
                        { concept: "Ingresos Brutos (Cobrados)", actual: formatCurrency(income) },
                        { concept: "Costo de Ventas (Estimado)", actual: formatCurrency(costOfSales) },
                        { concept: "Egresos a Proveedores (Pagados)", actual: formatCurrency(operating) },
                        { concept: "Utilidad Neta del Flujo", actual: formatCurrency(net) },
                        { concept: "Impuestos (Estimados)", actual: formatCurrency(taxes) },
                      ].map((row) => (
                        <tr key={row.concept} className="border-b border-slate-800">
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

            {/* Distribución de Ingresos (Métodos de pago) */}
            <div className="w-full lg:w-[320px] shrink-0 bg-abyssal-surface border border-slate-800 rounded-abyssal-lg p-6 shadow-abyssal-lg flex flex-col justify-between">
              <div>
                <h3 className="text-[16px] text-abyssal-text-primary font-heading font-semibold">Distribución de Ingresos</h3>
                <p className="text-[12px] text-abyssal-text-secondary-variant font-caption mt-0.5">Por método de pago (hoy)</p>
              </div>
              
              <div className="relative w-[130px] h-[130px] mx-auto my-6 flex items-center justify-center">
                <svg width="130" height="130" viewBox="0 0 100 100" className="-rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="2.5"
                  />
                  {/* Segment 1: Transferencias (60%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="150.8 100.5"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Efectivo (30%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="75.4 175.9"
                    strokeDashoffset="-150.8"
                  />
                  {/* Segment 3: Tarjeta (10%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeDasharray="25.1 226.2"
                    strokeDashoffset="-226.2"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[16px] text-abyssal-text-primary font-heading font-bold">100%</span>
                  <span className="text-[9px] text-abyssal-text-secondary-variant uppercase tracking-wider font-semibold font-caption">Total</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Transferencias", value: "60%", colorClass: "bg-blue-500" },
                  { name: "Efectivo", value: "30%", colorClass: "bg-emerald-500" },
                  { name: "Tarjeta", value: "10%", colorClass: "bg-purple-500" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.colorClass}`} />
                      <span className="text-abyssal-text-secondary font-body">{item.name}</span>
                    </div>
                    <span className="font-mono text-abyssal-text-primary font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab !== "resumen" && (
          <div className="space-y-4">
            
            {/* Controles de Filtro, Búsqueda y Ordenación */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
                {(["all", "pendientes", "pagados"] as const).map((f) => (
                  <FilterChip
                    key={f}
                    label={f === "all" ? "Todos" : f === "pendientes" ? "Pendientes" : "Pagados"}
                    selected={filterBy === f}
                    onClick={() => setFilterBy(f)}
                  />
                ))}
                <div className="flex-grow" />
                <button
                  onClick={() => setSortBy(sortBy === "name" ? "amount" : sortBy === "amount" ? "oldest" : "name")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyssal-surface-high text-[11px] text-abyssal-text-secondary font-medium hover:text-abyssal-text-primary transition-colors shrink-0"
                >
                  <ArrowsDownUp className="w-3.5 h-3.5" />
                  {sortBy === "name" ? "A-Z" : sortBy === "amount" ? "Monto" : "Antigüedad"}
                </button>
              </div>
            </div>

            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-abyssal-text-secondary" />
              <input
                type="text"
                placeholder={activeTab === "cobrar" ? "Buscar cliente..." : "Buscar proveedor..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-abyssal-surface-high text-[13px] text-abyssal-text-primary placeholder-abyssal-text-secondary outline-none border border-slate-800 focus:border-abyssal-primary/40 transition-colors"
              />
            </div>

            {/* Listado de Cuentas por Cobrar */}
            {activeTab === "cobrar" && (
              loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : error ? (
                <p className="text-center text-[14px] text-abyssal-red py-8">{error}</p>
              ) : filteredReceivables.length === 0 ? (
                <p className="text-center text-[14px] text-abyssal-text-secondary py-8">No se encontraron deudores registrados</p>
              ) : (
                <div className="space-y-3">
                  {filteredReceivables.map((debtor) => {
                    const progressPct = debtor.progress.total > 0 ? Math.round((debtor.progress.paid / debtor.progress.total) * 100) : 0
                    const isFullyPaid = debtor.total_pending === 0

                    return (
                      <Card key={debtor.id} className="overflow-hidden border border-slate-800">
                        <button
                          onClick={() => toggleExpand(debtor.id, "receivable")}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[15px] text-abyssal-text-primary font-medium">{debtor.name}</p>
                              {debtor.isOverdue && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-abyssal-red/12 text-[10px] font-semibold text-abyssal-red">
                                  <Warning className="w-3 h-3" />
                                  Vencido
                                </span>
                              )}
                              {isFullyPaid && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-abyssal-green/12 text-[10px] font-semibold text-abyssal-green">
                                  <CheckCircle className="w-3 h-3" />
                                  Cobrado
                                </span>
                              )}
                            </div>
                            <p className="text-label-small text-abyssal-text-secondary mt-0.5 flex items-center gap-1.5">
                              <span className={cn("font-semibold", isFullyPaid ? "text-abyssal-green" : "text-abyssal-primary")}>
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
                                  className={cn("h-full rounded-full transition-all duration-500", isFullyPaid ? "bg-abyssal-green" : "bg-abyssal-primary")}
                                  style={{ width: `${Math.min(progressPct, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                          {!isFullyPaid && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setPayTarget({ debtor, type: "receivable" }) }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyssal-primary/10 text-abyssal-primary text-[12px] font-semibold hover:bg-abyssal-primary/20 transition-colors shrink-0 mr-1"
                            >
                              <HandCoins className="w-4 h-4" />
                              Cobrar
                            </button>
                          )}
                          {expandedId === debtor.id ? (
                            <CaretUp className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                          ) : (
                            <CaretDown className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                          )}
                        </button>

                        <div className={cn("overflow-hidden transition-all duration-300", expandedId === debtor.id ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
                          <div className="border-t border-slate-800 mx-4" />
                          <div className="p-4 space-y-2">
                            {debtor.entries.length === 0 ? (
                              <p className="text-body-medium text-abyssal-text-secondary text-center py-2">Cargando historial...</p>
                            ) : (
                              debtor.entries.map((entry) => {
                                const days = getDaysSince(entry.date)
                                const paidAmount = entry.amount - (entry.pending_amount ?? entry.amount)
                                const isEntryPaid = entry.status === "PAGADO"
                                return (
                                  <div key={entry.id} className={cn("flex items-center justify-between rounded-xl p-3 transition-colors", isEntryPaid ? "bg-abyssal-green/5" : "bg-abyssal-surface-high")}>
                                    <div className="min-w-0 flex-1">
                                      <p className={cn("text-[13px] font-medium", isEntryPaid ? "text-abyssal-text-secondary" : "text-abyssal-text-primary")}>
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
                  })}
                </div>
              )
            )}

            {/* Listado de Cuentas por Pagar */}
            {activeTab === "pagar" && (
              loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : error ? (
                <p className="text-center text-[14px] text-abyssal-red py-8">{error}</p>
              ) : filteredPayables.length === 0 ? (
                <p className="text-center text-[14px] text-abyssal-text-secondary py-8">No se encontraron cuentas por pagar</p>
              ) : (
                <div className="space-y-3">
                  {filteredPayables.map((debtor) => {
                    const progressPct = debtor.progress.total > 0 ? Math.round((debtor.progress.paid / debtor.progress.total) * 100) : 0
                    const isFullyPaid = debtor.total_pending === 0

                    return (
                      <Card key={debtor.id} className="overflow-hidden border border-slate-800">
                        <button
                          onClick={() => toggleExpand(debtor.id, "payable")}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[15px] text-abyssal-text-primary font-medium">{debtor.name}</p>
                              {debtor.isOverdue && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-abyssal-red/12 text-[10px] font-semibold text-abyssal-red">
                                  <Warning className="w-3 h-3" />
                                  Vencido
                                </span>
                              )}
                              {isFullyPaid && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-abyssal-green/12 text-[10px] font-semibold text-abyssal-green">
                                  <CheckCircle className="w-3 h-3" />
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
                                  <span className={cn("flex items-center gap-0.5", debtor.overdueDays > 7 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
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
                              onClick={(e) => { e.stopPropagation(); setPayTarget({ debtor, type: "payable" }) }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-abyssal-red/12 text-abyssal-red text-[12px] font-semibold hover:bg-abyssal-red/20 transition-colors shrink-0 mr-1"
                            >
                              <HandCoins className="w-4 h-4" />
                              Pagar
                            </button>
                          )}
                          {expandedId === debtor.id ? (
                            <CaretUp className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                          ) : (
                            <CaretDown className="w-5 h-5 text-abyssal-text-secondary shrink-0 ml-1" />
                          )}
                        </button>

                        <div className={cn("overflow-hidden transition-all duration-300", expandedId === debtor.id ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
                          <div className="border-t border-slate-800 mx-4" />
                          <div className="p-4 space-y-2">
                            {debtor.entries.length === 0 ? (
                              <p className="text-body-medium text-abyssal-text-secondary text-center py-2">Cargando historial...</p>
                            ) : (
                              debtor.entries.map((entry) => {
                                const days = getDaysSince(entry.date)
                                const paidAmount = entry.amount - (entry.pending_amount ?? entry.amount)
                                const isEntryPaid = entry.status === "PAGADO"
                                return (
                                  <div key={entry.id} className={cn("flex items-center justify-between rounded-xl p-3 transition-colors", isEntryPaid ? "bg-abyssal-green/5" : "bg-abyssal-surface-high")}>
                                    <div className="min-w-0 flex-1">
                                      <p className={cn("text-[13px] font-medium", isEntryPaid ? "text-abyssal-text-secondary" : "text-abyssal-text-primary")}>
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
                                        {days > 0 && !isEntryPaid && (
                                          <>
                                            <span className="text-[9px] text-abyssal-text-secondary">&middot;</span>
                                            <span className={cn("text-[10px] flex items-center gap-0.5", days > 7 ? "text-abyssal-red" : "text-abyssal-text-secondary")}>
                                              <Clock className="w-3 h-3" />
                                              {days}d
                                            </span>
                                          </>
                                        )}
                                      </div>
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
                  })}
                </div>
              )
            )}

          </div>
        )}
      </div>

      {payTarget && (
        <PayDialog
          open={!!payTarget}
          onClose={() => setPayTarget(null)}
          debtorName={payTarget.debtor.name}
          pendingAmount={payTarget.debtor.total_pending}
          type={payTarget.type}
          onPay={handlePayment}
        />
      )}

      {addOpen && (
        <AddDebtDialog
          open={!!addOpen}
          onClose={() => setAddOpen(null)}
          type={addOpen.type}
          onCreated={() => {
            const actionStr = addOpen.type === "receivable" ? "Deuda" : "Obligación"
            addToast(`${actionStr} registrada con éxito`, "success")
            fetchAll()
            setAddOpen(null)
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
