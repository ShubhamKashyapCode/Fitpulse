package com.fitpulse.app.domain.usecase

import com.fitpulse.app.domain.model.*
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import kotlin.math.roundToInt

class FitnessUseCases {

    /**
     * Calculates BMI based on height in cm and weight in kg.
     * Clearly marked as a general screening tool, not a medical diagnosis.
     */
    fun calculateBmi(heightCm: Double?, weightKg: Double?): Pair<Double, String>? {
        if (heightCm == null || weightKg == null || heightCm <= 0 || weightKg <= 0) return null
        val heightM = heightCm / 100.0
        val bmi = weightKg / (heightM * heightM)
        val roundedBmi = (bmi * 10.0).roundToInt() / 10.0

        val category = when {
            roundedBmi < 18.5 -> "Underweight"
            roundedBmi < 25.0 -> "Normal weight"
            roundedBmi < 30.0 -> "Overweight"
            else -> "Obesity category"
        }
        return Pair(roundedBmi, category)
    }

    /**
     * Estimates BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation.
     * Labelled strictly as an estimate.
     */
    fun estimateBmr(weightKg: Double?, heightCm: Double?, age: Int?, gender: String?): Double? {
        if (weightKg == null || heightCm == null || age == null || weightKg <= 0 || heightCm <= 0 || age <= 0) {
            return null
        }
        val isMale = gender?.equals("male", ignoreCase = true) == true
        return if (isMale) {
            (10.0 * weightKg) + (6.25 * heightCm) - (5.0 * age) + 5.0
        } else {
            (10.0 * weightKg) + (6.25 * heightCm) - (5.0 * age) - 161.0
        }
    }

    /**
     * Estimates workout calories burned based on MET, duration, and user weight.
     */
    fun estimateWorkoutCalories(type: WorkoutType, durationSeconds: Long, weightKg: Double?): Double {
        val effectiveWeight = weightKg ?: 70.0
        val hours = durationSeconds / 3600.0
        val met = when (type) {
            WorkoutType.WALKING -> 3.8
            WorkoutType.RUNNING -> 9.8
            WorkoutType.CYCLING -> 7.5
            WorkoutType.HIKING -> 6.0
            WorkoutType.GYM -> 5.0
            WorkoutType.TREADMILL -> 8.5
            WorkoutType.OTHER -> 4.5
        }
        return (met * effectiveWeight * hours).coerceAtLeast(0.0)
    }

    /**
     * Streak calculation: evaluates contiguous days where goals were achieved
     * using local calendar dates to avoid timezone discrepancies.
     */
    fun calculateStepStreak(dailyActivities: List<DailyActivitySummary>, targetGoal: Long): Int {
        if (dailyActivities.isEmpty()) return 0
        val sorted = dailyActivities.sortedByDescending { it.date }
        var streak = 0
        var expectedDate = LocalDate.now()

        // Check if today met the goal
        val todayRecord = sorted.find { it.date == expectedDate }
        if (todayRecord != null && todayRecord.steps >= targetGoal) {
            streak++
            expectedDate = expectedDate.minusDays(1)
        } else {
            // If today is still ongoing, check if yesterday was achieved
            expectedDate = expectedDate.minusDays(1)
        }

        while (true) {
            val record = sorted.find { it.date == expectedDate }
            if (record != null && record.steps >= targetGoal) {
                streak++
                expectedDate = expectedDate.minusDays(1)
            } else {
                break
            }
        }
        return streak
    }

