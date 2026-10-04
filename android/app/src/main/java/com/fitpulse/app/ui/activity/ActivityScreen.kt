package com.fitpulse.app.ui.activity

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.domain.model.DailyActivitySummary
import com.fitpulse.app.domain.model.UserProfile
import com.fitpulse.app.domain.usecase.FitnessUseCases
import com.fitpulse.app.ui.theme.*

@Composable
fun ActivityScreen(
    activity: DailyActivitySummary,
    profile: UserProfile,
    onLogWater: (Int) -> Unit,
    onLogWeight: (Double) -> Unit,
    onOpenHealthConnect: () -> Unit
) {
    var selectedTab by remember { mutableStateOf("STEPS") }
    val tabs = listOf("STEPS", "HEART", "SLEEP", "WATER", "WEIGHT")
    val fitnessUseCases = remember { FitnessUseCases() }

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
                text = "Health & Activity",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Direct metrics from device sensors & Health Connect",
                fontSize = 14.sp,
                color = TextSecondary
            )
        }

        // Horizontal Segmented Tabs
        item {
            ScrollableTabRow(
                selectedTabIndex = tabs.indexOf(selectedTab),
                containerColor = DarkSurface,
                contentColor = NeonGreen,
                edgePadding = 0.dp,
                divider = {}
            ) {
                tabs.forEach { tab ->
                    Tab(
                        selected = selectedTab == tab,
                        onClick = { selectedTab = tab },
                        text = {
                            Text(
                                text = tab,
                                fontWeight = if (selectedTab == tab) FontWeight.Bold else FontWeight.Normal,
                                color = if (selectedTab == tab) NeonGreen else TextSecondary
                            )
                        }
                    )
                }
            }
        }

        when (selectedTab) {
            "STEPS" -> {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = "DAILY STEPS & CADENCE",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonGreen
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = String.format("%,d", activity.steps),
                                fontSize = 44.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Goal: ${String.format("%,d", activity.stepGoal)} steps",
                                fontSize = 14.sp,
                                color = TextSecondary
                            )

                            Spacer(modifier = Modifier.height(16.dp))
                            LinearProgressIndicator(
                                progress = { (activity.steps.toFloat() / activity.stepGoal.toFloat()).coerceIn(0f, 1f) },
                                modifier = Modifier.fillMaxWidth().height(10.dp),
                                color = NeonGreen,
                                trackColor = DividerColor
                            )

                            Spacer(modifier = Modifier.height(20.dp))
                            Text(
                                text = "Hourly Activity Visualization",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextSecondary
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            // Hourly steps representation
                            val sampleHours = listOf("8 AM" to 820, "10 AM" to 1420, "12 PM" to 1950, "2 PM" to 900, "4 PM" to 1250, "6 PM" to 1502)
                            sampleHours.forEach { (hour, count) ->
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = hour, fontSize = 12.sp, color = TextSecondary, modifier = Modifier.width(55.dp))
                                    LinearProgressIndicator(
                                        progress = { (count / 2000f).coerceIn(0f, 1f) },
                                        modifier = Modifier.weight(1f).height(8.dp),
                                        color = ElectricBlue,
                                        trackColor = DividerColor
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(text = "$count", fontSize = 12.sp, color = TextPrimary, modifier = Modifier.width(45.dp))
                                }
                            }
                        }
                    }
                }
            }

            "HEART" -> {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Favorite, contentDescription = null, tint = AccentCoral)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "HEART RATE",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentCoral
                                )
                            }
                            Spacer(modifier = Modifier.height(14.dp))

                            if (activity.averageHeartRate != null) {
                                Text(
                                    text = "${activity.averageHeartRate} BPM",
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Resting: ${activity.restingHeartRate ?: "--"} BPM",
                                    fontSize = 14.sp,
                                    color = TextSecondary
                                )
                            } else {
                                Text(
                                    text = "Data unavailable",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentAmber
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Heart rate data isn't available on this device. Connect a compatible wearable or health platform in Health Connect to import real heart-rate data.",
                                    fontSize = 14.sp,
                                    color = TextSecondary,
                                    lineHeight = 20.sp
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Button(
                                    onClick = onOpenHealthConnect,
                                    colors = ButtonDefaults.buttonColors(containerColor = DarkGreen),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("CONNECT HEALTH DATA", color = NeonGreen, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            "SLEEP" -> {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Bedtime, contentDescription = null, tint = AccentPurple)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "SLEEP TRACKING",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentPurple
                                )
                            }
                            Spacer(modifier = Modifier.height(14.dp))

                            if (activity.sleepMinutes != null) {
                                val hrs = activity.sleepMinutes / 60
                                val mins = activity.sleepMinutes % 60
                                Text(
                                    text = "${hrs}h ${mins}m",
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "Goal: ${activity.sleepGoalMinutes / 60}h 00m",
                                    fontSize = 14.sp,
                                    color = TextSecondary
                                )
                            } else {
                                Text(
                                    text = "Data unavailable",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentAmber
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No sleep session was recorded for last night. Wear your connected smartwatch or sleep sensor to bed and ensure Health Connect sync is enabled.",
                                    fontSize = 14.sp,
                                    color = TextSecondary,
                                    lineHeight = 20.sp
                                )
                            }
                        }
                    }
                }
            }

            "WATER" -> {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = "DAILY HYDRATION",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = ElectricBlue
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            val currentL = String.format("%.2f", activity.waterMilliliters / 1000.0)
                            val goalL = String.format("%.2f", activity.waterGoalMl / 1000.0)
                            Text(
                                text = "$currentL L",
                                fontSize = 44.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Daily Goal: $goalL L",
                                fontSize = 14.sp,
                                color = TextSecondary
                            )

                            Spacer(modifier = Modifier.height(16.dp))
                            LinearProgressIndicator(
                                progress = { (activity.waterMilliliters.toFloat() / activity.waterGoalMl.toFloat()).coerceIn(0f, 1f) },
                                modifier = Modifier.fillMaxWidth().height(10.dp),
                                color = ElectricBlue,
                                trackColor = DividerColor
                            )

                            Spacer(modifier = Modifier.height(20.dp))
                            Text(text = "Quick Add Water", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextSecondary)
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Button(
                                    onClick = { onLogWater(150) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = DarkSurface)
                                ) {
                                    Text("+150 ml", color = ElectricBlue, fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = { onLogWater(250) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = DarkSurface)
                                ) {
                                    Text("+250 ml", color = ElectricBlue, fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = { onLogWater(500) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = DarkSurface)
                                ) {
                                    Text("+500 ml", color = ElectricBlue, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            "WEIGHT" -> {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = CardBackground)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = "BODY WEIGHT & BMI",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = AccentAmber
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            if (activity.weightKg != null) {
                                Text(
                                    text = "${activity.weightKg} kg",
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = TextPrimary
                                )
                                val bmiPair = fitnessUseCases.calculateBmi(profile.heightCm, activity.weightKg)
                                if (bmiPair != null) {
                                    Text(
                                        text = "BMI: ${bmiPair.first} (${bmiPair.second})",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = NeonGreen
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Note: BMI is a general screening index and not a medical diagnosis.",
                                        fontSize = 12.sp,
                                        color = TextSecondary
                                    )
                                }
                            } else {
                                Text(
                                    text = "No weight logged",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentAmber
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Log your weight manually or sync from a smart scale via Health Connect.",
                                    fontSize = 14.sp,
                                    color = TextSecondary
                                )
                            }

                            Spacer(modifier = Modifier.height(20.dp))
                            var weightInput by remember { mutableStateOf("70.0") }
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                OutlinedTextField(
                                    value = weightInput,
                                    onValueChange = { weightInput = it },
                                    label = { Text("Weight (kg)") },
                                    modifier = Modifier.weight(1f),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = NeonGreen,
                                        unfocusedBorderColor = DividerColor,
                                        focusedLabelColor = NeonGreen,
                                        unfocusedLabelColor = TextSecondary
                                    )
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Button(
                                    onClick = {
                                        weightInput.toDoubleOrNull()?.let { onLogWeight(it) }
                                    },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = NeonGreen)
                                ) {
                                    Text("RECORD", color = DarkGreen, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
