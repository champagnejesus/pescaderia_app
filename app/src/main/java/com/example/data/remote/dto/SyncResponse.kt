package com.example.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SyncPullResponse(
    @Json(name = "products") val products: List<ProductResponse> = emptyList(),
    @Json(name = "clients") val clients: List<ClientResponse> = emptyList(),
    @Json(name = "suppliers") val suppliers: List<SupplierResponse> = emptyList(),
    @Json(name = "orders") val orders: List<OrderResponse> = emptyList(),
    @Json(name = "transactions") val transactions: List<TransactionResponse> = emptyList(),
    @Json(name = "last_sync") val lastSync: String? = null
)

@JsonClass(generateAdapter = true)
data class SyncPushResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "synced_products") val syncedProducts: Int = 0,
    @Json(name = "synced_clients") val syncedClients: Int = 0,
    @Json(name = "synced_suppliers") val syncedSuppliers: Int = 0,
    @Json(name = "synced_orders") val syncedOrders: Int = 0,
    @Json(name = "synced_transactions") val syncedTransactions: Int = 0,
    @Json(name = "message") val message: String? = null
)
