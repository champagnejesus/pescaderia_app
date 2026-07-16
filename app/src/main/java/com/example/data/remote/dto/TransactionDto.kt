package com.example.data.remote.dto

import com.example.data.Transaction
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TransactionResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "title") val title: String,
    @Json(name = "time") val time: String,
    @Json(name = "type") val type: String,
    @Json(name = "amount") val amount: Double,
    @Json(name = "status") val status: String,
    @Json(name = "created_at") val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class DailySummaryResponse(
    @Json(name = "total_sales") val totalSales: Double,
    @Json(name = "total_expenses") val totalExpenses: Double,
    @Json(name = "net_total") val netTotal: Double,
    @Json(name = "cash_total") val cashTotal: Double,
    @Json(name = "card_total") val cardTotal: Double,
    @Json(name = "transaction_count") val transactionCount: Int
)

fun TransactionResponse.toEntity(): Transaction = Transaction(
    id = id,
    title = title,
    time = time,
    type = type,
    amount = amount,
    status = status
)

fun Transaction.toResponse(): TransactionResponse = TransactionResponse(
    id = id,
    title = title,
    time = time,
    type = type,
    amount = amount,
    status = status
)
