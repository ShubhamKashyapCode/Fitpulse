package com.fitpulse.app.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.fitpulse.app.data.database.dao.*
import com.fitpulse.app.data.database.entities.*

@Database(
    entities = [
        UserProfileEntity::class,
        DailyActivityEntity::class,
        WorkoutEntity::class,
        WorkoutPointEntity::class,
        WaterEntryEntity::class,
        WeightEntryEntity::class,
        AchievementEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class FitPulseDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun activityDao(): ActivityDao
    abstract fun workoutDao(): WorkoutDao
    abstract fun waterDao(): WaterDao
    abstract fun weightDao(): WeightDao
    abstract fun achievementDao(): AchievementDao

    companion object {
        @Volatile
        private var INSTANCE: FitPulseDatabase? = null

        fun getInstance(context: Context): FitPulseDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FitPulseDatabase::class.java,
                    "fitpulse.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
