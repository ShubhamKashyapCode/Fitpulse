package com.fitpulse.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.ui.theme.*

@Composable
fun PermissionCenterScreen(
    hasHealthPermissions: Boolean,
    hasLocationPermission: Boolean,
    hasNotificationPermission: Boolean,
    onRequestHealthPermissions: () -> Unit,
    onRequestLocationPermission: () -> Unit,
    onRequestNotificationPermission: () -> Unit,
    onBack: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DeepNavy)
            .padding(16.dp),
        contentPadding = PaddingValues(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Permission Center",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "FitPulse only requests permissions needed to read real device sensors and record GPS workouts.",
                fontSize = 14.sp,
                color = TextSecondary,
                lineHeight = 20.sp
            )
        }

        // Health Connect Permissions Group
        item {
            Text(
                text = "HEALTH CONNECT DATA",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = NeonGreen,
                letterSpacing = 1.sp
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    PermissionRow("Daily Steps Sync", hasHealthPermissions)
                    PermissionRow("Heart Rate & Recovery", hasHealthPermissions)
                    PermissionRow("Sleep Stages & Duration", hasHealthPermissions)
                    PermissionRow("Weight & Smart Scale", hasHealthPermissions)

                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = onRequestHealthPermissions,
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (hasHealthPermissions) DarkGreen else NeonGreen
                        )
                    ) {
                        Text(
                            text = if (hasHealthPermissions) "HEALTH CONNECT CONNECTED ✓" else "CONNECT HEALTH CONNECT",
                            color = if (hasHealthPermissions) NeonGreen else DarkGreen,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Device Hardware & Location Permissions Group
        item {
            Text(
                text = "DEVICE SENSORS & SYSTEM",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = ElectricBlue,
                letterSpacing = 1.sp
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    PermissionRow("Location (Precise GPS for Workouts)", hasLocationPermission)
                    PermissionRow("System Notifications (Alerts & Reminders)", hasNotificationPermission)

                    Spacer(modifier = Modifier.height(14.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = onRequestLocationPermission,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = DarkSurface)
                        ) {
                            Text("GPS Access", color = ElectricBlue, fontSize = 12.sp)
                        }
                        Button(
                            onClick = onRequestNotificationPermission,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = DarkSurface)
                        ) {
                            Text("Notifications", color = ElectricBlue, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PermissionRow(title: String, isGranted: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = title, fontSize = 14.sp, color = TextPrimary)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = if (isGranted) Icons.Default.CheckCircle else Icons.Default.Cancel,
                contentDescription = null,
                tint = if (isGranted) NeonGreen else TextSecondary,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (isGranted) "Connected" else "Not granted",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isGranted) NeonGreen else TextSecondary
            )
        }
    }
}
