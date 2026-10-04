package com.fitpulse.app.data.database.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.fitpulse.app.domain.model.WorkoutType
import java.time.Instant
import java.time.LocalDate

@Entity(tableName = "user_profiles")
data class UserProfileEntity(
    @PrimaryKey val id: String = "default_user",
    val name: String,
    val age: Int?,
    val gender: String?,
    val heightCm: Double?,
    val weightKg: Double?,
    val activityLevel: String,
    val unitSystem: String,
    val stepGoal: Long,
    val waterGoalMl: Int,
    val sleepGoalMinutes: Long,
    val weeklyWorkoutGoal: Int,
    val weightTargetKg: Double?,
    val isOnboarded: Boolean,
    val developerModeEnabled: Boolean
)

@Entity(
    tableName = "daily_activities",
    indices = [Index(value = ["date"], unique = true)]
)
data class DailyActivityEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val date: LocalDate,
    val steps: Long,
    val distanceMeters: Double,
    val activeCalories: Double,
    val totalCalories: Double,
    val restingHeartRate: Int?,
    val averageHeartRate: Int?,
    val minHeartRate: Int?,
    val maxHeartRate: Int?,
    val sleepMinutes: Long?,
    val waterMilliliters: Int,
    val weightKg: Double?,
    val workoutsCount: Int,
    val stepGoal: Long,
    val waterGoalMl: Int,
    val sleepGoalMinutes: Long,
    val lastUpdated: Instant = Instant.now()
)

@Entity(
    tableName = "workouts",
    indices = [Index(value = ["startTime"])]
)
data class WorkoutEntity(
    @PrimaryKey val id: String,
    val type: WorkoutType,
    val startTime: Instant,
    val endTime: Instant?,
    val durationSeconds: Long,
    val distanceMeters: Double,
    val activeCalories: Double,
    val averageSpeedKmh: Double,
    val maxSpeedKmh: Double,
    val averagePaceSecPerKm: Long,
    val elevationGainMeters: Double,
    val averageHeartRate: Int?,
    val maxHeartRate: Int?,
    val notes: String = ""
)

@Entity(
    tableName = "workout_points",
    indices = [Index(value = ["workoutId", "timestamp"])]
)
data class WorkoutPointEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val workoutId: String,
    val latitude: Double,
    val longitude: Double,
    val altitude: Double?,
    val speed: Float?,
    val accuracy: Float?,
    val timestamp: Instant
)

@Entity(tableName = "water_entries")
data class WaterEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val amountMl: Int,
    val timestamp: Instant,
    val date: LocalDate
)

@Entity(tableName = "weight_entries")
data class WeightEntryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val weightKg: Double,
    val bmi: Double?,
    val timestamp: Instant,
    val date: LocalDate,
    val source: String = "MANUAL"
)

@Entity(tableName = "achievements")
data class AchievementEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val icon: String,
    val isUnlocked: Boolean,
    val unlockedAt: Instant?,
    val progress: Float
)
