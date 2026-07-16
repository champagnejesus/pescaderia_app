package com.example.data.remote.dto

import com.example.data.Supplier
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SupplierResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "category") val category: String,
    @Json(name = "pending_payment") val pendingPayment: Double,
    @Json(name = "status") val status: String,
    @Json(name = "image_url") val imageUrl: String,
    @Json(name = "created_at") val createdAt: String? = null
)

fun SupplierResponse.toEntity(): Supplier = Supplier(
    id = id,
    name = name,
    category = category,
    pendingPayment = pendingPayment,
    status = status,
    imageUrl = imageUrl
)

fun Supplier.toResponse(): SupplierResponse = SupplierResponse(
    id = id,
    name = name,
    category = category,
    pendingPayment = pendingPayment,
    status = status,
    imageUrl = imageUrl
)
