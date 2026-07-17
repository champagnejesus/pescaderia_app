"use client"
import { useState, useEffect, useCallback } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { Skeleton } from "@/components/ui/skeleton"
import { DaySummaryCard } from "@/components/cash-register/DaySummaryCard"
import { CashBentoGrid } from "@/components/cash-register/CashBentoGrid"
import { TransactionRow } from "@/components/cash-register/TransactionRow"
import { PinModal } from "@/components/cash-register/PinModal"
import api from "@/lib/api"

interface DailySummaryResponse {
  total_sales: number
  total_expenses: number
  net_total: number
  cash_total: number
  card_total: number
  transaction_count: number
}

interface Transaction {
  id: number
  title: string
  time: string
  type: string
  amount: number
  status: string
}

export default function CashRegisterPage() {
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [pinOpen, setPinOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get<DailySummaryResponse>("/transactions/daily-summary"),
        api.get<Transaction[]>("/transactions", { params: { limit: 50 } }),
      ])
      setSummary(summaryRes.data)
      setTransactions(txRes.data)
    } catch (err) {
      console.error("Error fetching cash register data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handlePinConfirm(pin: string) {
    setClosing(true)
    try {
      await api.post("/transactions/close-day", { pin })
    } catch (err) {
      console.error("Error closing day:", err)
    } finally {
      setClosing(false)
      setPinOpen(false)
      fetch()
    }
  }

  return (
    <>
      <TopBar title="Cierre de Caja" />
      <div className="p-4 space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-24" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-48" />
          </>
        ) : (
          <>
            {summary && (
              <>
                <div className="bg-gradient-to-br from-abyssal-primary/10 to-abyssal-surface rounded-abyssal-md p-4 border border-abyssal-primary/20 animate-fade-in">
                  <DaySummaryCard totalSales={summary.total_sales} />
                </div>
                <CashBentoGrid data={summary} />
              </>
            )}
            <div className="space-y-2">
              <p className="text-title-medium text-abyssal-text-primary">Transacciones de Hoy</p>
              {transactions.length === 0 ? (
                <p className="text-center text-body-medium text-abyssal-text-secondary py-4">
                  No hay transacciones hoy
                </p>
              ) : (
                transactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))
              )}
            </div>
            <button
              onClick={() => setPinOpen(true)}
              disabled={closing}
              className="w-full bg-abyssal-primary text-abyssal-on-primary rounded-abyssal-md py-3 text-body-medium font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {closing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cerrando...
                </span>
              ) : "Cerrar Día"}
            </button>
          </>
        )}
      </div>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onConfirm={handlePinConfirm} />
    </>
  )
}
