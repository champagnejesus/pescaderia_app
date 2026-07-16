package com.example.data.remote.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class DashboardResponse(
    @Json(name = "total_products") val totalProducts: Int,
    @Json(name = "total_clients") val totalClients: Int,
    @Json(name = "total_suppliers") val totalSuppliers: Int,
    @Json(name = "total_orders") val totalOrders: Int,
    @Json(name = "total_sales") val totalSales: Double,
    @Json(name = "total_expenses") val totalExpenses: Double,
    @Json(name = "low_stock_count") val lowStockCount: Int,
    @Json(name = "pending_orders_count") val pendingOrdersCount: Int
)
