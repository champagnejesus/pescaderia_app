"use client"
import { useState, useEffect, useCallback } from "react"
import { TopBar } from "@/components/layout/TopBar"
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
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function handlePinConfirm(pin: string) {
    setClosing(true)
    try {
      await api.post("/transactions/close-day", { pin })
    } catch {
      // silently fail
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
          <div className="flex items-center justify-center h-32 text-body-medium text-abyssal-text-secondary">
            Cargando...
          </div>
        ) : (
          <>
            {summary && (
              <>
                <DaySummaryCard totalSales={summary.total_sales} />
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
              className="w-full bg-abyssal-primary text-abyssal-on-primary rounded-abyssal-md py-3 text-body-medium font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {closing ? "Cerrando..." : "Cerrar Día"}
            </button>
          </>
        )}
      </div>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onConfirm={handlePinConfirm} />
    </>
  )
}
