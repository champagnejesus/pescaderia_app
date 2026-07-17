# Diff for Task 7

## Commit list
- 379fb94 feat: implement client detail page with real data

## Stat summary
 web/src/app/(dashboard)/clients/[id]/page.tsx | 198 +++++++++++++++++---------
 1 file changed, 131 insertions(+), 67 deletions(-)

## Full diff
```diff
diff --git a/web/src/app/(dashboard)/clients/[id]/page.tsx b/web/src/app/(dashboard)/clients/[id]/page.tsx
index 3b7efdc..3a7d475 100644
--- a/web/src/app/(dashboard)/clients/[id]/page.tsx
+++ b/web/src/app/(dashboard)/clients/[id]/page.tsx
@@ -1,11 +1,69 @@
-import { Metadata } from "next"
+"use client"
+import { useParams, useRouter } from "next/navigation"
 import Link from "next/link"
+import { useClient } from "@/hooks/useClient"
+import { useClientOrders } from "@/hooks/useClientOrders"
 
-export const metadata: Metadata = {
-  title: "Detalle Cliente",
+function formatCurrency(n: number) {
+  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
 }
 
-export default function ClientDetail({ params }: { params: { id: string } }) {
+function formatDate(dateStr: string | null) {
+  if (!dateStr) return ""
+  const date = new Date(dateStr)
+  const now = new Date()
+  const diffMs = now.getTime() - date.getTime()
+  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
+  
+  if (diffDays === 0) return "Hoy"
+  if (diffDays === 1) return "Ayer"
+  if (diffDays < 7) return `Hace ${diffDays} días`
+  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
+}
+
+function StatusBadge({ status }: { status: string }) {
+  const styles: Record<string, string> = {
+    ENTREGADO: "bg-[#09bf49]/20 text-[#47e266]",
+    PENDIENTE: "bg-[#caa900]/20 text-[#eac400]",
+    CANCELADO: "bg-[#ffb4ab]/20 text-[#ffb4ab]",
+  }
+  return (
+    <span className={`${styles[status] || styles.PENDIENTE} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
+      {status}
+    </span>
+  )
+}
+
+export default function ClientDetail() {
+  const params = useParams()
+  const router = useRouter()
+  const id = params.id as string
+  const { client, loading: clientLoading, error: clientError } = useClient(id)
+  const { orders, loading: ordersLoading } = useClientOrders(id)
+
+  if (clientLoading) {
+    return (
+      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
+        <div className="animate-spin w-8 h-8 border-2 border-[#c2c1ff] border-t-transparent rounded-full" />
+      </div>
+    )
+  }
+
+  if (clientError || !client) {
+    return (
+      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4 text-[#e4e1ed]">
+        <span className="material-symbols-outlined text-[#ffb4ab] text-5xl">error</span>
+        <p className="text-[17px]">{clientError || "Cliente no encontrado"}</p>
+        <Link href="/clients" className="text-[#c2c1ff] text-[15px]">Volver a clientes</Link>
+      </div>
+    )
+  }
+
+  const phoneUrl = `tel:${client.phone}`
+  const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, "")}`
+  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`
+  const newOrderUrl = `/orders/new?client_id=${client.id}`
+
   return (
     <div className="min-h-screen bg-[#121212] font-['Inter'] text-[#e4e1ed] selection:bg-[#c2c1ff]/30 pb-[100px]">
       <style dangerouslySetInnerHTML={{__html: `
@@ -24,8 +82,11 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
         <Link href="/clients" className="active-scale text-[#c2c1ff] flex items-center">
           <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>chevron_left</span>
         </Link>
-        <h1 className="text-[20px] leading-[25px] font-semibold text-[#e4e1ed] truncate px-4">Juan Rodríguez</h1>
-        <button className="active-scale text-[#c2c1ff] text-[17px] leading-[22px] font-semibold">
+        <h1 className="text-[20px] leading-[25px] font-semibold text-[#e4e1ed] truncate px-4">{client.name}</h1>
+        <button 
+          onClick={() => router.push(`/clients/${client.id}/edit`)}
+          className="active-scale text-[#c2c1ff] text-[17px] leading-[22px] font-semibold"
+        >
           Editar
         </button>
       </header>
@@ -36,12 +97,12 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
         <section className="relative overflow-hidden bg-[#5e5ce6] rounded-[3rem] p-6 flex flex-col justify-between h-[180px] shadow-2xl">
           <div className="z-10">
             <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/70 uppercase">Saldo Pendiente</span>
-            <div className="text-[34px] leading-[41px] tracking-[-0.02em] font-bold text-white mt-1">€450.00</div>
+            <div className="text-[34px] leading-[41px] tracking-[-0.02em] font-bold text-white mt-1">{formatCurrency(client.outstanding_balance)}</div>
           </div>
           <div className="z-10 flex justify-between items-end">
             <div className="flex flex-col">
               <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/60">Límite de crédito</span>
-              <span className="text-[15px] leading-[20px] font-normal text-white">€1,500.00</span>
+              <span className="text-[15px] leading-[20px] font-normal text-white">{formatCurrency(client.credit_limit)}</span>
             </div>
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-[17px] leading-[22px] font-semibold active-scale">
               Pagar
@@ -54,24 +115,24 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
 
         {/* Action Buttons Grid */}
         <section className="grid grid-cols-3 gap-3">
-          <button className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
+          <a href={phoneUrl} className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
             <div className="w-10 h-10 rounded-full bg-[#09bf49]/20 flex items-center justify-center text-[#47e266]">
               <span className="material-symbols-outlined">call</span>
             </div>
             <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#c7c4d7]">Llamar</span>
-          </button>
-          <button className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
+          </a>
+          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
             <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
               <span className="material-symbols-outlined">chat</span>
             </div>
             <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#c7c4d7]">WhatsApp</span>
-          </button>
-          <button className="flex flex-col items-center justify-center bg-[#5e5ce6] rounded-lg p-4 gap-2 active-scale">
+          </a>
+          <Link href={newOrderUrl} className="flex flex-col items-center justify-center bg-[#5e5ce6] rounded-lg p-4 gap-2 active-scale">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
               <span className="material-symbols-outlined">add_shopping_cart</span>
             </div>
             <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/90">Pedido</span>
-          </button>
+          </Link>
         </section>
 
         {/* Información de Contacto */}
@@ -83,7 +144,7 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
               <span className="material-symbols-outlined text-[#c2c1ff]">phone_iphone</span>
               <div className="flex flex-col">
                 <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Teléfono</span>
-                <span className="text-[15px] leading-[20px] font-normal">+34 612 345 678</span>
+                <span className="text-[15px] leading-[20px] font-normal">{client.phone || "No disponible"}</span>
               </div>
             </div>
             {/* Row 2: Email */}
@@ -91,7 +152,7 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
               <span className="material-symbols-outlined text-[#c2c1ff]">mail</span>
               <div className="flex flex-col">
                 <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Email</span>
-                <span className="text-[15px] leading-[20px] font-normal">juan.rodriguez@pescaexpress.es</span>
+                <span className="text-[15px] leading-[20px] font-normal">{client.email || "No disponible"}</span>
               </div>
             </div>
             {/* Row 3: Dirección */}
@@ -99,7 +160,7 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
               <span className="material-symbols-outlined text-[#c2c1ff]">location_on</span>
               <div className="flex flex-col">
                 <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Dirección</span>
-                <span className="text-[15px] leading-[20px] font-normal">Calle del Mar, 12. Mercamadrid, Nave 4.</span>
+                <span className="text-[15px] leading-[20px] font-normal">{client.address || "No disponible"}</span>
               </div>
             </div>
           </div>
@@ -109,70 +170,73 @@ export default function ClientDetail({ params }: { params: { id: string } }) {
         <section className="flex flex-col gap-3 mt-4">
           <div className="flex justify-between items-center px-1">
             <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase">Últimos Pedidos</h2>
-            <button className="text-[13px] leading-[18px] font-normal text-[#c2c1ff]">Ver todos</button>
+            <Link href={`/orders?client_id=${client.id}`} className="text-[13px] leading-[18px] font-normal text-[#c2c1ff]">Ver todos</Link>
           </div>
           <div className="flex flex-col gap-3">
-            {/* Pedido Item 1 */}
-            <div className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale">
-              <div className="flex items-center gap-4">
-                <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
-                  <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
-                </div>
-                <div className="flex flex-col">
-                  <span className="text-[17px] leading-[22px] font-semibold">Orden #8842</span>
-                  <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">Hoy, 09:15 AM</span>
-                </div>
-              </div>
-              <div className="flex flex-col items-end gap-1">
-                <span className="text-[17px] leading-[22px] font-semibold">€124.50</span>
-                <span className="bg-[#09bf49]/20 text-[#47e266] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Entregado</span>
-              </div>
-            </div>
-            {/* Pedido Item 2 */}
-            <div className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale">
-              <div className="flex items-center gap-4">
-                <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
-                  <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
-                </div>
-                <div className="flex flex-col">
-                  <span className="text-[17px] leading-[22px] font-semibold">Orden #8839</span>
-                  <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">Ayer, 14:30 PM</span>
-                </div>
-              </div>
-              <div className="flex flex-col items-end gap-1">
-                <span className="text-[17px] leading-[22px] font-semibold">€325.50</span>
-                <span className="bg-[#caa900]/20 text-[#eac400] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Pendiente</span>
-              </div>
-            </div>
-            {/* Pedido Item 3 */}
-            <div className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale">
-              <div className="flex items-center gap-4">
-                <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
-                  <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
-                </div>
-                <div className="flex flex-col">
-                  <span className="text-[17px] leading-[22px] font-semibold">Orden #8820</span>
-                  <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">12 Oct 2023</span>
+            {ordersLoading ? (
+              // Skeleton loading
+              Array.from({ length: 3 }).map((_, i) => (
+                <div key={i} className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 animate-pulse">
+                  <div className="flex items-center gap-4">
+                    <div className="w-12 h-12 rounded-lg bg-[#34343d]" />
+                    <div className="flex flex-col gap-2">
+                      <div className="w-24 h-4 bg-[#34343d] rounded" />
+                      <div className="w-16 h-3 bg-[#34343d] rounded" />
+                    </div>
+                  </div>
+                  <div className="flex flex-col items-end gap-2">
+                    <div className="w-16 h-4 bg-[#34343d] rounded" />
+                    <div className="w-12 h-4 bg-[#34343d] rounded-full" />
+                  </div>
                 </div>
+              ))
+            ) : orders.length === 0 ? (
+              <div className="bg-[#2a2932] rounded-lg p-6 text-center border border-[#464554]/30">
+                <span className="material-symbols-outlined text-[#918fa0] text-4xl">inbox</span>
+                <p className="text-[15px] text-[#918fa0] mt-2">Sin pedidos recientes</p>
+              </div>
+            ) : (
+              orders.map((order) => (
+                <Link
+                  key={order.id}
+                  href={`/orders/${order.id}`}
+                  className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale"
+                >
+                  <div className="flex items-center gap-4">
+                    <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
+                      <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
+                    </div>
+                    <div className="flex flex-col">
+                      <span className="text-[17px] leading-[22px] font-semibold">Orden #{order.order_number}</span>
+                      <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">{formatDate(order.created_at)}</span>
+                    </div>
+                  </div>
+                  <div className="flex flex-col items-end gap-1">
+                    <span className="text-[17px] leading-[22px] font-semibold">{formatCurrency(order.total_value)}</span>
+                    <StatusBadge status={order.status} />
+                  </div>
+                </Link>
+              ))
+            )}
           </div>
         </section>
 
-        {/* Map Section (Simulated) */}
+        {/* Map Section */}
         <section className="flex flex-col gap-3 mt-4">
           <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase px-1">Ruta de Entrega</h2>
-          <div className="w-full h-40 rounded-xl overflow-hidden border border-[#464554]/30 relative active-scale bg-gray-800">
+          <a 
+            href={mapsUrl}
+            target="_blank"
+            rel="noopener noreferrer"
+            className="w-full h-40 rounded-xl overflow-hidden border border-[#464554]/30 relative active-scale bg-[#1f1f27] flex items-center justify-center"
+          >
             <div className="absolute inset-0 bg-gradient-to-t from-[#13131b] to-transparent opacity-60 z-10"></div>
             <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#1f1f27]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#464554]/30 z-20">
               <span className="material-symbols-outlined text-[#c2c1ff] text-sm">navigation</span>
               <span className="text-[13px] leading-[18px] font-normal text-[#e4e1ed]">Ver en mapa</span>
             </div>
-          </div>
+            <span className="material-symbols-outlined text-[#918fa0] text-5xl z-10">map</span>
+          </a>
         </section>
       </main>
     </div>
```
