package com.fitpulse.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.*
import com.fitpulse.app.domain.model.*
import com.fitpulse.app.ui.activity.ActivityScreen
import com.fitpulse.app.ui.coach.AiCoachScreen
import com.fitpulse.app.ui.home.HomeScreen
import com.fitpulse.app.ui.onboarding.OnboardingScreen
import com.fitpulse.app.ui.settings.PermissionCenterScreen
import com.fitpulse.app.ui.settings.SettingsScreen
import com.fitpulse.app.ui.statistics.StatisticsScreen
import com.fitpulse.app.ui.theme.*
import com.fitpulse.app.ui.workout.ActiveWorkoutScreen
import com.fitpulse.app.ui.workout.WorkoutScreen
import com.fitpulse.app.ui.workout.WorkoutSummaryScreen

sealed class Screen(val route: String, val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Activity : Screen("activity", "Activity", Icons.Default.DirectionsRun)
    object Workout : Screen("workout", "Workout", Icons.Default.PlayCircle)
    object Statistics : Screen("statistics", "Stats", Icons.Default.BarChart)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

@Composable
fun FitPulseAppScaffold(
    todayActivity: DailyActivitySummary,
    profile: UserProfile,
    insights: List<AiFitnessInsight>,
    healthScore: HealthScore,
    achievements: List<AchievementItem>,
    workouts: List<WorkoutSession>,
    onSaveProfile: (UserProfile) -> Unit,
    onLogWater: (Int) -> Unit,
    onLogWeight: (Double) -> Unit,
    onStartWorkout: (WorkoutType) -> Unit,
    onRequestHealthPermissions: () -> Unit,
    onRequestLocationPermissions: () -> Unit,
    onRequestNotificationPermissions: () -> Unit,
    onExportData: () -> Unit,
    onClearData: () -> Unit
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomBarScreens = listOf(
        Screen.Home,
        Screen.Activity,
        Screen.Workout,
        Screen.Statistics,
        Screen.Settings
    )

    val showBottomBar = bottomBarScreens.any { it.route == currentRoute }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = DarkSurface,
                    contentColor = NeonGreen
                ) {
                    bottomBarScreens.forEach { screen ->
                        NavigationBarItem(
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title) },
                            selected = currentRoute == screen.route,
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = DarkGreen,
                                selectedTextColor = NeonGreen,
                                indicatorColor = NeonGreen,
                                unselectedIconColor = TextSecondary,
                                unselectedTextColor = TextSecondary
                            ),
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = if (profile.isOnboarded) Screen.Home.route else "onboarding",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("onboarding") {
                OnboardingScreen(
                    onComplete = { newProfile ->
                        onSaveProfile(newProfile)
                        navController.navigate(Screen.Home.route) {
                            popUpTo("onboarding") { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    activity = todayActivity,
                    profile = profile,
                    insights = insights,
                    onQuickStartWorkout = { type ->
                        onStartWorkout(type)
                        navController.navigate(Screen.Workout.route)
                    },
                    onNavigateToActivity = { _ -> navController.navigate(Screen.Activity.route) },
                    onNavigateToCoach = { navController.navigate("ai_coach") }
                )
            }

            composable(Screen.Activity.route) {
                ActivityScreen(
                    activity = todayActivity,
                    profile = profile,
                    onLogWater = onLogWater,
                    onLogWeight = onLogWeight,
                    onOpenHealthConnect = onRequestHealthPermissions
                )
            }

            composable(Screen.Workout.route) {
                WorkoutScreen(
                    workouts = workouts,
                    onStartWorkout = { type -> onStartWorkout(type) },
                    onViewWorkoutDetail = { /* View detail */ }
                )
            }

            composable(Screen.Statistics.route) {
                StatisticsScreen(
                    weeklyActivities = listOf(todayActivity),
                    healthScore = healthScore,
                    achievements = achievements
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    profile = profile,
                    onNavigateToPermissions = { navController.navigate("permission_center") },
                    onExportData = onExportData,
                    onClearData = onClearData,
                    onToggleDeveloperMode = { enabled ->
                        onSaveProfile(profile.copy(developerModeEnabled = enabled))
                    }
                )
            }

            composable("permission_center") {
                PermissionCenterScreen(
                    hasHealthPermissions = true,
                    hasLocationPermission = true,
                    hasNotificationPermission = true,
                    onRequestHealthPermissions = onRequestHealthPermissions,
                    onRequestLocationPermission = onRequestLocationPermissions,
                    onRequestNotificationPermission = onRequestNotificationPermissions,
                    onBack = { navController.popBackStack() }
                )
            }

            composable("ai_coach") {
                AiCoachScreen(
                    insights = insights,
                    today = todayActivity,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
