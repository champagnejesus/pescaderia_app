package com.example.data.remote.dto

import com.example.data.Client
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ClientResponse(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String,
    @Json(name = "phone") val phone: String,
    @Json(name = "email") val email: String,
    @Json(name = "address") val address: String,
    @Json(name = "outstanding_balance") val outstandingBalance: Double,
    @Json(name = "initials") val initials: String,
    @Json(name = "credit_limit") val creditLimit: Double,
    @Json(name = "created_at") val createdAt: String? = null
)

fun ClientResponse.toEntity(): Client = Client(
    id = id,
    name = name,
    phone = phone,
    email = email,
    address = address,
    outstandingBalance = outstandingBalance,
    initials = initials,
    creditLimit = creditLimit
)

fun Client.toResponse(): ClientResponse = ClientResponse(
    id = id,
    name = name,
    phone = phone,
    email = email,
    address = address,
    outstandingBalance = outstandingBalance,
    initials = initials,
    creditLimit = creditLimit
)