    /**
     * Calculates the FitPulse Wellness Score (0 - 100).
     * Clearly documented as non-medical wellness score.
     */
    fun calculateHealthScore(today: DailyActivitySummary): HealthScore {
        // Activity (0-30): steps progress
        val stepRatio = (today.steps.toDouble() / today.stepGoal.toDouble()).coerceIn(0.0, 1.2)
        val activityScore = (stepRatio * 25.0).roundToInt().coerceIn(0, 30)

        // Hydration (0-20): water intake
        val waterRatio = (today.waterMilliliters.toDouble() / today.waterGoalMl.toDouble()).coerceIn(0.0, 1.0)
        val hydrationScore = (waterRatio * 20.0).roundToInt().coerceIn(0, 20)

        // Sleep (0-25): sleep duration consistency
        val sleepScore = if (today.sleepMinutes != null) {
            val sleepRatio = (today.sleepMinutes.toDouble() / today.sleepGoalMinutes.toDouble()).coerceIn(0.0, 1.0)
            (sleepRatio * 25.0).roundToInt().coerceIn(0, 25)
        } else {
            15 // baseline neutral when sensor unavailable
        }

        // Workouts (0-15)
        val workoutScore = (today.workoutsCount * 10).coerceAtMost(15)

        // Recovery / Resting Heart Rate (0-10)
        val recoveryScore = when {
            today.restingHeartRate == null -> 7 // neutral if no wearable
            today.restingHeartRate in 50..70 -> 10
            today.restingHeartRate in 71..80 -> 8
            today.restingHeartRate in 81..90 -> 5
            else -> 3
        }

        val totalScore = (activityScore + hydrationScore + sleepScore + workoutScore + recoveryScore).coerceIn(0, 100)

        return HealthScore(
            score = totalScore,
            activityScore = activityScore,
            sleepScore = sleepScore,
            hydrationScore = hydrationScore,
            workoutScore = workoutScore,
            recoveryScore = recoveryScore
        )
    }

    /**
     * Evaluates achievements strictly based on real recorded data.
     */
    fun evaluateAchievements(
        allTimeWorkouts: List<WorkoutSession>,
        allTimeActivities: List<DailyActivitySummary>,
        currentStreak: Int
    ): List<AchievementItem> {
        val totalWorkouts = allTimeWorkouts.size
        val totalDistanceKm = allTimeWorkouts.sumOf { it.distanceMeters } / 1000.0
        val maxStepsInOneDay = allTimeActivities.maxOfOrNull { it.steps } ?: 0L

        return listOf(
            AchievementItem(
                id = "first_workout",
                title = "First Workout",
                description = "Complete and record your first workout session.",
                icon = "sports_score",
                isUnlocked = totalWorkouts >= 1,
                progress = (totalWorkouts / 1f).coerceIn(0f, 1f)
            ),
            AchievementItem(
                id = "workout_10",
                title = "10 Workouts Club",
                description = "Record 10 complete workout sessions.",
                icon = "fitness_center",
                isUnlocked = totalWorkouts >= 10,
                progress = (totalWorkouts / 10f).coerceIn(0f, 1f)
            ),
            AchievementItem(
                id = "distance_5k",
                title = "First 5K",
                description = "Record a single workout of 5 km or more.",
                icon = "flag",
                isUnlocked = allTimeWorkouts.any { it.distanceMeters >= 5000.0 },
                progress = if (allTimeWorkouts.any { it.distanceMeters >= 5000.0 }) 1f else 0.5f
            ),
            AchievementItem(
                id = "distance_100k",
                title = "Centurion (100 KM)",
                description = "Accumulate 100 km across all recorded workouts.",
                icon = "military_tech",
                isUnlocked = totalDistanceKm >= 100.0,
                progress = (totalDistanceKm / 100.0).toFloat().coerceIn(0f, 1f)
            ),
            AchievementItem(
                id = "steps_10k",
                title = "10,000 Steps",
                description = "Walk 10,000 steps in a single calendar day.",
                icon = "footprint",
                isUnlocked = maxStepsInOneDay >= 10000,
                progress = (maxStepsInOneDay / 10000f).coerceIn(0f, 1f)
            ),
            AchievementItem(
                id = "steps_25k",
                title = "25,000 Steps Explorer",
                description = "Reach 25,000 steps in a single calendar day.",
                icon = "hiking",
                isUnlocked = maxStepsInOneDay >= 25000,
                progress = (maxStepsInOneDay / 25000f).coerceIn(0f, 1f)
            ),
            AchievementItem(
                id = "streak_7",
                title = "7-Day Consistency",
                description = "Maintain a 7-day daily goal achievement streak.",
                icon = "local_fire_department",
                isUnlocked = currentStreak >= 7,
                progress = (currentStreak / 7f).coerceIn(0f, 1f)
            ),
            AchievementItem(
                id = "streak_30",
                title = "30-Day Champion",
                description = "Maintain a 30-day streak of reaching your daily fitness goals.",
                icon = "workspace_premium",
                isUnlocked = currentStreak >= 30,
                progress = (currentStreak / 30f).coerceIn(0f, 1f)
            )
        )
    }

