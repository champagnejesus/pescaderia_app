"use client"
import { useState, useEffect, useCallback } from "react"
import { TopBar } from "@/components/layout/TopBar"
import { Skeleton } from "@/components/ui/skeleton"
import { DaySummaryCard } from "@/components/cash-register/DaySummaryCard"
import { CashBentoGrid } from "@/components/cash-register/CashBentoGrid"
import { TransactionRow } from "@/components/cash-register/TransactionRow"
import { PinModal } from "@/components/cash-register/PinModal"
import { Button } from "@/components/ui/button"
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
        ) : (
          <>
            {summary && (
              <>
                <div className="animate-fade-in">
                  <DaySummaryCard totalSales={summary.total_sales} />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
                  <CashBentoGrid data={summary} />
                </div>
              </>
            )}
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <p className="text-title-medium text-abyssal-text-primary">Transacciones de Hoy</p>
              {transactions.length === 0 ? (
                <div className="bg-abyssal-surface rounded-abyssal-md p-8 text-center">
                  <p className="text-body-medium text-abyssal-text-secondary">No hay transacciones hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
                </div>
              )}
            </div>
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

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onConfirm={handlePinConfirm} />
    </>
  )
}
