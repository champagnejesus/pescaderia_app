package com.example.data.remote.dto

import com.example.data.Order
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class OrderItemResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "product_id") val productId: Int,
    @Json(name = "quantity") val quantity: Double,
    @Json(name = "unit_price") val unitPrice: Double,
    @Json(name = "subtotal") val subtotal: Double
)

@JsonClass(generateAdapter = true)
data class OrderResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "order_number") val orderNumber: String,
    @Json(name = "client_id") val clientId: Int,
    @Json(name = "client_name") val clientName: String,
    @Json(name = "delivery_date") val deliveryDate: String,
    @Json(name = "items_count") val itemsCount: Int,
    @Json(name = "status") val status: String,
    @Json(name = "total_value") val totalValue: Double,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "items") val items: List<OrderItemResponse> = emptyList()
)

fun OrderResponse.toEntity(): Order = Order(
    id = id,
    orderNumber = orderNumber,
    clientName = clientName,
    deliveryDate = deliveryDate,
    itemsCount = itemsCount,
    status = status,
    totalValue = totalValue
)

fun Order.toResponse(): OrderResponse = OrderResponse(
    id = id,
    orderNumber = orderNumber,
    clientId = 0,
    clientName = clientName,
    deliveryDate = deliveryDate,
    itemsCount = itemsCount,
    status = status,
    totalValue = totalValue
)
