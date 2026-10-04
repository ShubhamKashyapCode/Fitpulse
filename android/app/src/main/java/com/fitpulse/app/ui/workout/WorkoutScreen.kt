package com.fitpulse.app.ui.workout

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.domain.model.WorkoutSession
import com.fitpulse.app.domain.model.WorkoutType
import com.fitpulse.app.ui.theme.*
import com.fitpulse.app.utils.GpsDistanceCalculator
import java.time.format.DateTimeFormatter

@Composable
fun WorkoutScreen(
    workouts: List<WorkoutSession>,
    onStartWorkout: (WorkoutType) -> Unit,
    onViewWorkoutDetail: (String) -> Unit
) {
    var selectedWorkoutType by remember { mutableStateOf(WorkoutType.RUNNING) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Record Workout",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Track your routes with high-accuracy GPS and real-time pace",
                fontSize = 14.sp,
                color = TextSecondary
            )
        }

        // Workout Type Selector
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "SELECT ACTIVITY",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = NeonGreen,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        WorkoutType.values().take(4).forEach { type ->
                            val isSelected = type == selectedWorkoutType
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { selectedWorkoutType = type }
                                    .background(if (isSelected) DarkGreen else Color.Transparent)
                                    .padding(8.dp)
                            ) {
                                Icon(
                                    imageVector = when (type) {
                                        WorkoutType.WALKING -> Icons.Default.DirectionsWalk
                                        WorkoutType.RUNNING -> Icons.Default.DirectionsRun
                                        WorkoutType.CYCLING -> Icons.Default.DirectionsBike
                                        WorkoutType.HIKING -> Icons.Default.Hiking
                                        else -> Icons.Default.FitnessCenter
                                    },
                                    contentDescription = type.displayName,
                                    tint = if (isSelected) NeonGreen else TextSecondary,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = type.displayName,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) TextPrimary else TextSecondary
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = { onStartWorkout(selectedWorkoutType) },
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = NeonGreen)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = DarkGreen
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "START ${selectedWorkoutType.displayName.uppercase()}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = DarkGreen
                        )
                    }
                }
            }
        }

        // Recent Workouts Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "WORKOUT HISTORY",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "${workouts.size} Sessions",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        if (workouts.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = CardBackground)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsRun,
                            contentDescription = null,
                            tint = TextSecondary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No workouts recorded yet",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Start a walking, running, or cycling workout to record your GPS route, distance, speed, and calories.",
                            fontSize = 13.sp,
                            color = TextSecondary,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        } else {
            items(workouts) { workout ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onViewWorkoutDetail(workout.id) },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = CardBackground)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(DarkGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = when (workout.type) {
                                    WorkoutType.WALKING -> Icons.Default.DirectionsWalk
                                    WorkoutType.RUNNING -> Icons.Default.DirectionsRun
                                    WorkoutType.CYCLING -> Icons.Default.DirectionsBike
                                    WorkoutType.HIKING -> Icons.Default.Hiking
                                    else -> Icons.Default.FitnessCenter
                                },
                                contentDescription = null,
                                tint = NeonGreen
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = workout.type.displayName,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${GpsDistanceCalculator.formatDuration(workout.durationSeconds)} • ${workout.activeCalories.toInt()} kcal",
                                fontSize = 13.sp,
                                color = TextSecondary
                            )
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${String.format("%.2f", workout.distanceMeters / 1000.0)} km",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonGreen
                            )
                            Text(
                                text = GpsDistanceCalculator.formatPace(workout.averagePaceSecPerKm),
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}
