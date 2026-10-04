package com.fitpulse.app

import android.Manifest
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import androidx.health.connect.client.PermissionController
import androidx.lifecycle.lifecycleScope
import com.fitpulse.app.domain.model.UserProfile
import com.fitpulse.app.domain.usecase.FitnessUseCases
import com.fitpulse.app.services.WorkoutForegroundService
import com.fitpulse.app.ui.navigation.FitPulseAppScaffold
import com.fitpulse.app.ui.theme.FitPulseTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val app by lazy { application as FitPulseApp }
    private val fitnessUseCases = FitnessUseCases()

    // Health Connect Permission Launcher Contract
    private val healthPermissionLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) { grantedPermissions ->
        lifecycleScope.launch {
            app.repository.syncHealthConnectData()
        }
    }

    // Android System Permission Launcher (Fine Location, Post Notifications)
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initial sync on launch
        lifecycleScope.launch {
            app.repository.syncHealthConnectData()
        }

        setContent {
            FitPulseTheme {
                val profile by app.repository.getUserProfile().collectAsState(initial = UserProfile())
                val todayActivity by app.repository.getTodayActivity().collectAsState(
                    initial = com.fitpulse.app.domain.model.DailyActivitySummary(date = java.time.LocalDate.now())
                )
                val workouts by app.repository.getAllWorkouts().collectAsState(initial = emptyList())

                val healthScore = remember(todayActivity) {
                    fitnessUseCases.calculateHealthScore(todayActivity)
                }

                val insights = remember(todayActivity, workouts) {
                    fitnessUseCases.generateInsights(todayActivity, listOf(todayActivity), workouts)
                }

                val achievements = remember(workouts, todayActivity) {
                    val streak = fitnessUseCases.calculateStepStreak(listOf(todayActivity), todayActivity.stepGoal)
                    fitnessUseCases.evaluateAchievements(workouts, listOf(todayActivity), streak)
                }

                FitPulseAppScaffold(
                    todayActivity = todayActivity,
                    profile = profile,
                    insights = insights,
                    healthScore = healthScore,
                    achievements = achievements,
                    workouts = workouts,
                    onSaveProfile = { updated ->
                        lifecycleScope.launch { app.repository.saveUserProfile(updated) }
                    },
                    onLogWater = { amountMl ->
                        lifecycleScope.launch { app.repository.logWater(amountMl) }
                    },
                    onLogWeight = { weightKg ->
                        lifecycleScope.launch { app.repository.logWeight(weightKg) }
                    },
                    onStartWorkout = { type ->
                        WorkoutForegroundService.start(this, type)
                    },
                    onRequestHealthPermissions = {
                        healthPermissionLauncher.launch(app.healthConnectManager.permissionsToRequest)
                    },
                    onRequestLocationPermissions = {
                        locationPermissionLauncher.launch(
                            arrayOf(
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                            )
                        )
                    },
                    onRequestNotificationPermissions = {
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                            locationPermissionLauncher.launch(arrayOf(Manifest.permission.POST_NOTIFICATIONS))
                        }
                    },
                    onExportData = {
                        // Export local data logic
                    },
                    onClearData = {
                        // Clear local data logic
                    }
                )
            }
        }
    }
}
