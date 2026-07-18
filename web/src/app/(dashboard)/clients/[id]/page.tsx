"use client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, MessageCircle, ShoppingCart, Mail, MapPin, Package, AlertCircle, Inbox } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { useClient } from "@/hooks/useClient"
import { useClientOrders } from "@/hooks/useClientOrders"

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

export default function ClientDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { client, loading: clientLoading, error: clientError } = useClient(id)
  const { orders, loading: ordersLoading, error: ordersError } = useClientOrders(id)

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-abyssal-bg flex flex-col">
        <div className="bg-abyssal-surface px-4 py-3 flex items-center gap-3 border-b border-abyssal-outline/50">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-[180px] rounded-[3rem]" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
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

  const phoneUrl = `tel:${client.phone}`
  const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, "")}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`
  const newOrderUrl = `/orders/new?client_id=${client.id}`

  return (
    <div className="min-h-screen bg-abyssal-bg">
      <header className="bg-abyssal-surface/80 backdrop-blur-xl border-b border-abyssal-outline/30 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
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
        <section className="relative overflow-hidden bg-abyssal-primary rounded-[2rem] p-6 flex flex-col justify-between min-h-[180px] shadow-abyssal-lg animate-fade-in">
          <div className="relative z-10">
            <span className="text-label-small text-white/70">Saldo Pendiente</span>
            <p className="text-display-large text-white font-bold mt-1">{formatCurrency(client.outstanding_balance)}</p>
          </div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <span className="text-label-small text-white/60">Límite de crédito</span>
              <p className="text-body-large text-white">{formatCurrency(client.credit_limit)}</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2 rounded-abyssal-full text-body-medium font-semibold transition-all active:scale-95">
              Pagar
            </button>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-abyssal-green/20 rounded-full blur-2xl" />
        </section>

        <section className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <a href={phoneUrl} className="flex flex-col items-center justify-center bg-abyssal-surface glass rounded-2xl p-4 gap-2 hover:bg-abyssal-surface-high transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-abyssal-green-bg flex items-center justify-center text-abyssal-green">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-label-small text-abyssal-text-secondary">Llamar</span>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center bg-abyssal-surface glass rounded-2xl p-4 gap-2 hover:bg-abyssal-surface-high transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-label-small text-abyssal-text-secondary">WhatsApp</span>
          </a>
          <Link href={newOrderUrl} className="flex flex-col items-center justify-center bg-abyssal-primary rounded-abyssal-md p-4 gap-2 hover:opacity-90 transition-all active:scale-95">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-label-small text-white/90">Pedido</span>
          </Link>
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
                i < 2 && "border-b border-abyssal-outline/20"
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
    </div>
  )
}
