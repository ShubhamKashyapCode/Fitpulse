package com.fitpulse.app

import com.fitpulse.app.domain.model.DailyActivitySummary
import com.fitpulse.app.domain.model.GpsPoint
import com.fitpulse.app.domain.model.WorkoutType
import com.fitpulse.app.domain.usecase.FitnessUseCases
import com.fitpulse.app.utils.GpsDistanceCalculator
import org.junit.Assert.*
import org.junit.Test
import java.time.Instant
import java.time.LocalDate

class FitnessCalculationsTest {

    private val fitnessUseCases = FitnessUseCases()

    @Test
    fun testBmiCalculation() {
        val result = fitnessUseCases.calculateBmi(180.0, 75.0)
        assertNotNull(result)
        assertEquals(23.1, result!!.first, 0.1)
        assertEquals("Normal weight", result.second)

        // Invalid cases
        assertNull(fitnessUseCases.calculateBmi(null, 75.0))
        assertNull(fitnessUseCases.calculateBmi(180.0, -10.0))
    }

    @Test
    fun testBmrCalculation() {
        val maleBmr = fitnessUseCases.estimateBmr(70.0, 175.0, 25, "male")
        assertNotNull(maleBmr)
        // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
        assertEquals(1673.75, maleBmr!!, 0.5)

        val femaleBmr = fitnessUseCases.estimateBmr(60.0, 165.0, 30, "female")
        assertNotNull(femaleBmr)
        // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
        assertEquals(1320.25, femaleBmr!!, 0.5)
    }

    @Test
    fun testStepStreakCalculation() {
        val today = LocalDate.now()
        val activities = listOf(
            DailyActivitySummary(date = today, steps = 11000, stepGoal = 10000),
            DailyActivitySummary(date = today.minusDays(1), steps = 10500, stepGoal = 10000),
            DailyActivitySummary(date = today.minusDays(2), steps = 12000, stepGoal = 10000),
            DailyActivitySummary(date = today.minusDays(3), steps = 8000, stepGoal = 10000) // streak broke here
        )
        val streak = fitnessUseCases.calculateStepStreak(activities, 10000L)
        assertEquals(3, streak)
    }

    @Test
    fun testHaversineDistanceCalculation() {
        // Distance between London (51.5074, -0.1278) and Paris (48.8566, 2.3522) is approx 343 km
        val distanceMeters = GpsDistanceCalculator.calculateDistanceMeters(
            51.5074, -0.1278,
            48.8566, 2.3522
        )
        val distanceKm = distanceMeters / 1000.0
        assertTrue("Distance should be around 343 km, was $distanceKm", distanceKm in 340.0..346.0)
    }

    @Test
    fun testGpsNoiseFiltering() {
        val pt1 = GpsPoint(latitude = 37.7749, longitude = -122.4194, accuracy = 5.0f, timestamp = Instant.now())
        // Inaccurate point with 50m error
        val ptInaccurate = GpsPoint(latitude = 37.7750, longitude = -122.4195, accuracy = 55.0f, timestamp = Instant.now().plusSeconds(1))
        assertFalse(GpsDistanceCalculator.isValidGpsPoint(pt1, ptInaccurate))

        // Normal point
        val ptValid = GpsPoint(latitude = 37.7750, longitude = -122.4195, accuracy = 6.0f, timestamp = Instant.now().plusSeconds(5))
        assertTrue(GpsDistanceCalculator.isValidGpsPoint(pt1, ptValid))
    }
}
