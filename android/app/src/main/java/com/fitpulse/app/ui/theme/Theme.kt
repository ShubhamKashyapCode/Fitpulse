package com.fitpulse.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = NeonGreen,
    onPrimary = DarkGreen,
    secondary = ElectricBlue,
    onSecondary = Color.Black,
    tertiary = AccentAmber,
    background = DeepNavy,
    surface = DarkSurface,
    surfaceVariant = CardBackground,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onSurfaceVariant = TextSecondary,
    outline = DividerColor
)

@Composable
fun FitPulseTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
