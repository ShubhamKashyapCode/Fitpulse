package com.fitpulse.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fitpulse.app.domain.model.UserProfile
import com.fitpulse.app.ui.theme.*

@Composable
fun SettingsScreen(
    profile: UserProfile,
    onNavigateToPermissions: () -> Unit,
    onExportData: () -> Unit,
    onClearData: () -> Unit,
    onToggleDeveloperMode: (Boolean) -> Unit
) {
    var showDeleteConfirm by remember { mutableStateOf(false) }

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
                text = "Settings & Privacy",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Manage permissions, privacy, and local device data",
                fontSize = 14.sp,
                color = TextSecondary
            )
        }

        // Section: Permissions & Connections
        item {
            Text(
                text = "HEALTH & SENSORS",
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
                Column(modifier = Modifier.padding(6.dp)) {
                    SettingItem(
                        icon = Icons.Default.HealthAndSafety,
                        title = "Permission Center",
                        subtitle = "Steps, Heart Rate, Sleep, Location & Notifications",
                        onClick = onNavigateToPermissions
                    )
                }
            }
        }

        // Section: Privacy & Data Export
        item {
            Text(
                text = "DATA PRIVACY & EXPORT",
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
                Column(modifier = Modifier.padding(6.dp)) {
                    SettingItem(
                        icon = Icons.Default.FileDownload,
                        title = "Export My Data",
                        subtitle = "Download all recorded workouts and activity logs as JSON/CSV",
                        onClick = onExportData
                    )
                    HorizontalDivider(color = DividerColor)
                    SettingItem(
                        icon = Icons.Default.DeleteOutline,
                        title = "Delete Local Data",
                        subtitle = "Erase all FitPulse stored health records from this device",
                        onClick = { showDeleteConfirm = true },
                        titleColor = AccentCoral
                    )
                }
            }
        }

        // Section: Developer Mode (Strictly for testing UI states)
        item {
            Text(
                text = "DEVELOPMENT ONLY",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = AccentAmber,
                letterSpacing = 1.sp
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Developer Mode",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Enables sample UI previews. Production mode always reads real device sensors and Health Connect APIs.",
                            fontSize = 12.sp,
                            color = TextSecondary,
                            lineHeight = 16.sp
                        )
                    }
                    Switch(
                        checked = profile.developerModeEnabled,
                        onCheckedChange = onToggleDeveloperMode,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = DarkGreen,
                            checkedTrackColor = NeonGreen
                        )
                    )
                }
            }
        }

        // Section: About
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "FitPulse v1.0.0 (Build 35)", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Built strictly with official Android Health Connect, Location, and Jetpack Compose APIs. Follows privacy-first architecture: no health metrics leave your device.",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        lineHeight = 16.sp
                    )
                }
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Delete Local Data?") },
            text = { Text("This will permanently remove all workouts, step records, and water logs from your device storage.") },
            confirmButton = {
                Button(
                    onClick = {
                        onClearData()
                        showDeleteConfirm = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentCoral)
                ) {
                    Text("DELETE ALL")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("CANCEL")
                }
            }
        )
    }
}

@Composable
fun SettingItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    titleColor: androidx.compose.ui.graphics.Color = TextPrimary
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = titleColor, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = titleColor)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 12.sp, color = TextSecondary)
        }
        Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = TextSecondary)
    }
}
