package com.example.data.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.data.ErpDao
import com.example.data.remote.RemoteDataSource
import com.example.data.remote.dto.toEntity

class SyncWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val remote = remoteDataSource ?: return Result.failure()
        val dao = erpDao ?: return Result.failure()

        return try {
            val response = remote.syncPull(emptyMap())
            response.products.forEach { dao.insertProduct(it.toEntity()) }
            response.clients.forEach { dao.insertClient(it.toEntity()) }
            response.suppliers.forEach { dao.insertSupplier(it.toEntity()) }
            response.orders.forEach { dao.insertOrder(it.toEntity()) }
            response.transactions.forEach { dao.insertTransaction(it.toEntity()) }
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        var remoteDataSource: RemoteDataSource? = null
        var erpDao: ErpDao? = null
    }
}
