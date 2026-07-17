# Diseño: Detalle de Clientes

## Resumen

Implementar la funcionalidad completa de detalle de clientes, conectando la UI existente con el backend y agregando nuevas funcionalidades: pedidos recientes, acciones funcionales y mapa interactivo.

## Objetivo

- Conectar la página de detalle de clientes (`clients/[id]/page.tsx`) con el backend
- Mostrar información real del cliente desde la API
- Mostrar últimos 5 pedidos del cliente
- Implementar acciones funcionales: Llamar, WhatsApp, Crear Pedido
- Integrar mapa interactivo con dirección del cliente

## Alcance

### Incluido
- Endpoint backend para obtener pedidos de un cliente
- Conexión frontend-backend con loading states
- Acciones directas (teléfono, WhatsApp, navegación)
- Mapa interactivo con enlace a Google Maps
- Estilo consistente con UI existente

### No incluido
- Edición de cliente (ya existe endpoint)
- Historial completo de transacciones
- Geolocalización en tiempo real
- API key de Google Maps (usar enlace directo)

## Arquitectura

### Backend

#### Nuevo endpoint: `GET /clients/{client_id}/orders`

**Parámetros**:
- `client_id` (path): ID del cliente
- `limit` (query, optional): Límite de pedidos (default: 5)

**Response**:
```json
{
  "orders": [
    {
      "id": 8842,
      "order_number": "ORD-8842",
      "delivery_date": "2024-01-15",
      "items_count": 5,
      "status": "ENTREGADO",
      "total_value": 124.50,
      "created_at": "2024-01-15T09:15:00Z"
    }
  ],
  "total": 3
}
```

**Implementación**:
- Archivo: `backend/app/services/client_service.py`
- Función: `get_client_orders(db, client_id, limit)`
- Query: Filtra `Order.client_id == client_id`, ordena por `created_at` DESC
- Archivo: `backend/app/routers/clients.py`
- Endpoint: `GET /{client_id}/orders`

**Schema**:
```python
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

### Frontend

#### Estructura de datos

```typescript
interface ClientDetail {
  id: number
  name: string
  phone: string
  email: string
  address: string
  outstanding_balance: number
  credit_limit: number
  initials: string
}

interface ClientOrder {
  id: number
  order_number: string
  delivery_date: string | null
  items_count: number
  status: "PENDIENTE" | "ENTREGADO" | "CANCELADO"
  total_value: number
  created_at: string | null
}
```

#### Flujo de datos

1. `clients/[id]/page.tsx` obtiene `id` de params
2. Fetch a `/api/v1/clients/{id}` para datos del cliente
3. Fetch a `/api/v1/clients/{id}/orders` para pedidos
4. Loading states con skeleton
5. Error handling con retry

**Nota**: La API base URL es `http://localhost:8000/api/v1` (configurada en `web/src/lib/api.ts`)

#### Componentes a modificar

- `clients/[id]/page.tsx`: Convertir a Client Component con useState/useEffect
- Agregar hooks: `useClient(id)`, `useClientOrders(id)`
- Componentes existentes: `ClientStats`, `ClientCard` (no cambian)

#### Acciones funcionales

**Llamar**:
```typescript
<a href={`tel:${client.phone}`} className="...">
  Llamar
</a>
```

**WhatsApp**:
```typescript
<a 
  href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} 
  target="_blank"
  className="..."
>
  WhatsApp
</a>
```

**Pedido**:
```typescript
router.push(`/orders/new?client_id=${client.id}`)
```

#### Mapa interactivo

**Implementación**: Enlace directo a Google Maps (sin API key)

```typescript
<a 
  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
  target="_blank"
  className="..."
>
  Ver en mapa
</a>
```

**Estilo**: Mantener estilo dark consistente con borde redondeado y overlay de gradiente.

### Estilo y UX

#### Paleta de colores

- Fondo: `#121212`
- Superficie: `#1f1f27`, `#2a2932`
- Primario: `#c2c1ff` (botones, iconos)
- Secundario: `#47e266` (éxito, entregado)
- Terciario: `#eac400` (pendiente)
- Error: `#ffb4ab`

#### Tipografía

- Fuente: Inter (ya configurada)
- Tamaños: Mantener escala existente (11px labels, 13px sm, 15px base, 17px title, 20px headline, 34px display)

#### Componentes visuales

- Bento card de saldo: Gradiente `#5e5ce6` → `#47e266`
- Botones de acción: Iconos en círculos con bg semitransparente
- Lista de pedidos: Cards con borde `#464554/30`
- Badges de estado: Colores semánticos (verde=entregado, amarillo=pendiente)

#### Animaciones

- `active-scale` al tocar (ya existe)
- Transiciones suaves en hover
- Skeleton loading para datos

#### Responsive

- Max-width `400px` centrado (mobile-first)

## Archivos a modificar

### Backend
1. `backend/app/schemas/client.py` - Agregar schemas de respuesta
2. `backend/app/services/client_service.py` - Agregar función `get_client_orders`
3. `backend/app/routers/clients.py` - Agregar endpoint `GET /{client_id}/orders`

### Frontend
1. `web/src/app/(dashboard)/clients/[id]/page.tsx` - Convertir a Client Component
2. `web/src/hooks/useClient.ts` - Nuevo hook para datos del cliente (patrón similar a `useOrders.ts`)
3. `web/src/hooks/useClientOrders.ts` - Nuevo hook para pedidos del cliente (patrón similar a `useOrders.ts`)

**Nota**: `web/src/lib/api.ts` ya existe con axios configurado e interceptores de auth.

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

## Riesgos y mitigaciones

1. **Riesgo**: Google Maps puede requerir API key para embeds
   - **Mitigación**: Usar enlace directo (no embed)

2. **Riesgo**: Datos faltantes en cliente (phone, address)
   - **Mitigación**: Mostrar "No disponible" y deshabilitar acciones

3. **Riesgo**: Performance con muchos pedidos
   - **Mitigación**: Limitar a 5 pedidos, paginación en "Ver todos"

## Pruebas

1. Unit tests para `get_client_orders` en service
2. Integration tests para endpoint
3. Tests de UI para componentes
4. Tests de accesibilidad

## Futuras mejoras

1. Paginación de pedidos
2. Filtros por estado
3. Historial de transacciones
4. Notas del cliente
5. Geolocalización en tiempo real
