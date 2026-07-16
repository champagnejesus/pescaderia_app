package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.room.Room
import com.example.data.AppDatabase
import com.example.data.Client
import com.example.data.Order
import com.example.data.Product
import com.example.data.ErpRepository
import com.example.data.Supplier
import com.example.data.Transaction
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ErpViewModel(application: Application) : AndroidViewModel(application) {

    private val db = Room.databaseBuilder(
        application,
        AppDatabase::class.java,
        "abyssal_erp_database"
    ).build()

    private val repository = ErpRepository(db.erpDao())

    val products: StateFlow<List<Product>> = repository.products
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val suppliers: StateFlow<List<Supplier>> = repository.suppliers
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val clients: StateFlow<List<Client>> = repository.clients
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val orders: StateFlow<List<Order>> = repository.orders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val transactions: StateFlow<List<Transaction>> = repository.transactions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun getProductById(id: Int): Flow<Product?> = repository.getProductById(id)

    // Authentication State
    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _loginError = MutableStateFlow<String?>(null)
    val loginError: StateFlow<String?> = _loginError.asStateFlow()

    private val _isDarkMode = MutableStateFlow(true)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    fun toggleTheme() {
        _isDarkMode.value = !_isDarkMode.value
    }

    init {
        viewModelScope.launch {
            repository.prepopulateIfEmpty()
        }
    }

    fun login(username: String, psw: String): Boolean {
        if (username.lowercase() == "admin_peces" && psw == "admin123") {
            _isLoggedIn.value = true
            _loginError.value = null
            return true
        } else {
            _loginError.value = "Credenciales incorrectas. Prueba admin_peces / admin123"
            return false
        }
    }

    fun logout() {
        _isLoggedIn.value = false
    }

    // Business Logic Actions
    fun adjustProductStock(productId: Int, newStock: Double) {
        viewModelScope.launch {
            repository.updateProductStock(productId, newStock)
        }
    }

    fun addNewProduct(product: Product) {
        viewModelScope.launch {
            repository.insertProduct(product)
        }
    }

    fun deleteProduct(product: Product) {
        viewModelScope.launch {
            repository.deleteProduct(product)
        }
    }

    fun addNewSupplier(supplier: Supplier) {
        viewModelScope.launch {
            repository.insertSupplier(supplier)
        }
    }

    fun addNewClient(client: Client) {
        viewModelScope.launch {
            repository.insertClient(client)
        }
    }

    fun createOrder(
        client: Client,
        selectedProducts: Map<Product, Int>,
        paymentMethod: String
    ) {
        viewModelScope.launch {
            val total = selectedProducts.entries.sumOf { (product, qty) ->
                product.price * qty
            }
            val formatter = SimpleDateFormat("dd Oct yyyy, HH:mm", Locale.getDefault())
            val dateStr = formatter.format(Date())
            val orderNo = "ORD-${(1000..9999).random()}"

            // 1. Insert order
            val newOrder = Order(
                orderNumber = orderNo,
                clientName = client.name,
                deliveryDate = "Hoy, " + SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date()),
                itemsCount = selectedProducts.values.sum(),
                status = "PENDIENTE",
                totalValue = total
            )
            repository.insertOrder(newOrder)

            // 2. Adjust product stock
            selectedProducts.forEach { (prod, qty) ->
                val remainingStock = maxOf(0.0, prod.stock - qty)
                repository.updateProductStock(prod.id, remainingStock)
            }

            // 3. Update outstanding balance for client if payment is Transfer
            if (paymentMethod == "Transferencia") {
                val newBalance = client.outstandingBalance + total
                repository.updateClientBalance(client.id, newBalance)
            }

            // 4. Create financial transaction log
            val tx = Transaction(
                title = "Venta: ${client.name}",
                time = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date()),
                type = when (paymentMethod) {
                    "Efectivo" -> "Efectivo"
                    "Transferencia" -> "Transfer"
                    else -> "Tarjeta"
                },
                amount = total,
                status = "PAGADO"
            )
            repository.insertTransaction(tx)
        }
    }

    fun addExpense(title: String, amount: Double) {
        viewModelScope.launch {
            val tx = Transaction(
                title = title,
                time = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date()),
                type = "Gasto",
                amount = -amount,
                status = "EGRESO"
            )
            repository.insertTransaction(tx)
        }
    }
}
