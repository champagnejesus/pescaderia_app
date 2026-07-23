"use client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Phone, MessageCircle, ShoppingCart, Mail, MapPin, Package, AlertCircle, Inbox, DollarSign, CheckCircle2, HandCoins } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { useClient } from "@/hooks/useClient"
import { useClientOrders } from "@/hooks/useClientOrders"
import { useClientPayments } from "@/hooks/useClientPayments"
import { PayDialog } from "@/components/clients/PayDialog"

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Hoy"
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

function getCreditRatio(balance: number, limit: number) {
  if (limit <= 0) return 0
  return Math.min(balance / limit, 1)
}

export default function ClientDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { client, loading: clientLoading, error: clientError, refetch: refetchClient } = useClient(id)
  const { orders, loading: ordersLoading, error: ordersError } = useClientOrders(id)
  const { entries: payments, loading: paymentsLoading, refetch: refetchPayments } = useClientPayments(id)
  const [payOpen, setPayOpen] = useState(false)

  function handlePaySuccess() {
    refetchClient()
    refetchPayments()
  }

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-abyssal-bg flex flex-col">
        <div className="bg-abyssal-surface px-4 py-3 flex items-center gap-3 border-b border-abyssal-primary/20">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-[220px] rounded-[3rem]" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (clientError || !client) {
    return (
      <div className="min-h-screen bg-abyssal-bg flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-abyssal-red" />
        <p className="text-title-medium text-abyssal-text-primary text-center">{clientError || "Cliente no encontrado"}</p>
        <Link href="/clients" className="text-body-medium text-abyssal-primary">Volver a clientes</Link>
      </div>
    )
  }

  const hasDebt = client.outstanding_balance > 0
  const creditRatio = getCreditRatio(client.outstanding_balance, client.credit_limit)
  const creditColor = client.outstanding_balance <= 0 ? "bg-abyssal-green"
    : client.outstanding_balance >= client.credit_limit ? "bg-abyssal-red"
    : "bg-abyssal-yellow"

  const phoneUrl = `tel:${client.phone}`
  const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, "")}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address || "")}`
  const newOrderUrl = `/orders/new?client_id=${client.id}`

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 backdrop-blur-xl border-b border-abyssal-primary/20 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-abyssal-full hover:bg-abyssal-surface-high transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-abyssal-text-secondary" />
        </button>
        <h1 className="text-title-large text-abyssal-text-primary truncate px-2 text-center flex-1">{client.name}</h1>
        <button
          onClick={() => router.push(`/clients/${client.id}/edit`)}
          className="text-body-medium text-abyssal-primary font-semibold hover:opacity-80 transition-opacity active:scale-95"
        >
          Editar
        </button>
      </header>

      <main className="max-w-[480px] mx-auto p-4 pb-24 space-y-4">
        <section className="bg-abyssal-surface glass rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary text-[19px] font-bold shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-title-medium text-abyssal-text-primary">{client.name}</p>
              <StatusBadge status={hasDebt ? "CON DEUDA" : "AL CORRIENTE"} />
            </div>
          </div>
          {client.credit_limit > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-label-small text-abyssal-text-secondary">
                <span>Saldo: {formatCurrency(client.outstanding_balance)}</span>
                <span>Límite: {formatCurrency(client.credit_limit)}</span>
              </div>
              <div className="h-2 bg-abyssal-surface-high rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", creditColor)} style={{ width: `${creditRatio * 100}%` }} />
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-4 gap-2 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <a href={phoneUrl} className="flex flex-col items-center justify-center bg-abyssal-surface glass rounded-2xl p-3 gap-1.5 hover:bg-abyssal-surface-high transition-all active:scale-95">
            <div className="w-9 h-9 rounded-full bg-abyssal-green-bg flex items-center justify-center text-abyssal-green">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-abyssal-text-secondary font-medium">Llamar</span>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center bg-abyssal-surface glass rounded-2xl p-3 gap-1.5 hover:bg-abyssal-surface-high transition-all active:scale-95">
            <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-abyssal-text-secondary font-medium">WhatsApp</span>
          </a>
          <Link href={newOrderUrl} className="flex flex-col items-center justify-center bg-abyssal-surface glass rounded-2xl p-3 gap-1.5 hover:bg-abyssal-surface-high transition-all active:scale-95">
            <div className="w-9 h-9 rounded-full bg-abyssal-primary/15 flex items-center justify-center text-abyssal-primary">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-abyssal-text-secondary font-medium">Pedido</span>
          </Link>
          {hasDebt ? (
            <button onClick={() => setPayOpen(true)} className="flex flex-col items-center justify-center bg-abyssal-primary rounded-2xl p-3 gap-1.5 hover:opacity-90 transition-all active:scale-95">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                <HandCoins className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-white/90 font-medium">Cobrar</span>
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center bg-abyssal-surface glass rounded-2xl p-3 gap-1.5 opacity-50">
              <div className="w-9 h-9 rounded-full bg-abyssal-green/20 flex items-center justify-center text-abyssal-green">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-abyssal-text-secondary font-medium">Al día</span>
            </div>
          )}
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-label-small text-abyssal-text-secondary uppercase tracking-wider mb-3 px-1">Información de Contacto</h2>
          <div className="bg-abyssal-surface glass rounded-2xl overflow-hidden">
            {[
              { icon: Phone, label: "Teléfono", value: client.phone || "No disponible" },
              { icon: Mail, label: "Email", value: client.email || "No disponible" },
              { icon: MapPin, label: "Dirección", value: client.address || "No disponible" },
            ].map((item, i) => (
              <div key={i} className={cn(
                "flex items-center p-4 gap-4 transition-colors hover:bg-abyssal-surface-high",
                i < 2 && "border-b border-abyssal-primary/20"
              )}>
                <item.icon className="w-5 h-5 text-abyssal-primary shrink-0" />
                <div>
                  <p className="text-label-small text-abyssal-text-secondary">{item.label}</p>
                  <p className="text-body-medium text-abyssal-text-primary">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-label-small text-abyssal-text-secondary uppercase tracking-wider">Últimos Pedidos</h2>
            <Link href={`/orders?client_id=${client.id}`} className="text-body-medium text-abyssal-primary">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {ordersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-abyssal-surface rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-12 h-4 rounded-abyssal-full" />
                  </div>
                </div>
              ))
            ) : ordersError ? (
              <div className="bg-abyssal-surface glass rounded-2xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-abyssal-red mx-auto mb-2" />
                <p className="text-body-medium text-abyssal-red">{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-abyssal-surface glass rounded-2xl p-6 text-center">
                <Inbox className="w-10 h-10 text-abyssal-text-secondary mx-auto mb-2" />
                <p className="text-body-medium text-abyssal-text-secondary">Sin pedidos recientes</p>
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-abyssal-surface glass rounded-2xl transition-all hover:bg-abyssal-surface-high active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-abyssal-sm bg-abyssal-surface-high flex items-center justify-center">
                      <Package className="w-6 h-6 text-abyssal-text-secondary" />
                    </div>
                    <div>
                      <p className="text-body-medium text-abyssal-text-primary font-semibold">Orden #{order.order_number}</p>
                      <p className="text-label-small text-abyssal-text-secondary">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-body-medium text-abyssal-text-primary font-semibold">{formatCurrency(order.total_value)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-label-small text-abyssal-text-secondary uppercase tracking-wider mb-3 px-1">Historial de Pagos</h2>
          <div className="space-y-2">
            {paymentsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-2xl" />
              ))
            ) : payments.length === 0 ? (
              <div className="bg-abyssal-surface glass rounded-2xl p-6 text-center">
                <DollarSign className="w-10 h-10 text-abyssal-text-secondary mx-auto mb-2" />
                <p className="text-body-medium text-abyssal-text-secondary">Sin pagos registrados</p>
              </div>
            ) : (
              payments
                .filter((e) => e.reference_type === "manual" || e.status === "PAGADO" || e.pending_amount === 0)
                .slice(0, 10)
                .map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-abyssal-surface glass rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-abyssal-sm bg-abyssal-green/15 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-abyssal-green" />
                      </div>
                      <div>
                        <p className="text-body-medium text-abyssal-text-primary font-medium">{entry.reference_number}</p>
                        <p className="text-label-small text-abyssal-text-secondary">{formatDate(entry.date)}</p>
                      </div>
                    </div>
                    <p className="text-body-medium text-abyssal-text-primary font-semibold">{formatCurrency(entry.amount)}</p>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: "250ms" }}>
          <h2 className="text-label-small text-abyssal-text-secondary uppercase tracking-wider mb-3 px-1">Ruta de Entrega</h2>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-40 rounded-2xl overflow-hidden relative block bg-abyssal-surface hover:bg-abyssal-surface-high transition-all active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-abyssal-bg to-transparent opacity-60 z-10" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-abyssal-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full z-20">
              <MapPin className="w-4 h-4 text-abyssal-primary" />
              <span className="text-label-small text-abyssal-text-primary">Ver en mapa</span>
            </div>
            <div className="flex items-center justify-center h-full">
              <MapPin className="w-12 h-12 text-abyssal-text-secondary" />
            </div>
          </a>
        </section>
      </main>

      <PayDialog
        client={client ? { id: client.id, name: client.name, outstanding_balance: client.outstanding_balance } : null}
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={handlePaySuccess}
      />
    </div>
  )
}
