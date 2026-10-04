package com.fitpulse.app.data.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.fitpulse.app.domain.model.*
import java.time.*
import java.time.temporal.ChronoUnit

sealed class HealthConnectAvailability {
    object Available : HealthConnectAvailability()
    object NotInstalled : HealthConnectAvailability()
    object NotSupported : HealthConnectAvailability()
}

class HealthConnectManager(private val context: Context) {

    private val healthConnectClient by lazy {
        if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(context)
        } else {
            null
        }
    }

    /**
     * Checks Health Connect SDK status on the current Android device.
     */
    fun checkAvailability(): HealthConnectAvailability {
        return when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> HealthConnectAvailability.Available
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> HealthConnectAvailability.NotInstalled
            else -> HealthConnectAvailability.NotSupported
        }
    }

    /**
     * Set of official Health Connect permissions FitPulse requests.
     */
    val permissionsToRequest = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class),
        HealthPermission.getReadPermission(WeightRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getWritePermission(WeightRecord::class),
        HealthPermission.getWritePermission(HydrationRecord::class)
    )

    /**
     * Validates whether all required permissions have been granted by user.
     */
    suspend fun hasAllPermissions(): Boolean {
        val client = healthConnectClient ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        return granted.containsAll(permissionsToRequest)
    }

    /**
     * Gets granted permissions set.
     */
    suspend fun getGrantedPermissions(): Set<String> {
        val client = healthConnectClient ?: return emptySet()
        return try {
            client.permissionController.getGrantedPermissions()
        } catch (e: Exception) {
            emptySet()
        }
    }

    /**
     * Reads aggregated steps for today using platform aggregation to prevent double counting.
     */
    suspend fun readTodaySteps(): Long? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
            val endTime = Instant.now()
            val response = client.aggregate(
                AggregateRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response[StepsRecord.COUNT_TOTAL]
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Reads aggregated distance in meters for today.
     */
    suspend fun readTodayDistanceMeters(): Double? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
            val endTime = Instant.now()
            val response = client.aggregate(
                AggregateRequest(
                    metrics = setOf(DistanceRecord.DISTANCE_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response[DistanceRecord.DISTANCE_TOTAL]?.inMeters
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Reads aggregated active calories burned for today.
     */
    suspend fun readTodayActiveCalories(): Double? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
            val endTime = Instant.now()
            val response = client.aggregate(
                AggregateRequest(
                    metrics = setOf(ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Reads resting heart rate for today. Returns null if wearable data not present.
     */
    suspend fun readTodayRestingHeartRate(): Int? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
            val endTime = Instant.now()
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = RestingHeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records.lastOrNull()?.beatsPerMinute?.toInt()
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Reads latest heart rate sample. Returns null if wearable data is absent.
     */
    suspend fun readLatestHeartRate(): Int? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = Instant.now().minus(24, ChronoUnit.HOURS)
            val endTime = Instant.now()
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            val latestRecord = response.records.lastOrNull()
            latestRecord?.samples?.lastOrNull()?.beatsPerMinute?.toInt()
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Reads sleep session records from Health Connect. Returns null if no sleep data is recorded.
     */
    suspend fun readLastNightSleepSession(): SleepSession? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = LocalDate.now().minusDays(1).atTime(18, 0).atZone(ZoneId.systemDefault()).toInstant()
            val endTime = Instant.now()
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            val lastSession = response.records.lastOrNull() ?: return null
            val durationMinutes = ChronoUnit.MINUTES.between(lastSession.startTime, lastSession.endTime)
            val stages = lastSession.stages.map { stage ->
                val mappedStage = when (stage.stage) {
                    SleepSessionRecord.STAGE_TYPE_DEEP -> SleepStage.DEEP
                    SleepSessionRecord.STAGE_TYPE_LIGHT -> SleepStage.LIGHT
                    SleepSessionRecord.STAGE_TYPE_REM -> SleepStage.REM
                    SleepSessionRecord.STAGE_TYPE_AWAKE -> SleepStage.AWAKE
                    else -> SleepStage.LIGHT
                }
                SleepStageRecord(
                    stage = mappedStage,
                    startTime = stage.startTime,
                    endTime = stage.endTime
                )
            }
            SleepSession(
                id = lastSession.metadata.id,
                startTime = lastSession.startTime,
                endTime = lastSession.endTime,
                durationMinutes = durationMinutes,
                stages = stages
            )
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Reads latest weight in kg from Health Connect.
     */
    suspend fun readLatestWeightKg(): Double? {
        val client = healthConnectClient ?: return null
        return try {
            val startTime = Instant.now().minus(90, ChronoUnit.DAYS)
            val endTime = Instant.now()
            val response = client.readRecords(
                ReadRecordsRequest(
                    recordType = WeightRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                )
            )
            response.records.lastOrNull()?.weight?.inKilograms
        } catch (e: Exception) {
            null
        }
    }
}
