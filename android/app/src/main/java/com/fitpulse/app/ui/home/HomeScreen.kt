package com.fitpulse.app.ui.home

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.domain.model.*
import com.fitpulse.app.ui.theme.*

@Composable
fun HomeScreen(
    activity: DailyActivitySummary,
    profile: UserProfile,
    insights: List<AiFitnessInsight>,
    onQuickStartWorkout: (WorkoutType) -> Unit,
    onNavigateToActivity: (String) -> Unit,
    onNavigateToCoach: () -> Unit
) {
    val stepRatio = (activity.steps.toFloat() / activity.stepGoal.toFloat()).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(
        targetValue = stepRatio,
        animationSpec = tween(1000),
        label = "stepProgress"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Header greeting
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Good day, ${profile.name}",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Every step moves you forward",
                        fontSize = 14.sp,
                        color = TextSecondary
                    )
                }
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(CardBackground)
                        .clickable { onNavigateToCoach() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = "AI Coach",
                        tint = NeonGreen
                    )
                }
            }
        }

        // 2. Primary Hero Step Card with Animated Ring
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "TODAY'S STEPS",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = NeonGreen,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = String.format("%,d", activity.steps),
                                fontSize = 42.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Goal: ${String.format("%,d", activity.stepGoal)}",
                                fontSize = 14.sp,
                                color = TextSecondary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "${(stepRatio * 100).toInt()}% achieved",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonGreen
                            )
                        }

                        // Circular Progress Indicator
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(100.dp)) {
                            CircularProgressIndicator(
                                progress = { animatedProgress },
                                modifier = Modifier.size(100.dp),
                                color = NeonGreen,
                                strokeWidth = 10.dp,
                                trackColor = DividerColor,
                                strokeCap = StrokeCap.Round
                            )
                            Icon(
                                imageVector = Icons.Default.DirectionsWalk,
                                contentDescription = null,
                                tint = NeonGreen,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))
                    HorizontalDivider(color = DividerColor, thickness = 1.dp)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Secondary metrics row: Distance & Active Calories
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "DISTANCE", fontSize = 11.sp, color = TextSecondary)
                            Text(
                                text = "${String.format("%.2f", activity.distanceMeters / 1000.0)} km",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                        Box(modifier = Modifier.width(1.dp).height(32.dp).background(DividerColor))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "ACTIVE KCAL", fontSize = 11.sp, color = TextSecondary)
                            Text(
                                text = "${activity.activeCalories.toInt()} kcal",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                        Box(modifier = Modifier.width(1.dp).height(32.dp).background(DividerColor))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = "REMAINING", fontSize = 11.sp, color = TextSecondary)
                            val remaining = (activity.stepGoal - activity.steps).coerceAtLeast(0)
                            Text(
                                text = String.format("%,d", remaining),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                        }
                    }
                }
            }
        }

        // 3. Health Snapshot Grid
        item {
            Text(
                text = "HEALTH SNAPSHOT",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Heart Rate Card
                    SnapshotCard(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Favorite,
                        iconTint = AccentCoral,
                        title = "Heart Rate",
                        value = if (activity.averageHeartRate != null) "${activity.averageHeartRate} BPM" else "Data unavailable",
                        subtitle = if (activity.averageHeartRate != null) "Resting ${activity.restingHeartRate ?: "--"} BPM" else "Connect wearable",
                        onClick = { onNavigateToActivity("HEART") }
                    )

                    // Sleep Card
                    val sleepHours = activity.sleepMinutes?.let { "${it / 60}h ${it % 60}m" } ?: "Data unavailable"
                    SnapshotCard(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Bedtime,
                        iconTint = AccentPurple,
                        title = "Sleep",
                        value = sleepHours,
                        subtitle = if (activity.sleepMinutes != null) "Optimal recovery" else "Connect sleep tracker",
                        onClick = { onNavigateToActivity("SLEEP") }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Water Card
                    val waterLiters = String.format("%.1f", activity.waterMilliliters / 1000.0)
                    val waterGoalLiters = String.format("%.1f", activity.waterGoalMl / 1000.0)
                    SnapshotCard(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.WaterDrop,
                        iconTint = ElectricBlue,
                        title = "Hydration",
                        value = "$waterLiters / $waterGoalLiters L",
                        subtitle = "${(activity.waterMilliliters * 100 / activity.waterGoalMl.coerceAtLeast(1))}% of goal",
                        onClick = { onNavigateToActivity("WATER") }
                    )

                    // Weight Card
                    SnapshotCard(
                        modifier = Modifier.weight(1f),
                        icon = Icons.Default.Scale,
                        iconTint = AccentAmber,
                        title = "Weight",
                        value = if (activity.weightKg != null) "${activity.weightKg} kg" else "Log weight",
                        subtitle = if (activity.weightKg != null) "BMI tracked" else "Tap to record",
                        onClick = { onNavigateToActivity("WEIGHT") }
                    )
                }
            }
        }

        // 4. Quick Start Workout
        item {
            Text(
                text = "QUICK START WORKOUT",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                QuickStartButton(
                    modifier = Modifier.weight(1f),
                    title = "Walking",
                    icon = Icons.Default.DirectionsWalk,
                    onClick = { onQuickStartWorkout(WorkoutType.WALKING) }
                )
                QuickStartButton(
                    modifier = Modifier.weight(1f),
                    title = "Running",
                    icon = Icons.Default.DirectionsRun,
                    onClick = { onQuickStartWorkout(WorkoutType.RUNNING) }
                )
                QuickStartButton(
                    modifier = Modifier.weight(1f),
                    title = "Cycling",
                    icon = Icons.Default.DirectionsBike,
                    onClick = { onQuickStartWorkout(WorkoutType.CYCLING) }
                )
                QuickStartButton(
                    modifier = Modifier.weight(1f),
                    title = "Gym",
                    icon = Icons.Default.FitnessCenter,
                    onClick = { onQuickStartWorkout(WorkoutType.GYM) }
                )
            }
        }

        // 5. AI Fitness Insights
        item {
            Text(
                text = "AI FITNESS INSIGHT",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
        }

        item {
            val topInsight = insights.firstOrNull() ?: AiFitnessInsight(
                id = "default",
                title = "Steady Activity Progress",
                content = "Your movement patterns are being tracked locally. Consistency in daily walking builds sustainable cardiovascular health.",
                category = "ACTIVITY"
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(DarkGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = NeonGreen,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = topInsight.title,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = topInsight.content,
                            fontSize = 14.sp,
                            color = TextSecondary,
                            lineHeight = 20.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SnapshotCard(
    modifier: Modifier = Modifier,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: Color,
    title: String,
    value: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = title,
                    fontSize = 13.sp,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = if (value.contains("unavailable", ignoreCase = true)) AccentAmber else TextSecondary
            )
        }
    }
}

@Composable
fun QuickStartButton(
    modifier: Modifier = Modifier,
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = NeonGreen,
                modifier = Modifier.size(28.dp)
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary
            )
        }
    }
}
