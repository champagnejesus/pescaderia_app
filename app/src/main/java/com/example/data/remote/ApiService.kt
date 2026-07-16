package com.example.data.remote

import com.example.data.remote.dto.ClientResponse
import com.example.data.remote.dto.DailySummaryResponse
import com.example.data.remote.dto.LoginRequest
import com.example.data.remote.dto.OrderResponse
import com.example.data.remote.dto.ProductResponse
import com.example.data.remote.dto.RegisterRequest
import com.example.data.remote.dto.SupplierResponse
import com.example.data.remote.dto.TokenResponse
import com.example.data.remote.dto.TransactionResponse
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): TokenResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): TokenResponse

    @GET("products")
    suspend fun getProducts(
        @Query("search") search: String = "",
        @Query("category") category: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): List<ProductResponse>

    @GET("products/{id}")
    suspend fun getProduct(@Path("id") id: Int): ProductResponse

    @POST("products")
    suspend fun createProduct(@Body body: Map<String, @JvmSuppressWildcards Any>): ProductResponse

    @PUT("products/{id}")
    suspend fun updateProduct(
        @Path("id") id: Int,
        @Body body: Map<String, @JvmSuppressWildcards Any>
    ): ProductResponse

    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: Int)

    @PATCH("products/{id}/stock")
    suspend fun adjustStock(
        @Path("id") id: Int,
        @Body body: Map<String, @JvmSuppressWildcards Any>
    ): ProductResponse

    @GET("products/low-stock")
    suspend fun getLowStockProducts(): List<ProductResponse>

    @GET("clients")
    suspend fun getClients(
        @Query("search") search: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): List<ClientResponse>

    @POST("clients")
    suspend fun createClient(@Body body: Map<String, @JvmSuppressWildcards Any>): ClientResponse

    @GET("suppliers")
    suspend fun getSuppliers(
        @Query("search") search: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): List<SupplierResponse>

    @POST("suppliers")
    suspend fun createSupplier(@Body body: Map<String, @JvmSuppressWildcards Any>): SupplierResponse

    @GET("orders")
    suspend fun getOrders(
        @Query("status") status: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): List<OrderResponse>

    @POST("orders")
    suspend fun createOrder(@Body body: Map<String, @JvmSuppressWildcards Any>): OrderResponse

    @GET("transactions")
    suspend fun getTransactions(
        @Query("type") type: String = "",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50
    ): List<TransactionResponse>

    @GET("transactions/daily-summary")
    suspend fun getDailySummary(): DailySummaryResponse

    @GET("reports/dashboard")
    suspend fun getDashboard(): DashboardResponse

    @POST("sync/pull")
    suspend fun syncPull(@Body body: Map<String, @JvmSuppressWildcards Any>): SyncPullResponse

    @POST("sync/push")
    suspend fun syncPush(@Body body: Map<String, @JvmSuppressWildcards Any>): SyncPushResponse

    companion object {
        private const val DEFAULT_BASE_URL = "http://10.0.2.2:8000/api/v1/"

        fun create(
            baseUrl: String = DEFAULT_BASE_URL,
            tokenProvider: () -> String? = { null }
        ): ApiService {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val authInterceptor = Interceptor { chain ->
                val original = chain.request()
                val token = tokenProvider()
                val request = if (token != null) {
                    original.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                } else {
                    original
                }
                chain.proceed(request)
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .build()

            val moshi = Moshi.Builder()
                .addLast(KotlinJsonAdapterFactory())
                .build()

            val retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(MoshiConverterFactory.create(moshi))
                .build()

            return retrofit.create(ApiService::class.java)
        }
    }
}
