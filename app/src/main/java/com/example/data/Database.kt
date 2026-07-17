package com.example.data

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ErpDao {
    // Products
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE id = :id")
    fun getProductById(id: Int): Flow<Product?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product)

    @Update
    suspend fun updateProduct(product: Product)

    @Query("UPDATE products SET stock = :newStock WHERE id = :id")
    suspend fun updateProductStock(id: Int, newStock: Double)

    @Delete
    suspend fun deleteProduct(product: Product)

    // Suppliers
    @Query("SELECT * FROM suppliers ORDER BY name ASC")
    fun getSuppliers(): Flow<List<Supplier>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSupplier(supplier: Supplier)

    // Clients
    @Query("SELECT * FROM clients ORDER BY name ASC")
    fun getClients(): Flow<List<Client>>

    @Query("SELECT * FROM clients WHERE id = :id")
    fun getClientById(id: Int): Flow<Client?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClient(client: Client)

    @Query("UPDATE clients SET outstandingBalance = :newBalance WHERE id = :id")
    suspend fun updateClientBalance(id: Int, newBalance: Double)

    // Orders
    @Query("SELECT * FROM orders ORDER BY id DESC")
    fun getOrders(): Flow<List<Order>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: Order)

    // Transactions
    @Query("SELECT * FROM transactions ORDER BY id DESC")
    fun getTransactions(): Flow<List<Transaction>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: Transaction)
}

@Database(
    entities = [
        Product::class,
        Supplier::class,
        Client::class,
        Order::class,
        Transaction::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun erpDao(): ErpDao
}
