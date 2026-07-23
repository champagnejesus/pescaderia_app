"use client"
import { useState, useEffect, useCallback } from "react"
import { DollarSign } from "lucide-react"
import { TopBar } from "@/components/layout/TopBar"
import { Skeleton } from "@/components/ui/skeleton"
import { DaySummaryCard } from "@/components/cash-register/DaySummaryCard"
import { CashBentoGrid } from "@/components/cash-register/CashBentoGrid"
import { TransactionRow } from "@/components/cash-register/TransactionRow"
import { PinModal } from "@/components/cash-register/PinModal"
import { ExpenseDialog } from "@/components/cash-register/ExpenseDialog"
import { Button } from "@/components/ui/button"
import { FilterChip } from "@/components/shared/FilterChip"
import { ToastContainer } from "@/components/ui/ToastContainer"
import DateRangePicker from "@/components/common/DateRangePicker"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"
import type { DailySummary, Transaction } from "@/lib/types"

export default function CashRegisterPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pinOpen, setPinOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const { toasts, addToast, removeToast } = useToast()

  const fetch = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const txParams: Record<string, string | number> = { limit: 50 }
      if (dateRange.startDate) txParams.start_date = dateRange.startDate
      if (dateRange.endDate) txParams.end_date = dateRange.endDate
      const [summaryRes, txRes] = await Promise.all([
        api.get<DailySummary>("/transactions/daily-summary"),
        api.get<Transaction[]>("/transactions", { params: txParams }),
      ])
      setSummary(summaryRes.data)
      setTransactions(txRes.data)
    } catch {
      setError("Error al cargar datos de caja")
      addToast("Error al cargar datos de caja", "error")
    } finally {
      setLoading(false)
    }
  }, [addToast, dateRange.startDate, dateRange.endDate])

  useEffect(() => { fetch() }, [fetch])

  const filteredTransactions = selectedFilter
    ? transactions.filter((tx) => tx.type === selectedFilter)
    : transactions

  async function handlePinConfirm(pin: string) {
    setClosing(true)
    try {
      await api.post("/transactions/close-day", { pin })
      addToast("Cierre de caja completado exitosamente", "success")
      setPinOpen(false)
      fetch()
    } catch {
      addToast("Error al cerrar el día. Verifica el PIN.", "error")
    } finally {
      setClosing(false)
    }
  }

  const filterOptions = [
    { label: "Todas", value: null },
    { label: "Efectivo", value: "Efectivo" },
    { label: "Tarjeta", value: "Tarjeta" },
    { label: "Gastos", value: "Gasto" },
  ]

  return (
    <>
      <TopBar title="Cierre de Caja" icon={<DollarSign size={18} />} />
      <div className="p-4 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-48" />
          </>
        ) : error && !summary ? (
          <div className="bg-abyssal-surface glass rounded-3xl p-8 text-center">
            <p className="text-body-large text-abyssal-red font-medium">{error}</p>
            <Button variant="secondary" size="md" className="mt-4" onClick={fetch}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            {summary && (
              <>
                <div className="animate-fade-in">
                  <DaySummaryCard
                    totalSales={summary.total_sales}
                    netTotal={summary.net_total}
                    transactionCount={summary.transaction_count}
                  />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
                  <CashBentoGrid data={summary} />
                </div>
              </>
            )}

            <div className="space-y-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center justify-between">
                <p className="text-title-medium text-abyssal-text-primary">Transacciones</p>
                {transactions.length > 0 && (
                  <p className="text-[12px] text-abyssal-text-secondary">
                    {filteredTransactions.length} de {transactions.length}
                  </p>
                )}
              </div>

              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {filterOptions.map((opt) => (
                  <FilterChip
                    key={opt.label}
                    label={opt.label}
                    selected={selectedFilter === opt.value}
                    onClick={() => setSelectedFilter(opt.value)}
                  />
                ))}
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="bg-abyssal-surface glass rounded-2xl p-8 text-center">
                  <p className="text-body-medium text-abyssal-text-secondary">
                    {selectedFilter
                      ? `No hay transacciones de tipo "${selectedFilter}"`
                      : "No hay transacciones hoy"}
                  </p>
                  <p className="text-[12px] text-abyssal-text-secondary mt-1">
                    {selectedFilter ? "Prueba cambiando el filtro" : "Realiza una venta para verlo aquí"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="lg"
              className="w-full border border-abyssal-outline/40"
              onClick={() => setExpenseOpen(true)}
            >
              + Agregar Gasto
            </Button>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => setPinOpen(true)}
              loading={closing}
              disabled={closing}
            >
              {closing ? "" : "Cerrar Día"}
            </Button>
          </>
        )}
      </div>

      <PinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onConfirm={handlePinConfirm}
        summary={summary}
      />

      <ExpenseDialog
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onCreated={fetch}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
