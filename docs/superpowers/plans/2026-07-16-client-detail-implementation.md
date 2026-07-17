# Detalle de Clientes - Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar la UI de detalle de clientes con el backend, mostrar pedidos recientes, implementar acciones funcionales y mapa interactivo.

**Architecture:** Backend: nuevo endpoint `GET /clients/{id}/orders` para pedidos del cliente. Frontend: hooks `useClient` y `useClientOrders` para obtener datos, page.tsx como Client Component con loading states y acciones directas.

**Tech Stack:** FastAPI (Python), SQLAlchemy async, Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios

## Global Constraints

- Backend Python 3.11+, FastAPI, SQLAlchemy async
- Frontend Next.js 14, React 18, TypeScript, Tailwind CSS
- API base URL: `http://localhost:8000/api/v1`
- Estilo: dark theme, Inter font, colores hex (#121212, #1f1f27, #c2c1ff, #47e266, #eac400)
- Max-width UI: 400px centrado (mobile-first)

---

## Archivos a modificar

### Backend
1. `backend/app/schemas/client.py` - Agregar `ClientOrderResponse` y `ClientOrdersResponse`
2. `backend/app/services/client_service.py` - Agregar `get_client_orders()`
3. `backend/app/routers/clients.py` - Agregar endpoint `GET /{client_id}/orders`
4. `backend/app/tests/test_clients.py` - Agregar tests para `get_client_orders`

### Frontend
1. `web/src/hooks/useClient.ts` - Nuevo hook para datos del cliente
2. `web/src/hooks/useClientOrders.ts` - Nuevo hook para pedidos del cliente
3. `web/src/app/(dashboard)/clients/[id]/page.tsx` - Convertir a Client Component

---

### Task 1: Agregar schemas de respuesta para pedidos del cliente

**Files:**
- Modify: `backend/app/schemas/client.py`

**Interfaces:**
- Produces: `ClientOrderResponse`, `ClientOrdersResponse`

- [ ] **Step 1: Agregar schemas al archivo existente**

```python
# Agregar al final de backend/app/schemas/client.py

class ClientOrderResponse(BaseModel):
    id: int
    order_number: str
    delivery_date: str | None
    items_count: int
    status: str
    total_value: float
    created_at: datetime | None

class ClientOrdersResponse(BaseModel):
    orders: list[ClientOrderResponse]
    total: int
```

- [ ] **Step 2: Verificar que el código es válido**

Run: `cd backend && python -c "from app.schemas.client import ClientOrderResponse, ClientOrdersResponse; print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/client.py
git commit -m "feat: add ClientOrderResponse and ClientOrdersResponse schemas"
```

---

### Task 2: Agregar función get_client_orders al service

**Files:**
- Modify: `backend/app/services/client_service.py`

**Interfaces:**
- Consumes: `Client` model, `Order` model
- Produces: `get_client_orders(db, client_id, limit) -> list[Order]`

- [ ] **Step 1: Agregar import de Order al inicio del archivo**

```python
# Agregar en backend/app/services/client_service.py, línea 3
from app.models.order import Order
```

- [ ] **Step 2: Agregar función get_client_orders al final del archivo**

```python
# Agregar al final de backend/app/services/client_service.py

async def get_client_orders(db: AsyncSession, client_id: int, limit: int = 5) -> list[Order]:
    query = select(Order).where(Order.client_id == client_id).order_by(Order.created_at.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
```

- [ ] **Step 3: Verificar que el código es válido**

Run: `cd backend && python -c "from app.services.client_service import get_client_orders; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/client_service.py
git commit -m "feat: add get_client_orders service function"
```

---

### Task 3: Agregar test para get_client_orders

**Files:**
- Modify: `backend/app/tests/test_clients.py`

**Interfaces:**
- Consumes: `get_client_orders`, `create_client`, `Order` model (via order_service)
- Produces: Test `test_get_client_orders`

- [ ] **Step 1: Agregar imports al inicio del archivo**

```python
# Agregar en backend/app/tests/test_clients.py, línea 2
from app.services.client_service import get_client_orders
from app.services.order_service import create_order
```

- [ ] **Step 2: Agregar test al final del archivo**

```python
# Agregar al final de backend/app/tests/test_clients.py

@pytest.mark.asyncio
async def test_get_client_orders(async_session):
    # Crear cliente
    client = await create_client(async_session, {"name": "Order Client", "phone": "789"})
    await async_session.commit()
    
    # Crear pedidos para el cliente
    await create_order(async_session, {
        "order_number": "ORD-001",
        "client_id": client.id,
        "client_name": client.name,
        "items_count": 3,
        "status": "ENTREGADO",
        "total_value": 100.0
    })
    await create_order(async_session, {
        "order_number": "ORD-002",
        "client_id": client.id,
        "client_name": client.name,
        "items_count": 2,
        "status": "PENDIENTE",
        "total_value": 200.0
    })
    await async_session.commit()
    
    # Obtener pedidos del cliente
    orders = await get_client_orders(async_session, client.id)
    assert len(orders) == 2
    assert orders[0].order_number == "ORD-002"  # Más reciente primero
    assert orders[1].order_number == "ORD-001"

@pytest.mark.asyncio
async def test_get_client_orders_empty(async_session):
    client = await create_client(async_session, {"name": "No Orders", "phone": "000"})
    await async_session.commit()
    
    orders = await get_client_orders(async_session, client.id)
    assert len(orders) == 0
```

- [ ] **Step 3: Ejecutar tests para verificar que fallan**

Run: `cd backend && python -m pytest app/tests/test_clients.py::test_get_client_orders -v`
Expected: FAIL (función aún no está registrada en el módulo)

- [ ] **Step 4: Ejecutar todos los tests de clientes para verificar que pasan**

Run: `cd backend && python -m pytest app/tests/test_clients.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/tests/test_clients.py
git commit -m "test: add tests for get_client_orders"
```

---

### Task 4: Agregar endpoint GET /{client_id}/orders

**Files:**
- Modify: `backend/app/routers/clients.py`

**Interfaces:**
- Consumes: `get_client_orders`, `ClientOrdersResponse`
- Produces: Endpoint `GET /{client_id}/orders`

- [ ] **Step 1: Agregar import de schema**

```python
# Modificar línea 5 en backend/app/routers/clients.py
from app.schemas.client import ClientCreate, ClientUpdate, BalanceAdjust, ClientResponse, ClientOrdersResponse
```

- [ ] **Step 2: Agregar endpoint al final del archivo**

```python
# Agregar al final de backend/app/routers/clients.py

@router.get("/{client_id}/orders", response_model=ClientOrdersResponse)
async def get_client_orders_endpoint(client_id: int, limit: int = Query(5), db: AsyncSession = Depends(get_db)):
    orders = await client_service.get_client_orders(db, client_id, limit)
    return ClientOrdersResponse(orders=orders, total=len(orders))
```

- [ ] **Step 3: Verificar que el servidor inicia**

Run: `cd backend && python -c "from app.routers.clients import router; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/app/routers/clients.py
git commit -m "feat: add GET /clients/{id}/orders endpoint"
```

---

### Task 5: Crear hook useClient para frontend

**Files:**
- Create: `web/src/hooks/useClient.ts`

**Interfaces:**
- Consumes: `api` from `@/lib/api`
- Produces: `useClient(id)` returns `{ client, loading, error, refetch }`

- [ ] **Step 1: Crear el archivo con el hook**

```typescript
// web/src/hooks/useClient.ts
"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface ClientDetail {
  id: number
  name: string
  phone: string
  email: string
  address: string
  outstanding_balance: number
  credit_limit: number
  initials: string
}

export function useClient(id: string | null) {
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchClient = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<ClientDetail>(`/clients/${id}`)
      setClient(data)
    } catch {
      setError("Error al cargar cliente")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchClient() }, [fetchClient])

  return { client, loading, error, refetch: fetchClient }
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

Run: `cd web && npx tsc --noEmit src/hooks/useClient.ts`
Expected: Sin errores

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/useClient.ts
git commit -m "feat: add useClient hook for client detail"
```

---

### Task 6: Crear hook useClientOrders para frontend

**Files:**
- Create: `web/src/hooks/useClientOrders.ts`

**Interfaces:**
- Consumes: `api` from `@/lib/api`
- Produces: `useClientOrders(clientId)` returns `{ orders, loading, error, refetch }`

- [ ] **Step 1: Crear el archivo con el hook**

```typescript
// web/src/hooks/useClientOrders.ts
"use client"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

export interface ClientOrder {
  id: number
  order_number: string
  delivery_date: string | null
  items_count: number
  status: string
  total_value: number
  created_at: string | null
}

export function useClientOrders(clientId: string | null, limit: number = 5) {
  const [orders, setOrders] = useState<ClientOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchOrders = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get<{ orders: ClientOrder[]; total: number }>(
        `/clients/${clientId}/orders`,
        { params: { limit } }
      )
      setOrders(data.orders)
    } catch {
      setError("Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [clientId, limit])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

Run: `cd web && npx tsc --noEmit src/hooks/useClientOrders.ts`
Expected: Sin errores

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/useClientOrders.ts
git commit -m "feat: add useClientOrders hook for client orders"
```

---

### Task 7: Convertir page.tsx a Client Component con datos reales

**Files:**
- Modify: `web/src/app/(dashboard)/clients/[id]/page.tsx`

**Interfaces:**
- Consumes: `useClient`, `useClientOrders`
- Produces: UI completa conectada al backend

- [ ] **Step 1: Reemplazar contenido completo del archivo**

```typescript
// web/src/app/(dashboard)/clients/[id]/page.tsx
"use client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ENTREGADO: "bg-[#09bf49]/20 text-[#47e266]",
    PENDIENTE: "bg-[#caa900]/20 text-[#eac400]",
    CANCELADO: "bg-[#ffb4ab]/20 text-[#ffb4ab]",
  }
  return (
    <span className={`${styles[status] || styles.PENDIENTE} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
      {status}
    </span>
  )
}

