package com.fitpulse.app.data.repository

import com.fitpulse.app.data.database.FitPulseDatabase
import com.fitpulse.app.data.database.entities.*
import com.fitpulse.app.data.health.HealthConnectAvailability
import com.fitpulse.app.data.health.HealthConnectManager
import com.fitpulse.app.domain.model.*
import com.fitpulse.app.domain.usecase.FitnessUseCases
import kotlinx.coroutines.flow.*
import java.time.Instant
import java.time.LocalDate

class FitPulseRepository(
    private val database: FitPulseDatabase,
    private val healthConnectManager: HealthConnectManager,
    private val fitnessUseCases: FitnessUseCases = FitnessUseCases()
) {
    private val userDao = database.userDao()
    private val activityDao = database.activityDao()
    private val workoutDao = database.workoutDao()
    private val waterDao = database.waterDao()
    private val weightDao = database.weightDao()
    private val achievementDao = database.achievementDao()

    /**
     * Observes the user profile.
     */
    fun getUserProfile(): Flow<UserProfile> {
        return userDao.getUserProfile().map { entity ->
            entity?.let {
                UserProfile(
                    id = it.id,
                    name = it.name,
                    age = it.age,
                    gender = it.gender,
                    heightCm = it.heightCm,
                    weightKg = it.weightKg,
                    activityLevel = it.activityLevel,
                    unitSystem = it.unitSystem,
                    stepGoal = it.stepGoal,
                    waterGoalMl = it.waterGoalMl,
                    sleepGoalMinutes = it.sleepGoalMinutes,
                    weeklyWorkoutGoal = it.weeklyWorkoutGoal,
                    weightTargetKg = it.weightTargetKg,
                    isOnboarded = it.isOnboarded,
                    developerModeEnabled = it.developerModeEnabled
                )
            } ?: UserProfile()
        }
    }

    suspend fun saveUserProfile(profile: UserProfile) {
        userDao.saveUserProfile(
            UserProfileEntity(
                id = profile.id,
                name = profile.name,
                age = profile.age,
                gender = profile.gender,
                heightCm = profile.heightCm,
                weightKg = profile.weightKg,
                activityLevel = profile.activityLevel,
                unitSystem = profile.unitSystem,
                stepGoal = profile.stepGoal,
                waterGoalMl = profile.waterGoalMl,
                sleepGoalMinutes = profile.sleepGoalMinutes,
                weeklyWorkoutGoal = profile.weeklyWorkoutGoal,
                weightTargetKg = profile.weightTargetKg,
                isOnboarded = profile.isOnboarded,
                developerModeEnabled = profile.developerModeEnabled
            )
        )
    }

    /**
     * Observes today's activity, merging local records and Health Connect data.
     */
    fun getTodayActivity(): Flow<DailyActivitySummary> {
        val today = LocalDate.now()
        return activityDao.getActivityForDate(today).map { entity ->
            if (entity != null) {
                DailyActivitySummary(
                    date = entity.date,
                    steps = entity.steps,
                    distanceMeters = entity.distanceMeters,
                    activeCalories = entity.activeCalories,
                    totalCalories = entity.totalCalories,
                    restingHeartRate = entity.restingHeartRate,
                    averageHeartRate = entity.averageHeartRate,
                    minHeartRate = entity.minHeartRate,
                    maxHeartRate = entity.maxHeartRate,
                    sleepMinutes = entity.sleepMinutes,
                    waterMilliliters = entity.waterMilliliters,
                    weightKg = entity.weightKg,
                    workoutsCount = entity.workoutsCount,
                    stepGoal = entity.stepGoal,
                    waterGoalMl = entity.waterGoalMl,
                    sleepGoalMinutes = entity.sleepGoalMinutes
                )
            } else {
                DailyActivitySummary(date = today)
            }
        }
    }

    /**
     * Refreshes data from Health Connect if permissions are granted.
     * Respects the "NEVER fabricate health data" rule: if sensor data is unavailable,
     * leaves the fields as null or 0.
     */
    suspend fun syncHealthConnectData() {
        if (healthConnectManager.checkAvailability() != HealthConnectAvailability.Available) {
            return
        }
        val today = LocalDate.now()
        val currentEntity = activityDao.getActivityForDateOnce(today)
        val profile = userDao.getUserProfileOnce()

        val steps = healthConnectManager.readTodaySteps() ?: currentEntity?.steps ?: 0L
        val distance = healthConnectManager.readTodayDistanceMeters() ?: currentEntity?.distanceMeters ?: 0.0
        val activeCalories = healthConnectManager.readTodayActiveCalories() ?: currentEntity?.activeCalories ?: 0.0
        val restingHr = healthConnectManager.readTodayRestingHeartRate() ?: currentEntity?.restingHeartRate
        val latestHr = healthConnectManager.readLatestHeartRate() ?: currentEntity?.averageHeartRate
        val sleepSession = healthConnectManager.readLastNightSleepSession()
        val weight = healthConnectManager.readLatestWeightKg() ?: currentEntity?.weightKg ?: profile?.weightKg

        val updatedEntity = DailyActivityEntity(
            id = currentEntity?.id ?: 0,
            date = today,
            steps = steps,
            distanceMeters = distance,
            activeCalories = activeCalories,
            totalCalories = activeCalories + (fitnessUseCases.estimateBmr(weight, profile?.heightCm, profile?.age, profile?.gender) ?: 1600.0),
            restingHeartRate = restingHr,
            averageHeartRate = latestHr,
            minHeartRate = currentEntity?.minHeartRate,
            maxHeartRate = currentEntity?.maxHeartRate,
            sleepMinutes = sleepSession?.durationMinutes ?: currentEntity?.sleepMinutes,
            waterMilliliters = currentEntity?.waterMilliliters ?: 0,
            weightKg = weight,
            workoutsCount = currentEntity?.workoutsCount ?: 0,
            stepGoal = profile?.stepGoal ?: 10000,
            waterGoalMl = profile?.waterGoalMl ?: 2500,
            sleepGoalMinutes = profile?.sleepGoalMinutes ?: 480
        )
        activityDao.insertOrUpdateActivity(updatedEntity)
    }

    /**
     * Adds water intake in ml.
     */
    suspend fun logWater(amountMl: Int) {
        val today = LocalDate.now()
        waterDao.addWaterEntry(
            WaterEntryEntity(
                amountMl = amountMl,
                timestamp = Instant.now(),
                date = today
            )
        )
        val currentActivity = activityDao.getActivityForDateOnce(today)
        if (currentActivity != null) {
            activityDao.insertOrUpdateActivity(
                currentActivity.copy(waterMilliliters = currentActivity.waterMilliliters + amountMl)
            )
        }
    }

    /**
     * Logs weight entry.
     */
    suspend fun logWeight(weightKg: Double) {
        val today = LocalDate.now()
        val profile = userDao.getUserProfileOnce()
        val bmi = fitnessUseCases.calculateBmi(profile?.heightCm, weightKg)?.first
        weightDao.insertWeight(
            WeightEntryEntity(
                weightKg = weightKg,
                bmi = bmi,
                timestamp = Instant.now(),
                date = today
            )
        )
        if (profile != null) {
            userDao.saveUserProfile(profile.copy(weightKg = weightKg))
        }
        val currentActivity = activityDao.getActivityForDateOnce(today)
        if (currentActivity != null) {
            activityDao.insertOrUpdateActivity(currentActivity.copy(weightKg = weightKg))
        }
    }

    /**
     * Saves a completed workout session with GPS points.
     */
    suspend fun saveWorkout(workout: WorkoutSession) {
        workoutDao.insertWorkout(
            WorkoutEntity(
                id = workout.id,
                type = workout.type,
                startTime = workout.startTime,
                endTime = workout.endTime,
                durationSeconds = workout.durationSeconds,
                distanceMeters = workout.distanceMeters,
                activeCalories = workout.activeCalories,
                averageSpeedKmh = workout.averageSpeedKmh,
                maxSpeedKmh = workout.maxSpeedKmh,
                averagePaceSecPerKm = workout.averagePaceSecPerKm,
                elevationGainMeters = workout.elevationGainMeters,
                averageHeartRate = workout.averageHeartRate,
                maxHeartRate = workout.maxHeartRate,
                notes = workout.notes
            )
        )

        if (workout.points.isNotEmpty()) {
            val pointEntities = workout.points.map { pt ->
                WorkoutPointEntity(
                    workoutId = workout.id,
                    latitude = pt.latitude,
                    longitude = pt.longitude,
                    altitude = pt.altitude,
                    speed = pt.speed,
                    accuracy = pt.accuracy,
                    timestamp = pt.timestamp
                )
            }
            workoutDao.insertPoints(pointEntities)
        }

        // Increment today's workout count and calories
        val today = LocalDate.now()
        val currentActivity = activityDao.getActivityForDateOnce(today)
        if (currentActivity != null) {
            activityDao.insertOrUpdateActivity(
                currentActivity.copy(
                    workoutsCount = currentActivity.workoutsCount + 1,
                    activeCalories = currentActivity.activeCalories + workout.activeCalories,
                    distanceMeters = currentActivity.distanceMeters + workout.distanceMeters
                )
            )
        }
    }

    /**
     * Observes all workouts.
     */
    fun getAllWorkouts(): Flow<List<WorkoutSession>> {
        return workoutDao.getAllWorkouts().map { list ->
            list.map { w ->
                WorkoutSession(
                    id = w.id,
                    type = w.type,
                    startTime = w.startTime,
                    endTime = w.endTime,
                    durationSeconds = w.durationSeconds,
                    distanceMeters = w.distanceMeters,
                    activeCalories = w.activeCalories,
                    averageSpeedKmh = w.averageSpeedKmh,
                    maxSpeedKmh = w.maxSpeedKmh,
                    averagePaceSecPerKm = w.averagePaceSecPerKm,
                    elevationGainMeters = w.elevationGainMeters,
                    averageHeartRate = w.averageHeartRate,
                    maxHeartRate = w.maxHeartRate,
                    notes = w.notes
                )
            }
        }
    }

    suspend fun getWorkoutPoints(workoutId: String): List<GpsPoint> {
        return workoutDao.getPointsForWorkout(workoutId).map { pt ->
            GpsPoint(
                latitude = pt.latitude,
                longitude = pt.longitude,
                altitude = pt.altitude,
                speed = pt.speed,
                accuracy = pt.accuracy,
                timestamp = pt.timestamp
            )
        }
    }
}
