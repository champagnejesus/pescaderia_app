# Task 17: Android — DTOs + ApiService + RemoteDataSource

## Status: ✅ Complete

## Commit
`5fa6bca` - `feat(android): add DTOs, Retrofit ApiService, and RemoteDataSource`

## Files Created (10)

| File | Description |
|------|-------------|
| `app/.../remote/dto/AuthDto.kt` | LoginRequest, RegisterRequest, TokenResponse |
| `app/.../remote/dto/ProductDto.kt` | ProductResponse + toEntity/toResponse extensions |
| `app/.../remote/dto/ClientDto.kt` | ClientResponse + toEntity/toResponse extensions |
| `app/.../remote/dto/SupplierDto.kt` | SupplierResponse + toEntity/toResponse extensions |
| `app/.../remote/dto/OrderDto.kt` | OrderItemResponse, OrderResponse + extensions |
| `app/.../remote/dto/TransactionDto.kt` | TransactionResponse, DailySummaryResponse + extensions |
| `app/.../remote/dto/DashboardResponse.kt` | DashboardResponse DTO |
| `app/.../remote/dto/SyncResponse.kt` | SyncPullResponse, SyncPushResponse |
| `app/.../remote/ApiService.kt` | Retrofit interface + companion factory with auth interceptor |
| `app/.../remote/RemoteDataSource.kt` | Wraps ApiService, maps DTOs → Room entities |

## Concerns
- No Android SDK to verify compilation
- `Order.toResponse()` uses `clientId = 0` placeholder since Room Order entity lacks `clientId` field
- Moshi uses `@JsonClass(generateAdapter = true)` with `KotlinJsonAdapterFactory()` as fallback