export default function ClientDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { client, loading: clientLoading, error: clientError } = useClient(id)
  const { orders, loading: ordersLoading } = useClientOrders(id)

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#c2c1ff] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (clientError || !client) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4 text-[#e4e1ed]">
        <span className="material-symbols-outlined text-[#ffb4ab] text-5xl">error</span>
        <p className="text-[17px]">{clientError || "Cliente no encontrado"}</p>
        <Link href="/clients" className="text-[#c2c1ff] text-[15px]">Volver a clientes</Link>
      </div>
    )
  }

  const phoneUrl = `tel:${client.phone}`
  const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, "")}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`
  const newOrderUrl = `/orders/new?client_id=${client.id}`

  return (
    <div className="min-h-screen bg-[#121212] font-['Inter'] text-[#e4e1ed] selection:bg-[#c2c1ff]/30 pb-[100px]">
      <style dangerouslySetInnerHTML={{__html: `
        .ios-blur {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .active-scale:active {
            transform: scale(0.96);
            transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />

      {/* Top App Bar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-50 bg-[#13131b]/80 ios-blur border-b border-[#464554]/30 h-[64px] flex items-center justify-between px-[20px]">
        <Link href="/clients" className="active-scale text-[#c2c1ff] flex items-center">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>chevron_left</span>
        </Link>
        <h1 className="text-[20px] leading-[25px] font-semibold text-[#e4e1ed] truncate px-4">{client.name}</h1>
        <button 
          onClick={() => router.push(`/clients/${client.id}/edit`)}
          className="active-scale text-[#c2c1ff] text-[17px] leading-[22px] font-semibold"
        >
          Editar
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-[84px] pb-[20px] max-w-[400px] mx-auto px-[20px] flex flex-col gap-[12px]">
        {/* Saldo Destacado (Bento Card) */}
        <section className="relative overflow-hidden bg-[#5e5ce6] rounded-[3rem] p-6 flex flex-col justify-between h-[180px] shadow-2xl">
          <div className="z-10">
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/70 uppercase">Saldo Pendiente</span>
            <div className="text-[34px] leading-[41px] tracking-[-0.02em] font-bold text-white mt-1">{formatCurrency(client.outstanding_balance)}</div>
          </div>
          <div className="z-10 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/60">Límite de crédito</span>
              <span className="text-[15px] leading-[20px] font-normal text-white">{formatCurrency(client.credit_limit)}</span>
            </div>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-[17px] leading-[22px] font-semibold active-scale">
              Pagar
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#47e266]/20 rounded-full blur-2xl"></div>
        </section>

        {/* Action Buttons Grid */}
        <section className="grid grid-cols-3 gap-3">
          <a href={phoneUrl} className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
            <div className="w-10 h-10 rounded-full bg-[#09bf49]/20 flex items-center justify-center text-[#47e266]">
              <span className="material-symbols-outlined">call</span>
            </div>
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#c7c4d7]">Llamar</span>
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center bg-[#1f1f27] rounded-lg p-4 gap-2 active-scale border border-[#464554]/30">
            <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#c7c4d7]">WhatsApp</span>
          </a>
          <Link href={newOrderUrl} className="flex flex-col items-center justify-center bg-[#5e5ce6] rounded-lg p-4 gap-2 active-scale">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">add_shopping_cart</span>
            </div>
            <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-white/90">Pedido</span>
          </Link>
        </section>

        {/* Información de Contacto */}
        <section className="flex flex-col gap-3 mt-4">
          <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase px-1">Información de Contacto</h2>
          <div className="bg-[#1f1f27] rounded-xl overflow-hidden border border-[#464554]/30">
            {/* Row 1: Teléfono */}
            <div className="flex items-center p-4 gap-4 border-b border-[#464554]/20 active:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#c2c1ff]">phone_iphone</span>
              <div className="flex flex-col">
                <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Teléfono</span>
                <span className="text-[15px] leading-[20px] font-normal">{client.phone || "No disponible"}</span>
              </div>
            </div>
            {/* Row 2: Email */}
            <div className="flex items-center p-4 gap-4 border-b border-[#464554]/20 active:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#c2c1ff]">mail</span>
              <div className="flex flex-col">
                <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Email</span>
                <span className="text-[15px] leading-[20px] font-normal">{client.email || "No disponible"}</span>
              </div>
            </div>
            {/* Row 3: Dirección */}
            <div className="flex items-center p-4 gap-4 active:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-[#c2c1ff]">location_on</span>
              <div className="flex flex-col">
                <span className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0]">Dirección</span>
                <span className="text-[15px] leading-[20px] font-normal">{client.address || "No disponible"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Últimos Pedidos */}
        <section className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase">Últimos Pedidos</h2>
            <Link href={`/orders?client_id=${client.id}`} className="text-[13px] leading-[18px] font-normal text-[#c2c1ff]">Ver todos</Link>
          </div>
          <div className="flex flex-col gap-3">
            {ordersLoading ? (
              // Skeleton loading
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#34343d]" />
                    <div className="flex flex-col gap-2">
                      <div className="w-24 h-4 bg-[#34343d] rounded" />
                      <div className="w-16 h-3 bg-[#34343d] rounded" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="w-16 h-4 bg-[#34343d] rounded" />
                    <div className="w-12 h-4 bg-[#34343d] rounded-full" />
                  </div>
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="bg-[#2a2932] rounded-lg p-6 text-center border border-[#464554]/30">
                <span className="material-symbols-outlined text-[#918fa0] text-4xl">inbox</span>
                <p className="text-[15px] text-[#918fa0] mt-2">Sin pedidos recientes</p>
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="bg-[#2a2932] rounded-lg p-4 flex items-center justify-between border border-[#464554]/30 active-scale"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#34343d] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#918fa0]">inventory_2</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[17px] leading-[22px] font-semibold">Orden #{order.order_number}</span>
                      <span className="text-[13px] leading-[18px] font-normal text-[#918fa0]">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[17px] leading-[22px] font-semibold">{formatCurrency(order.total_value)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Map Section */}
        <section className="flex flex-col gap-3 mt-4">
          <h2 className="text-[11px] leading-[13px] tracking-[0.05em] font-semibold text-[#918fa0] uppercase px-1">Ruta de Entrega</h2>
          <a 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-40 rounded-xl overflow-hidden border border-[#464554]/30 relative active-scale bg-[#1f1f27] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#13131b] to-transparent opacity-60 z-10"></div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#1f1f27]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#464554]/30 z-20">
              <span className="material-symbols-outlined text-[#c2c1ff] text-sm">navigation</span>
              <span className="text-[13px] leading-[18px] font-normal text-[#e4e1ed]">Ver en mapa</span>
            </div>
            <span className="material-symbols-outlined text-[#918fa0] text-5xl z-10">map</span>
          </a>
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

Run: `cd web && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 3: Verificar que la página carga (developmente server)**

Run: `cd web && npm run dev`
Expected: Servidor inicia sin errores

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(dashboard\)/clients/\[id\]/page.tsx
git commit -m "feat: implement client detail page with real data"
```

---

### Task 8: Verificar integración completa

**Files:**
- Verify: All modified files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Funcionalidad completa verificada

- [ ] **Step 1: Ejecutar tests de backend**

Run: `cd backend && python -m pytest app/tests/test_clients.py -v`
Expected: Todos los tests pasan

- [ ] **Step 2: Verificar TypeScript en frontend**

Run: `cd web && npx tsc --noEmit`
Expected: Sin errores

- [ ] **Step 3: Verificar que el servidor backend funciona**

Run: `cd backend && python -m uvicorn app.main:app --reload`
Expected: Servidor inicia en http://localhost:8000

- [ ] **Step 4: Verificar que el frontend funciona**

Run: `cd web && npm run dev`
Expected: Servidor inicia en http://localhost:3000

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: complete client detail integration with backend"
```

---

## Resumen de tareas

| Task | Descripción | Archivos |
|------|-------------|----------|
| 1 | Schemas de respuesta | `schemas/client.py` |
| 2 | Service get_client_orders | `services/client_service.py` |
| 3 | Tests para get_client_orders | `tests/test_clients.py` |
| 4 | Endpoint GET /{id}/orders | `routers/clients.py` |
| 5 | Hook useClient | `hooks/useClient.ts` |
| 6 | Hook useClientOrders | `hooks/useClientOrders.ts` |
| 7 | Page.tsx completo | `clients/[id]/page.tsx` |
| 8 | Verificación final | Todos |

## Criterios de aceptación

1. ✅ Endpoint `GET /clients/{id}` retorna datos reales del cliente
2. ✅ Endpoint `GET /clients/{id}/orders` retorna pedidos del cliente
3. ✅ UI muestra datos reales del backend (no hardcodeados)
4. ✅ Loading states al cargar datos
5. ✅ Error handling con retry
6. ✅ Botón "Llamar" abre aplicación de teléfono
7. ✅ Botón "WhatsApp" abre chat de WhatsApp
8. ✅ Botón "Pedido" navega a nueva orden con cliente pre-seleccionado
9. ✅ Mapa abre Google Maps con dirección del cliente
10. ✅ Estilo consistente con UI existente
