package com.fitpulse.app.data.database

import androidx.room.TypeConverter
import com.fitpulse.app.domain.model.WorkoutType
import java.time.Instant
import java.time.LocalDate

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Instant? {
        return value?.let { Instant.ofEpochMilli(it) }
    }

    @TypeConverter
    fun dateToTimestamp(instant: Instant?): Long? {
        return instant?.toEpochMilli()
    }

    @TypeConverter
    fun fromLocalDateString(value: String?): LocalDate? {
        return value?.let { LocalDate.parse(it) }
    }

    @TypeConverter
    fun localDateToString(date: LocalDate?): String? {
        return date?.toString()
    }

    @TypeConverter
    fun fromWorkoutType(value: WorkoutType?): String? {
        return value?.name
    }

    @TypeConverter
    fun toWorkoutType(value: String?): WorkoutType? {
        return value?.let { WorkoutType.valueOf(it) }
    }
}
