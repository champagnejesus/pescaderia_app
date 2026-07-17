### Task 17: Android — DTOs + ApiService + RemoteDataSource

**Context:** Existing Android Room entities use `camelCase` fields. Backend API returns `snake_case` JSON. App already has Retrofit, OkHttp, Moshi, and logging-interceptor in build.gradle.kts dependencies.

**Files to create:**
- `app/src/main/java/com/example/data/remote/dto/AuthDto.kt`
- `app/src/main/java/com/example/data/remote/dto/ProductDto.kt`
- `app/src/main/java/com/example/data/remote/dto/ClientDto.kt`
- `app/src/main/java/com/example/data/remote/dto/SupplierDto.kt`
- `app/src/main/java/com/example/data/remote/dto/OrderDto.kt`
- `app/src/main/java/com/example/data/remote/dto/TransactionDto.kt`
- `app/src/main/java/com/example/data/remote/ApiService.kt`
- `app/src/main/java/com/example/data/remote/RemoteDataSource.kt`

**DTOs** — Use `@JsonClass` (Moshi) or regular data classes with `@field:Json(name = "...")` for snake_case mapping. Package: `com.example.data.remote.dto`.

DTO fields must match the backend API (FastAPI Pydantic schemas). You can infer the mapping from the existing Room entity fields.

Backend API base URL: configurable, default `http://10.0.2.2:8000/api/v1` (emulator localhost).

**DTO specifications:**

`AuthDto.kt`:
- `LoginRequest(email: String, password: String)`
- `RegisterRequest(business_name: String, owner_name: String, email: String, password: String, phone: String? = null)`
- `TokenResponse(access_token: String, token_type: String = "bearer", business_name: String, owner_name: String)`

`ProductDto.kt`:
- `ProductResponse(id: Int, name: String, category: String, stock: Double, unit: String, price: Double, image_url: String, description: String, is_extra_quality: Boolean, low_stock_threshold: Double, created_at: String? = null, updated_at: String? = null)`

`ClientDto.kt`:
- `ClientResponse(id: Int, name: String, phone: String, email: String, address: String, outstanding_balance: Double, initials: String, credit_limit: Double, created_at: String? = null)`

`SupplierDto.kt`:
- `SupplierResponse(id: Int, name: String, category: String, pending_payment: Double, status: String, image_url: String, created_at: String? = null)`

`OrderDto.kt`:
- `OrderItemResponse(id: Int, product_id: Int, quantity: Double, unit_price: Double, subtotal: Double)`
- `OrderResponse(id: Int, order_number: String, client_id: Int, client_name: String, delivery_date: String, items_count: Int, status: String, total_value: Double, created_at: String? = null, items: List<OrderItemResponse> = emptyList())`

`TransactionDto.kt`:
- `TransactionResponse(id: Int, title: String, time: String, type: String, amount: Double, status: String, created_at: String? = null)`
- `DailySummaryResponse(total_sales: Double, total_expenses: Double, net_total: Double, cash_total: Double, card_total: Double, transaction_count: Int)`

**ApiService.kt** — Retrofit interface:
```kotlin
interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): TokenResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): TokenResponse

    @GET("products")
    suspend fun getProducts(@Query("search") search: String = "", @Query("category") category: String = "", @Query("page") page: Int = 1, @Query("limit") limit: Int = 50): List<ProductResponse>

    @GET("products/{id}")
    suspend fun getProduct(@Path("id") id: Int): ProductResponse

    @POST("products")
    suspend fun createProduct(@Body body: Map<String, @JvmSuppressWildcards Any>): ProductResponse

    @PUT("products/{id}")
    suspend fun updateProduct(@Path("id") id: Int, @Body body: Map<String, @JvmSuppressWildcards Any>): ProductResponse

    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: Int)

    @PATCH("products/{id}/stock")
    suspend fun adjustStock(@Path("id") id: Int, @Body body: Map<String, @JvmSuppressWildcards Any>): ProductResponse

    @GET("products/low-stock")
    suspend fun getLowStockProducts(): List<ProductResponse>

    @GET("clients")
    suspend fun getClients(@Query("search") search: String = "", @Query("page") page: Int = 1, @Query("limit") limit: Int = 50): List<ClientResponse>

    @POST("clients")
    suspend fun createClient(@Body body: Map<String, @JvmSuppressWildcards Any>): ClientResponse

    @GET("suppliers")
    suspend fun getSuppliers(@Query("search") search: String = "", @Query("page") page: Int = 1, @Query("limit") limit: Int = 50): List<SupplierResponse>

    @POST("suppliers")
    suspend fun createSupplier(@Body body: Map<String, @JvmSuppressWildcards Any>): SupplierResponse

    @GET("orders")
    suspend fun getOrders(@Query("status") status: String = "", @Query("page") page: Int = 1, @Query("limit") limit: Int = 50): List<OrderResponse>

    @POST("orders")
    suspend fun createOrder(@Body body: Map<String, @JvmSuppressWildcards Any>): OrderResponse

    @GET("transactions")
    suspend fun getTransactions(@Query("type") type: String = "", @Query("page") page: Int = 1, @Query("limit") limit: Int = 50): List<TransactionResponse>

    @GET("transactions/daily-summary")
    suspend fun getDailySummary(): DailySummaryResponse

    @GET("reports/dashboard")
    suspend fun getDashboard(): DashboardResponse

    @POST("sync/pull")
    suspend fun syncPull(@Body body: Map<String, @JvmSuppressWildcards Any>): SyncPullResponse

    @POST("sync/push")
    suspend fun syncPush(@Body body: Map<String, @JvmSuppressWildcards Any>): SyncPushResponse
}
```

Include a companion object with a factory method that creates the Retrofit instance with:
- OkHttp client with logging interceptor
- Moshi converter
- Auth token interceptor (reads from shared prefs or memory)
- Base URL from a config constant or BuildConfig

**RemoteDataSource.kt** — Wraps ApiService calls and maps DTOs to Room entities:
```kotlin
class RemoteDataSource(private val api: ApiService) {
    // Each method calls api, maps DTO → Room entity
    // Example:
    // suspend fun fetchProducts(): List<Product> = api.getProducts().map { it.toEntity() }
    // Where toEntity() is an extension function on ProductResponse
}
```

Include extension functions on each DTO to convert to the corresponding Room entity (from `com.example.data` package), and vice versa where needed.

**Commit:**
```bash
git add app/src/main/java/com/example/data/remote/
git commit -m "feat(android): add DTOs, Retrofit ApiService, and RemoteDataSource"
```
