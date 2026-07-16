package com.example.data

import com.example.data.remote.RemoteDataSource
import com.example.data.remote.dto.toResponse
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlin.jvm.JvmSuppressWildcards

class ErpRepository(
    private val erpDao: ErpDao,
    private val remoteDataSource: RemoteDataSource? = null
) {

    val products: Flow<List<Product>> = erpDao.getProducts()
    val suppliers: Flow<List<Supplier>> = erpDao.getSuppliers()
    val clients: Flow<List<Client>> = erpDao.getClients()
    val orders: Flow<List<Order>> = erpDao.getOrders()
    val transactions: Flow<List<Transaction>> = erpDao.getTransactions()

    fun getProductById(id: Int): Flow<Product?> = erpDao.getProductById(id)
    fun getClientById(id: Int): Flow<Client?> = erpDao.getClientById(id)

    suspend fun insertProduct(product: Product) {
        erpDao.insertProduct(product)
        remoteDataSource?.let { remote ->
            try { remote.createProduct(product.toResponse()) } catch (_: Exception) { }
        }
    }

    suspend fun updateProduct(product: Product) {
        erpDao.updateProduct(product)
        remoteDataSource?.let { remote ->
            try { remote.updateProduct(product) } catch (_: Exception) { }
        }
    }

    suspend fun updateProductStock(id: Int, stock: Double) {
        erpDao.updateProductStock(id, stock)
        remoteDataSource?.let { remote ->
            try { remote.adjustStock(id, mapOf("stock" to stock)) } catch (_: Exception) { }
        }
    }

    suspend fun deleteProduct(product: Product) {
        erpDao.deleteProduct(product)
        remoteDataSource?.let { remote ->
            try { remote.deleteProduct(product.id) } catch (_: Exception) { }
        }
    }

    suspend fun insertSupplier(supplier: Supplier) {
        erpDao.insertSupplier(supplier)
        remoteDataSource?.let { remote ->
            try { remote.createSupplier(supplier.toResponse()) } catch (_: Exception) { }
        }
    }

    suspend fun insertClient(client: Client) {
        erpDao.insertClient(client)
        remoteDataSource?.let { remote ->
            try { remote.createClient(client.toResponse()) } catch (_: Exception) { }
        }
    }

    suspend fun updateClientBalance(id: Int, balance: Double) {
        erpDao.updateClientBalance(id, balance)
        remoteDataSource?.let { remote ->
            try {
                val client = erpDao.getClientById(id).first() ?: return@let
                remote.createClient(client.copy(outstandingBalance = balance))
            } catch (_: Exception) { }
        }
    }

    suspend fun insertOrder(order: Order) {
        erpDao.insertOrder(order)
        remoteDataSource?.let { remote ->
            try { remote.createOrder(order.toRequestBody()) } catch (_: Exception) { }
        }
    }

    suspend fun insertTransaction(transaction: Transaction) = erpDao.insertTransaction(transaction)

    private fun Order.toRequestBody(): Map<String, @JvmSuppressWildcards Any> = mapOf(
        "order_number" to orderNumber,
        "client_name" to clientName,
        "delivery_date" to deliveryDate,
        "items_count" to itemsCount,
        "status" to status,
        "total_value" to totalValue
    )

    suspend fun prepopulateIfEmpty() {
        // Prepopulate Products
        val currentProducts = products.first()
        if (currentProducts.isEmpty()) {
            val defaultProducts = listOf(
                Product(
                    name = "Salmón Atlántico",
                    category = "PESCADO BLANCO",
                    stock = 8.5,
                    unit = "kg",
                    price = 18.5,
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDvUHXNBPmj4VbYMJZgOg9nsHbB1l4agwpRXXaJxZM_ncnPW0Z2xvsbqQKD6axggUX9Dxd9v6TxpZ-AKzrG_s8hm0lzD3ySL5ydpZNUwg_YNZdFzVbsl7a-PdavqjJjerEFRkAlDlkcKOBNvtxhDJZWVIy0WJh6Tp-DpSPc8TtFhMKXFrUtGm_XJRaCykSAENz-izI6qwX7NJ0aZtMBPlIRjhvEa2v8dI2TzmalZsu247GyNKEH8TPfWH7sJlZx9nkkOVHGN0GAam4",
                    description = "Salmón Atlántico (Salmo salar) de origen noruego. Piezas enteras o fileteadas, frescura garantizada con menos de 48h desde captura. Carne firme de sabor intenso y alto contenido en Omega-3.",
                    isExtraQuality = true,
                    lowStockThreshold = 10.0
                ),
                Product(
                    name = "Gambón Salvaje",
                    category = "CONGELADOS",
                    stock = 42.0,
                    unit = "kg",
                    price = 24.90,
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCcoSRfGcm-JOOS8LesrTfn7OX7XMsGZAB5Fbmxgkn-6FQyWv5IgwxMW9eClUvKcn3_HWb2322iXWkntCxG0tZIr20OAkkzrRaDVL7e-jHxANOVh0JmOT3VeL5gA_jTWUlags4iZI0Az_M8js6PvD6Pdow13Uc1wxd5H2TEWp-lOQl8ZRS0tjCE1p5NH8lCA2gB67REKXE-V5gDOOHSkfJeKp0cba8HgGgDcv_7HDwBntm9lYsluAs-bUy1e9-o8JxUNExIfDlKZgg",
                    description = "Gambón salvaje congelado a bordo de categoría L1. Textura carnosa y sabor dulce, perfectos para plancha o guisos marineros.",
                    isExtraQuality = false,
                    lowStockThreshold = 15.0
                ),
                Product(
                    name = "Lubina de Estero",
                    category = "PESCADO BLANCO",
                    stock = 15.2,
                    unit = "kg",
                    price = 12.75,
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAg5eUyjv0G7C8fKJDnDatNwIL79EqGiUjfF2TSxFZIXEY6GJPgORkyHwkfCbTaTcDAH9jWfkH6UoI7ugPse6bbCpwTElSH6V-Jg1AvP5mINE_YH4uozy5jXqELK0Bfhr4PoDpmE0KhfPNih7X10tg9LF6ym4f4OBbzvpEleWITeGoTPP4oW_XH9En5ZUVR3QkDcOIxNMgDl0LZwbkNOL_GaJNQcFo8FZ9JfxHUNgplDG38zDlaPw8oDXS3IApl4c8L_V-ZHLOICTY",
                    description = "Lubina de estero fresca, calibre 600/800g. Sabor suave y carne blanca magra, ideal para horno o a la sal.",
                    isExtraQuality = false,
                    lowStockThreshold = 10.0
                ),
                Product(
                    name = "Pulpo Nacional",
                    category = "MARISCO",
                    stock = 4.1,
                    unit = "kg",
                    price = 19.20,
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDR6zHLZF5NMZESskA2jGUhibawtYoQMz6UYP48aOx76bWOa3KuT6Mij20vj_lO1VwmWpOVQqomHKpa8in2Uhzurzvekkv4Qg0FgWRfD7j02zAmeu_5wLfVoAOqxbar_ba_NT-qrJIGjoIfVR8DP0siKrzGdVyJr5fz11VkBHnLivDpPf6fcQYH-vM-J6nbahxUvPsoCt3n8CHGbiJt1NTzt8fJBwppNVYrDNcohqMMjwN5gxwIM06XpWiNQK3x2iKpNQn0hDaNW2Y",
                    description = "Pulpo de origen gallego fresco, calibre T2. Sabor intenso y textura ideal para el tradicional pulpo a la gallega.",
                    isExtraQuality = true,
                    lowStockThreshold = 5.0
                ),
                Product(
                    name = "Merluza de Pincho",
                    category = "PESCADO BLANCO",
                    stock = 22.8,
                    unit = "kg",
                    price = 21.40,
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuA1qsz7NCVgMZzGGA2jSB8sn7oaOBw_rm5hcTkk8P23UQ9ZabXuarDz2IHXqdtOu16FDfPXJKC_HfL_MvfFsUYFRLXgO_yukiPt3JrP84dUcjtVe57FtLbJFh0u8088P3cZTA1CBAKYzbZK2njnLmuxz4KLggyBirtuIgSAgV_DSuED9sxSQzgNl_G9DW_Jw1RCIlRArl379MqemypGaeA3gF9zny5WcmxtdsJwjhHD_Jc7JnapkdHEshlOb0BWmkQqS2RBpmvpeJM",
                    description = "Merluza de pincho fresca, lomos limpios listos para cocinar. Delicada textura y frescura incomparable.",
                    isExtraQuality = false,
                    lowStockThreshold = 10.0
                )
            )
            for (p in defaultProducts) {
                erpDao.insertProduct(p)
            }
        }

        // Prepopulate Suppliers
        val currentSuppliers = suppliers.first()
        if (currentSuppliers.isEmpty()) {
            val defaultSuppliers = listOf(
                Supplier(
                    name = "Mariscos del Cantábrico",
                    category = "Mariscos",
                    pendingPayment = 14200.0,
                    status = "PENDIENTE",
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDx3ZQ-qsUv5Po8lsa9DtitsYgzNVbCoL5r4YHHZaDOWq3Dr-prfZpJnBEwt9b7ymkjph5PnX6dVuQCKXivdl-wsfNymsh1BfDmzaLu8io0WHBuLwr71PzBydEo5ZCMf_LtXJ--TnqihzRag6kuF9Zn2Zxyb_HJq7HlsNzuh4sRMNrIZQREwhQevqvnhchDH_69lLhccoc4Az2p2xdpH-C0WxDv_HIwmo5IJ93lmdxuHXB4ghGVgKTiviYep43GFdLXH7PsAKs8zRg"
                ),
                Supplier(
                    name = "Pescaderías Unidos S.A.",
                    category = "Pescado Blanco",
                    pendingPayment = 0.0,
                    status = "AL DÍA",
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDjYx9HI2ie31ElfFCiNtcQ3rIYV-lrsavKSyK3XPNmfINgkLu1CmskouZ2ecOvixBrlfpjQEXiSq3gCeTsJoiEOU0lW06To3x_pRT_yxu8qLDIkiiqYNhfV-1bm8ITxgCeWpEDywiapdyT-hAFHyLgjVRBb_l9LAWridQwxNEpMh78l-EGP_BR9B1pfDh_fFPnQCLu5NAswcWDvXY9OAZZJJ8fsJPv3JOhlgHWE9zPQuyvO5I0f3kWQxMPf0FplHbzXylN-Ut1VGQ"
                ),
                Supplier(
                    name = "Logística Frío Polar",
                    category = "Transporte / Congelados",
                    pendingPayment = 2300.0,
                    status = "PENDIENTE",
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBUkEYp055dkLkUWOu6d5FlYYf3j11swD2vLHXJ4SUCr_PhPu1k21GhqSfH2C-tMYAp2MaF45hVZUdJ8QA5jH2QZtblDabUR3o852LJmPwurjOJwvOy8KAJ3xKx5ULQ2LBp1dS8wW7eaCSHAppC8kxXyVAj8Jw2YDgtFc1Zuvcpw07KqEDwHXlZm5rjOl_n1-Td5wvCXt4xqhYxS3mc7Oko9rR9otcGzdS3Z7IeH9dubyGx232qcg724y3e0Jb6swJjpafWhh7luXk"
                ),
                Supplier(
                    name = "Ostras Gallaecia",
                    category = "Moluscos",
                    pendingPayment = 0.0,
                    status = "AL DÍA",
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAWJ_j2mrXVkf8cp2hXiVWL-9egk1Ch-N_yPePQ5qrFRemiLfb822BRB0E4CDRGSV3Rx23b3y_8_b8aO586_OiU2FgPZ14qGGOfgI80MmkheYtDvcNU_6PG677deUBV0vGtvHAfwkQ3ZLHbqXtAsBNpIU95St8kiU4E1fAmAVYkAOYsYVrH1qIVIoHQlPEeHg53azyfjf025A3mGYLbxG9kf3nTnEWI2jhiAWMTAVzgEUZIbkYk66fXgdRXNyoA579hf9g2MiBhjH0"
                ),
                Supplier(
                    name = "Atuneros del Sur",
                    category = "Pescado Azul / Atún",
                    pendingPayment = 0.0,
                    status = "AL DÍA",
                    imageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuCLWdlmRmVYpPA9qBwX8WqlZDX3Ey8hpvD3CnJl-EHjyd8TTL_tcsAz_kF2ipIwwRvm6TyUPOWCgeIwZvHtSLCTUQx8tt2bJDG53RI8FGdj13YadkB-kHbbrGtYMlvt2WFowpQiOEIOW9Qn52slgwkEM-tMn0jqsVYRyMytJtq1TTyu2vwyqeMY87YZTcOSxlXr_Q1msnM_O8IZ5WV0ciI_FtftCZbPpPO_McBf8afuzqiPwvJoPZuWAImUfq116v-h_-6siQHc6QE"
                )
            )
            for (s in defaultSuppliers) {
                erpDao.insertSupplier(s)
            }
        }

        // Prepopulate Clients
        val currentClients = clients.first()
        if (currentClients.isEmpty()) {
            val defaultClients = listOf(
                Client(
                    name = "Juan Rodríguez",
                    phone = "+34 612 345 678",
                    email = "juan.rodriguez@pescaexpress.es",
                    address = "Calle del Mar, 12. Mercamadrid, Nave 4.",
                    outstandingBalance = 450.00,
                    initials = "JR",
                    creditLimit = 1500.0
                ),
                Client(
                    name = "María López",
                    phone = "+34 654 987 321",
                    email = "maria.lopez@mercamadrid.es",
                    address = "Avenida de la Marina, 45. Mercamadrid.",
                    outstandingBalance = 1240.50,
                    initials = "ML",
                    creditLimit = 2000.0
                ),
                Client(
                    name = "Carlos Hernández",
                    phone = "+34 633 112 233",
                    email = "carlos.h@pescaderiacentral.com",
                    address = "Mercamadrid, Nave 3, Puesto 12",
                    outstandingBalance = 0.0,
                    initials = "CH",
                    creditLimit = 1000.0
                ),
                Client(
                    name = "Ana Martínez",
                    phone = "+34 600 000 001",
                    email = "ana.m@hotelymar.es",
                    address = "Paseo Marítimo, 100. Madrid.",
                    outstandingBalance = 89.20,
                    initials = "AM",
                    creditLimit = 1500.0
                ),
                Client(
                    name = "Pedro Varela",
                    phone = "+34 611 222 333",
                    email = "pedro.varela@pescaexpress.es",
                    address = "Calle Pescadores, 8. Mercamadrid.",
                    outstandingBalance = 312.00,
                    initials = "PV",
                    creditLimit = 1000.0
                )
            )
            for (c in defaultClients) {
                erpDao.insertClient(c)
            }
        }

        // Prepopulate Orders
        val currentOrders = orders.first()
        if (currentOrders.isEmpty()) {
            val defaultOrders = listOf(
                Order(
                    orderNumber = "ORD-9823",
                    clientName = "Restaurante El Faro",
                    deliveryDate = "Hoy, 14:00",
                    itemsCount = 12,
                    status = "PENDIENTE",
                    totalValue = 1420.00
                ),
                Order(
                    orderNumber = "ORD-9821",
                    clientName = "Marisquería Bahia",
                    deliveryDate = "Entregado ayer",
                    itemsCount = 5,
                    status = "ENTREGADO",
                    totalValue = 850.25
                ),
                Order(
                    orderNumber = "ORD-9818",
                    clientName = "Hotel Continental",
                    deliveryDate = "Motivo: Falta stock",
                    itemsCount = 24,
                    status = "ANULADO",
                    totalValue = 3100.00
                ),
                Order(
                    orderNumber = "ORD-9815",
                    clientName = "Casa de la Langosta",
                    deliveryDate = "Entrega: Mañana",
                    itemsCount = 8,
                    status = "PENDIENTE",
                    totalValue = 540.00
                ),
                Order(
                    orderNumber = "ORD-9810",
                    clientName = "Sushiman Club",
                    deliveryDate = "Entregado 2 días atrás",
                    itemsCount = 15,
                    status = "ENTREGADO",
                    totalValue = 2890.00
                )
            )
            for (o in defaultOrders) {
                erpDao.insertOrder(o)
            }
        }

        // Prepopulate Transactions
        val currentTransactions = transactions.first()
        if (currentTransactions.isEmpty()) {
            val defaultTransactions = listOf(
                Transaction(
                    title = "Venta Mostrador",
                    time = "14:20",
                    type = "Efectivo",
                    amount = 45.00,
                    status = "PAGADO"
                ),
                Transaction(
                    title = "Pago Proveedor: Hielo",
                    time = "13:45",
                    type = "Gasto",
                    amount = -120.00,
                    status = "EGRESO"
                ),
                Transaction(
                    title = "Pedido Restaurante Azul",
                    time = "12:10",
                    type = "Tarjeta",
                    amount = 890.00,
                    status = "PAGADO"
                )
            )
            for (t in defaultTransactions) {
                erpDao.insertTransaction(t)
            }
        }
    }
}
