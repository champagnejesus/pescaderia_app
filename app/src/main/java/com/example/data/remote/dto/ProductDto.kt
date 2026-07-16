package com.example.data.remote.dto

import com.example.data.Product
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ProductResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "category") val category: String,
    @Json(name = "stock") val stock: Double,
    @Json(name = "unit") val unit: String,
    @Json(name = "price") val price: Double,
    @Json(name = "image_url") val imageUrl: String,
    @Json(name = "description") val description: String,
    @Json(name = "is_extra_quality") val isExtraQuality: Boolean,
    @Json(name = "low_stock_threshold") val lowStockThreshold: Double,
    @Json(name = "created_at") val createdAt: String? = null,
    @Json(name = "updated_at") val updatedAt: String? = null
)

fun ProductResponse.toEntity(): Product = Product(
    id = id,
    name = name,
    category = category,
    stock = stock,
    unit = unit,
    price = price,
    imageUrl = imageUrl,
    description = description,
    isExtraQuality = isExtraQuality,
    lowStockThreshold = lowStockThreshold
)

fun Product.toResponse(): ProductResponse = ProductResponse(
    id = id,
    name = name,
    category = category,
    stock = stock,
    unit = unit,
    price = price,
    imageUrl = imageUrl,
    description = description,
    isExtraQuality = isExtraQuality,
    lowStockThreshold = lowStockThreshold
)
