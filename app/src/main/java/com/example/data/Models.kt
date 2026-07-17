package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class Product(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val category: String,
    val stock: Double,
    val unit: String = "kg",
    val price: Double,
    val imageUrl: String,
    val description: String,
    val isExtraQuality: Boolean = false,
    val lowStockThreshold: Double = 10.0
)

@Entity(tableName = "suppliers")
data class Supplier(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val category: String,
    val pendingPayment: Double,
    val status: String, // "PENDIENTE", "AL DÍA"
    val imageUrl: String
)

@Entity(tableName = "clients")
data class Client(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val phone: String,
    val email: String,
    val address: String,
    val outstandingBalance: Double,
    val initials: String,
    val creditLimit: Double = 1500.0
)

@Entity(tableName = "orders")
data class Order(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val orderNumber: String,
    val clientName: String,
    val deliveryDate: String,
    val itemsCount: Int,
    val status: String, // "PENDIENTE", "ENTREGADO", "ANULADO"
    val totalValue: Double
)

@Entity(tableName = "transactions")
data class Transaction(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val time: String,
    val type: String, // "Efectivo", "Tarjeta", "Gasto"
    val amount: Double,
    val status: String // "PAGADO", "EGRESO"
)
