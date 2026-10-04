package com.fitpulse.app.data.database.dao

import androidx.room.*
import com.fitpulse.app.data.database.entities.*
import kotlinx.coroutines.flow.Flow
import java.time.LocalDate

@Dao
interface UserDao {
    @Query("SELECT * FROM user_profiles WHERE id = :id LIMIT 1")
    fun getUserProfile(id: String = "default_user"): Flow<UserProfileEntity?>

    @Query("SELECT * FROM user_profiles WHERE id = :id LIMIT 1")
    suspend fun getUserProfileOnce(id: String = "default_user"): UserProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveUserProfile(profile: UserProfileEntity)
}

@Dao
interface ActivityDao {
    @Query("SELECT * FROM daily_activities WHERE date = :date LIMIT 1")
    fun getActivityForDate(date: LocalDate): Flow<DailyActivityEntity?>

    @Query("SELECT * FROM daily_activities WHERE date = :date LIMIT 1")
    suspend fun getActivityForDateOnce(date: LocalDate): DailyActivityEntity?

    @Query("SELECT * FROM daily_activities ORDER BY date DESC LIMIT :limit")
    fun getRecentActivities(limit: Int): Flow<List<DailyActivityEntity>>

    @Query("SELECT * FROM daily_activities WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC")
    fun getActivitiesBetween(startDate: LocalDate, endDate: LocalDate): Flow<List<DailyActivityEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateActivity(activity: DailyActivityEntity)
}

@Dao
interface WorkoutDao {
    @Query("SELECT * FROM workouts ORDER BY startTime DESC")
    fun getAllWorkouts(): Flow<List<WorkoutEntity>>

    @Query("SELECT * FROM workouts WHERE id = :workoutId LIMIT 1")
    suspend fun getWorkoutById(workoutId: String): WorkoutEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkout(workout: WorkoutEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPoints(points: List<WorkoutPointEntity>)

    @Query("SELECT * FROM workout_points WHERE workoutId = :workoutId ORDER BY timestamp ASC")
    suspend fun getPointsForWorkout(workoutId: String): List<WorkoutPointEntity>

    @Query("DELETE FROM workouts WHERE id = :workoutId")
    suspend fun deleteWorkout(workoutId: String)
}

@Dao
interface WaterDao {
    @Query("SELECT * FROM water_entries WHERE date = :date ORDER BY timestamp DESC")
    fun getWaterEntriesForDate(date: LocalDate): Flow<List<WaterEntryEntity>>

    @Query("SELECT COALESCE(SUM(amountMl), 0) FROM water_entries WHERE date = :date")
    fun getTotalWaterForDate(date: LocalDate): Flow<Int>

    @Insert
    suspend fun addWaterEntry(entry: WaterEntryEntity)

    @Query("DELETE FROM water_entries WHERE id = :id")
    suspend fun deleteWaterEntry(id: Long)
}

@Dao
interface WeightDao {
    @Query("SELECT * FROM weight_entries ORDER BY date DESC, timestamp DESC")
    fun getAllWeightEntries(): Flow<List<WeightEntryEntity>>

    @Query("SELECT * FROM weight_entries ORDER BY date DESC, timestamp DESC LIMIT 1")
    fun getLatestWeight(): Flow<WeightEntryEntity?>

    @Insert
    suspend fun insertWeight(entry: WeightEntryEntity)
}

@Dao
interface AchievementDao {
    @Query("SELECT * FROM achievements")
    fun getAllAchievements(): Flow<List<AchievementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAchievements(achievements: List<AchievementEntity>)
}
