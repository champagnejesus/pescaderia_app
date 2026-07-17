### Task 18: Android — Repository Refactor + SyncWorker

**Files:**
- Modify: `app/src/main/java/com/example/data/Repository.kt`
- Create: `app/src/main/java/com/example/data/sync/SyncWorker.kt`
- Create: `app/src/main/java/com/example/data/sync/SyncManager.kt`

- [ ] **Step 1: Modify `Repository.kt`**

The current Repository only takes `ErpDao` as a constructor param. Add `RemoteDataSource` as an optional constructor parameter (default null for backward compatibility).

Pattern: Keep ALL existing public function signatures identical. Internally, for write operations (insert, update, delete):
1. Save to Room first (immediate/local)
2. Then if RemoteDataSource is available, call it in a background coroutine

```kotlin
class ErpRepository(
    private val erpDao: ErpDao,
    private val remoteDataSource: RemoteDataSource? = null
) {
    // ... existing Flow properties stay the same ...

    // Example modified insertProduct:
    suspend fun insertProduct(product: Product) {
        erpDao.insertProduct(product)
        remoteDataSource?.let { remote ->
            try {
                remote.pushProduct(product.toResponse())
            } catch (e: Exception) {
                // Queue for later sync
            }
        }
    }
}
```

Add extension function calls to convert Room entities to DTO response objects using the extension functions already created in Task 17. If the DTOs don't have a `toResponse()` method on the Room entity (they only have `toEntity()` on the DTO), create the reverse mapping inline.

- [ ] **Step 2: Create `SyncWorker.kt`**

```kotlin
package com.example.data.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.data.remote.RemoteDataSource

class SyncWorker(
    appContext: Context,
    params: WorkerParameters,
    private val remoteDataSource: RemoteDataSource
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        return try {
            // Pull changes from server
            val changes = remoteDataSource.pullAll()
            // Save to Room (via repository)
            // ... save each entity ...
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME = "abyssal_sync"
    }
}
```

- [ ] **Step 3: Create `SyncManager.kt`**

```kotlin
package com.example.data.sync

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

class SyncManager(private val context: Context) {

    fun schedulePeriodicSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val request = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
            .build()

        WorkManager.getInstance(context)
            .enqueueUniquePeriodicWork(
                "abyssal_sync",
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
    }

    fun cancelSync() {
        WorkManager.getInstance(context).cancelUniqueWork("abyssal_sync")
    }
}
```

Commit:
```bash
git add app/src/main/java/com/example/data/Repository.kt app/src/main/java/com/example/data/sync/
git commit -m "feat(android): refactor repository with remote sync, add SyncWorker and SyncManager"
```
