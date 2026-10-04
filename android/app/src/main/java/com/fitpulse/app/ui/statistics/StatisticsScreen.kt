package com.fitpulse.app.ui.statistics

import androidx.compose.foundation.background
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
import com.fitpulse.app.domain.model.AchievementItem
import com.fitpulse.app.domain.model.DailyActivitySummary
import com.fitpulse.app.domain.model.HealthScore
import com.fitpulse.app.ui.theme.*

@Composable
fun StatisticsScreen(
    weeklyActivities: List<DailyActivitySummary>,
    healthScore: HealthScore,
    achievements: List<AchievementItem>
) {
    var selectedTimeframe by remember { mutableStateOf("WEEK") }
    val timeframes = listOf("DAY", "WEEK", "MONTH", "YEAR")

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
                text = "Analytics & Progress",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Longitudinal health trends and wellness index",
                fontSize = 14.sp,
                color = TextSecondary
            )
        }

        // Timeframe selector
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(DarkSurface)
                    .padding(4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                timeframes.forEach { tf ->
                    val isSelected = selectedTimeframe == tf
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) CardBackground else Color.Transparent)
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = tf,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) NeonGreen else TextSecondary
                        )
                    }
                }
            }
        }

        // FitPulse Wellness Score Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "FITPULSE WELLNESS SCORE",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonGreen,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text(
                                    text = "${healthScore.score}",
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.Black,
                                    color = TextPrimary
                                )
                                Text(
                                    text = " / 100",
                                    fontSize = 18.sp,
                                    color = TextSecondary,
                                    modifier = Modifier.padding(bottom = 6.dp)
                                )
                            }
                        }

                        // Circular indicator
                        CircularProgressIndicator(
                            progress = { healthScore.score / 100f },
                            modifier = Modifier.size(64.dp),
                            color = NeonGreen,
                            trackColor = DividerColor,
                            strokeWidth = 6.dp
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = healthScore.disclaimer,
                        fontSize = 11.sp,
                        color = TextSecondary,
                        lineHeight = 15.sp
                    )
                }
            }
        }

        // Summary Metric Cards
        item {
            val totalSteps = weeklyActivities.sumOf { it.steps }
            val avgSteps = if (weeklyActivities.isNotEmpty()) totalSteps / weeklyActivities.size else 0
            val maxSteps = weeklyActivities.maxOfOrNull { it.steps } ?: 0

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricBox(modifier = Modifier.weight(1f), label = "DAILY AVERAGE", value = String.format("%,d", avgSteps), unit = "steps")
                MetricBox(modifier = Modifier.weight(1f), label = "HIGHEST DAY", value = String.format("%,d", maxSteps), unit = "steps")
            }
        }

        // Achievements Section
        item {
            Text(
                text = "ACHIEVEMENTS & BADGES",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = TextSecondary,
                letterSpacing = 1.sp
            )
        }

        items(achievements) { ach ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (ach.isUnlocked) CardBackground else DarkSurface
                )
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(if (ach.isUnlocked) DarkGreen else DividerColor),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (ach.isUnlocked) Icons.Default.EmojiEvents else Icons.Default.Lock,
                            contentDescription = null,
                            tint = if (ach.isUnlocked) NeonGreen else TextSecondary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = ach.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (ach.isUnlocked) TextPrimary else TextSecondary
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = ach.description,
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                    if (ach.isUnlocked) {
                        Text(
                            text = "UNLOCKED",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = NeonGreen
                        )
                    } else {
                        Text(
                            text = "${(ach.progress * 100).toInt()}%",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricBox(modifier: Modifier = Modifier, label: String, value: String, unit: String) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardBackground)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = label, fontSize = 10.sp, color = TextSecondary, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Black, color = TextPrimary)
            Text(text = unit, fontSize = 11.sp, color = TextSecondary)
        }
    }
}
