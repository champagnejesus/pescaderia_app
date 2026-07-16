package com.example.data.remote

import com.example.data.Client
import com.example.data.Order
import com.example.data.Product
import com.example.data.Supplier
import com.example.data.Transaction
import com.example.data.remote.dto.DailySummaryResponse
import com.example.data.remote.dto.toEntity
import com.example.data.remote.dto.toResponse

class RemoteDataSource(private val api: ApiService) {

    suspend fun fetchProducts(
        search: String = "",
        category: String = "",
        page: Int = 1,
        limit: Int = 50
    ): List<Product> = api.getProducts(search, category, page, limit).map { it.toEntity() }

    suspend fun fetchProduct(id: Int): Product = api.getProduct(id).toEntity()

    suspend fun createProduct(product: Product): Product =
        api.createProduct(product.toResponse()).toEntity()

    suspend fun updateProduct(product: Product): Product =
        api.updateProduct(product.id, product.toResponse()).toEntity()

    suspend fun deleteProduct(id: Int) = api.deleteProduct(id)

    suspend fun adjustStock(id: Int, body: Map<String, @JvmSuppressWildcards Any>): Product =
        api.adjustStock(id, body).toEntity()

    suspend fun fetchLowStockProducts(): List<Product> =
        api.getLowStockProducts().map { it.toEntity() }

    suspend fun fetchClients(
        search: String = "",
        page: Int = 1,
        limit: Int = 50
    ): List<Client> = api.getClients(search, page, limit).map { it.toEntity() }

    suspend fun createClient(client: Client): Client =
        api.createClient(client.toResponse()).toEntity()

    suspend fun fetchSuppliers(
        search: String = "",
        page: Int = 1,
        limit: Int = 50
    ): List<Supplier> = api.getSuppliers(search, page, limit).map { it.toEntity() }

    suspend fun createSupplier(supplier: Supplier): Supplier =
        api.createSupplier(supplier.toResponse()).toEntity()

    suspend fun fetchOrders(
        status: String = "",
        page: Int = 1,
        limit: Int = 50
    ): List<Order> = api.getOrders(status, page, limit).map { it.toEntity() }

    suspend fun createOrder(body: Map<String, @JvmSuppressWildcards Any>): Order =
        api.createOrder(body).toEntity()

    suspend fun fetchTransactions(
        type: String = "",
        page: Int = 1,
        limit: Int = 50
    ): List<Transaction> = api.getTransactions(type, page, limit).map { it.toEntity() }

    suspend fun fetchDailySummary(): DailySummaryResponse = api.getDailySummary()

    suspend fun fetchDashboard(): DashboardResponse = api.getDashboard()

    suspend fun syncPull(body: Map<String, @JvmSuppressWildcards Any>): SyncPullResponse =
        api.syncPull(body)

    suspend fun syncPush(body: Map<String, @JvmSuppressWildcards Any>): SyncPushResponse =
        api.syncPush(body)
}
