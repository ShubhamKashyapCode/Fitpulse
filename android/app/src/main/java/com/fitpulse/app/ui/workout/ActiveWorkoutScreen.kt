package com.fitpulse.app.ui.workout

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import com.fitpulse.app.domain.model.GpsStatus
import com.fitpulse.app.domain.model.WorkoutType
import com.fitpulse.app.ui.theme.*
import com.fitpulse.app.utils.GpsDistanceCalculator

@Composable
fun ActiveWorkoutScreen(
    workoutType: WorkoutType,
    elapsedSeconds: Long,
    distanceMeters: Double,
    currentSpeedKmh: Double,
    currentPaceSecKm: Long,
    estimatedCalories: Double,
    heartRateBpm: Int?,
    gpsStatus: GpsStatus,
    isPaused: Boolean,
    onPauseToggle: () -> Unit,
    onFinishWorkout: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar: Workout Title & GPS Status Badge
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = workoutType.displayName.uppercase(),
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = NeonGreen,
                letterSpacing = 2.sp
            )

            // GPS Status Indicator
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = when (gpsStatus) {
                    GpsStatus.READY -> DarkGreen
                    GpsStatus.SEARCHING -> CardBackground
                    GpsStatus.WEAK -> AccentAmber.copy(alpha = 0.2f)
                    GpsStatus.LOST -> AccentCoral.copy(alpha = 0.2f)
                }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(
                                when (gpsStatus) {
                                    GpsStatus.READY -> NeonGreen
                                    GpsStatus.SEARCHING -> TextSecondary
                                    GpsStatus.WEAK -> AccentAmber
                                    GpsStatus.LOST -> AccentCoral
                                }
                            )
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = gpsStatus.label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = when (gpsStatus) {
                            GpsStatus.READY -> NeonGreen
                            GpsStatus.SEARCHING -> TextSecondary
                            GpsStatus.WEAK -> AccentAmber
                            GpsStatus.LOST -> AccentCoral
                        }
                    )
                }
            }
        }

        // Center Big Metrics: Duration & Distance
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(vertical = 24.dp)
        ) {
            Text(
                text = GpsDistanceCalculator.formatDuration(elapsedSeconds),
                fontSize = 58.sp,
                fontWeight = FontWeight.Black,
                color = TextPrimary
            )
            Text(
                text = "DURATION",
                fontSize = 12.sp,
                color = TextSecondary,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            Text(
                text = String.format("%.2f", distanceMeters / 1000.0),
                fontSize = 64.sp,
                fontWeight = FontWeight.Black,
                color = NeonGreen
            )
            Text(
                text = "KILOMETERS",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
        }

        // 2x2 Grid of Sub-Metrics
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "PACE", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = GpsDistanceCalculator.formatPace(currentPaceSecKm),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "SPEED", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = "${String.format("%.1f", currentSpeedKmh)} km/h",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = DividerColor)
                Spacer(modifier = Modifier.height(16.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "HEART RATE", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = if (heartRateBpm != null) "$heartRateBpm BPM" else "Unavailable",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (heartRateBpm != null) AccentCoral else TextSecondary
                        )
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "CALORIES", fontSize = 11.sp, color = TextSecondary)
                        Text(
                            text = "${estimatedCalories.toInt()} kcal",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                }
            }
        }

        // Action Buttons: Pause / Resume & Finish
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Button(
                onClick = onPauseToggle,
                modifier = Modifier.weight(1f).height(60.dp),
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isPaused) NeonGreen else CardBackground
                )
            ) {
                Icon(
                    imageVector = if (isPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                    contentDescription = null,
                    tint = if (isPaused) DarkGreen else TextPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isPaused) "RESUME" else "PAUSE",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isPaused) DarkGreen else TextPrimary
                )
            }

            Button(
                onClick = onFinishWorkout,
                modifier = Modifier.weight(1f).height(60.dp),
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AccentCoral)
            ) {
                Icon(
                    imageVector = Icons.Default.Stop,
                    contentDescription = null,
                    tint = Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "FINISH",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
