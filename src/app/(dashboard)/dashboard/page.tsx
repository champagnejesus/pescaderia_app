"use client"
import { useState, useEffect } from "react"
import { TrendingUp, Plus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BentoGrid } from "@/components/dashboard/BentoGrid"
import { RecentActivityList } from "@/components/dashboard/RecentActivityList"
import { useProducts } from "@/hooks/useProducts"
import { useOrders } from "@/hooks/useOrders"
import { useTransactions } from "@/hooks/useTransactions"
import { TopBar } from "@/components/layout/TopBar"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/formatters"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { useToast } from "@/hooks/useToast"
import api from "@/lib/api"

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  reference_id: number
  reference: string
  amount: number
  status: string
  created_at: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const { lowStockCount, loading: productsLoading } = useProducts()
  const { data: orders, loading: ordersLoading } = useOrders()
  const { data: summary, loading: txsLoading } = useTransactions()

  const loading = productsLoading || ordersLoading || txsLoading
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    api.get<ActivityItem[]>("/activity/recent")
      .then((res) => setActivity(res.data))
      .catch(() => {})
      .finally(() => setActivityLoading(false))
  }, [])

  const dashboardData = {
    gross_profit: summary?.net_total ?? 0,
    sales_total: summary?.total_sales ?? 0,
    purchases_total: summary?.total_expenses ?? 0,
    cash_total: summary?.cash_total ?? 0,
    transfer_total: summary?.card_total ?? 0,
    pending_orders: orders.filter((o) => o.status === "PENDIENTE").length,
    low_stock_count: lowStockCount,
    total_clients: 0,
    total_suppliers: 0,
  }

  function handleActivityPress(item: ActivityItem) {
    if (item.type === "pedido") router.push(`/orders/${item.reference_id}`)
    else if (item.type === "compra") router.push(`/purchases/${item.reference_id}`)
  }

  return (
    <>
      <TopBar title="Resumen" />
      <div className="p-4 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-48" />
          </>
        ) : (
          <>
            <Card className="animate-fade-in">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-label-medium text-abyssal-text-secondary">Ganancia Bruta</p>
                  <p className="text-headline-medium text-abyssal-text-primary font-bold mt-1">
                    {formatCurrency(dashboardData.gross_profit)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {dashboardData.pending_orders > 0 && (
                    <span className="inline-flex items-center gap-1 bg-abyssal-yellow-bg text-abyssal-yellow rounded-abyssal-full px-2.5 py-1 text-label-small">
                      <span className="w-1.5 h-1.5 rounded-full bg-abyssal-yellow animate-subtle-pulse" />
                      {dashboardData.pending_orders} pendiente{dashboardData.pending_orders !== 1 ? "s" : ""}
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-full bg-abyssal-primary/10 flex items-center justify-center text-abyssal-primary">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>
            </Card>

            <BentoGrid data={dashboardData} />

            {activityLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <RecentActivityList items={activity} onPress={handleActivityPress} />
            )}

            <div className="flex gap-3">
              <Link href="/orders/new" className="flex-1">
                <Button variant="primary" size="lg" className="w-full gap-2">
                  <Plus size={18} />
                  Nuevo Pedido
                </Button>
              </Link>
              <Link href="/orders/new?quickSale=true" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full gap-2">
                  <ShoppingCart size={18} />
                  Nueva Venta
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