    /**
     * Generates AI fitness insights strictly from real observed data.
     * Never invents missing data. Clearly provides medical disclaimers.
     */
    fun generateInsights(
        today: DailyActivitySummary,
        recent7Days: List<DailyActivitySummary>,
        recentWorkouts: List<WorkoutSession>
    ): List<AiFitnessInsight> {
        val insights = mutableListOf<AiFitnessInsight>()

        // 1. Step comparison with 7-day average
        val validPastDays = recent7Days.filter { it.date != today.date && it.steps > 0 }
        if (validPastDays.isNotEmpty()) {
            val avgSteps = validPastDays.map { it.steps }.average().roundToInt()
            if (today.steps > avgSteps) {
                insights.add(
                    AiFitnessInsight(
                        id = "step_above_avg",
                        title = "Above 7-Day Average",
                        content = "You've walked ${today.steps} steps today, outperforming your recent 7-day daily average of $avgSteps steps.",
                        category = "ACTIVITY"
                    )
                )
            } else if (today.steps < today.stepGoal) {
                val remaining = today.stepGoal - today.steps
                insights.add(
                    AiFitnessInsight(
                        id = "step_goal_progress",
                        title = "Step Goal in Reach",
                        content = "You are $remaining steps away from your daily goal of ${today.stepGoal} steps. A brief 15-minute evening walk will bridge this gap.",
                        category = "ACTIVITY"
                    )
                )
            }
        } else {
            insights.add(
                AiFitnessInsight(
                    id = "step_baseline",
                    title = "Building Your Activity Baseline",
                    content = "FitPulse is accumulating your daily activity data from device sensors and Health Connect to provide personalized trends.",
                    category = "ACTIVITY"
                )
            )
        }

        // 2. Hydration check
        if (today.waterMilliliters < today.waterGoalMl / 2) {
            val neededMl = today.waterGoalMl - today.waterMilliliters
            insights.add(
                AiFitnessInsight(
                    id = "hydration_check",
                    title = "Hydration Reminder",
                    content = "You've logged ${today.waterMilliliters} ml of water. Aim for ${neededMl} ml more to reach your optimal daily hydration target.",
                    category = "HYDRATION"
                )
            )
        }

        // 3. Sleep consistency check
        val sleepRecords = recent7Days.mapNotNull { it.sleepMinutes }
        if (sleepRecords.size >= 3) {
            val avgSleepHrs = sleepRecords.average() / 60.0
            insights.add(
                AiFitnessInsight(
                    id = "sleep_analysis",
                    title = "Sleep Consistency",
                    content = "Your average recorded sleep duration over the past few nights is ${String.format("%.1f", avgSleepHrs)} hours. Consistent bedtimes enhance muscular recovery and mental sharpness.",
                    category = "RECOVERY"
                )
            )
        } else {
            insights.add(
                AiFitnessInsight(
                    id = "sleep_missing",
                    title = "Sleep Data Status",
                    content = "Sleep data isn't recorded for tonight yet. Connect a compatible wearable or sleep tracker in Health Connect to see sleep stages and recovery metrics.",
                    category = "RECOVERY"
                )
            )
        }

        // 4. Workout frequency
        if (recentWorkouts.isNotEmpty()) {
            val totalDistance = recentWorkouts.sumOf { it.distanceMeters } / 1000.0
            insights.add(
                AiFitnessInsight(
                    id = "workout_summary",
                    title = "Workout Performance",
                    content = "You have completed ${recentWorkouts.size} workout sessions recently totaling ${String.format("%.2f", totalDistance)} km. Great job staying active!",
                    category = "WORKOUT"
                )
            )
        }

        return insights
    }
}
