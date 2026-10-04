package com.fitpulse.app.widgets

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.*
import androidx.glance.layout.*
import androidx.glance.text.*
import com.fitpulse.app.MainActivity
import com.fitpulse.app.R

class FitPulseGlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FitPulseGlanceWidget()
}

class FitPulseGlanceWidget : GlanceAppWidget() {

    companion object {
        private val SMALL_SIZE = DpSize(100.dp, 100.dp)
        private val MEDIUM_SIZE = DpSize(220.dp, 100.dp)
        private val LARGE_SIZE = DpSize(260.dp, 200.dp)
    }

    override val sizeMode = SizeMode.Responsive(
        setOf(SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE)
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val size = LocalSize.current
            when {
                size.width >= LARGE_SIZE.width -> LargeWidgetContent()
                size.width >= MEDIUM_SIZE.width -> MediumWidgetContent()
                else -> SmallWidgetContent()
            }
        }
    }

    @Composable
    private fun SmallWidgetContent() {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(GlanceTheme.colors.surface)
                .padding(12.dp)
                .clickable(actionStartActivity<MainActivity>()),
            verticalAlignment = Alignment.CenterVertically,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "🚶",
                style = TextStyle(fontSize = 22.sp)
            )
            Spacer(modifier = GlanceModifier.height(4.dp))
            Text(
                text = "7,842",
                style = TextStyle(
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = GlanceTheme.colors.onSurface
                )
            )
            Text(
                text = "Steps",
                style = TextStyle(
                    fontSize = 12.sp,
                    color = GlanceTheme.colors.secondary
                )
            )
        }
    }

    @Composable
    private fun MediumWidgetContent() {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(GlanceTheme.colors.surface)
                .padding(14.dp)
                .clickable(actionStartActivity<MainActivity>()),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "🚶 7,842 steps",
                    style = TextStyle(
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = GlanceTheme.colors.onSurface
                    )
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                Text(
                    text = "78%",
                    style = TextStyle(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = GlanceTheme.colors.primary
                    )
                )
            }
            Spacer(modifier = GlanceModifier.height(8.dp))
            LinearProgressIndicator(
                progress = 0.78f,
                modifier = GlanceModifier.fillMaxWidth().height(6.dp)
            )
            Spacer(modifier = GlanceModifier.height(8.dp))
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "5.6 km",
                    style = TextStyle(fontSize = 12.sp, color = GlanceTheme.colors.secondary)
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                Text(
                    text = "384 kcal",
                    style = TextStyle(fontSize = 12.sp, color = GlanceTheme.colors.secondary)
                )
            }
        }
    }

    @Composable
    private fun LargeWidgetContent() {
        Column(
            modifier = GlanceModifier
                .fillMaxSize()
                .background(GlanceTheme.colors.surface)
                .padding(16.dp)
                .clickable(actionStartActivity<MainActivity>())
        ) {
            Row(
                modifier = GlanceModifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "TODAY'S ACTIVITY",
                    style = TextStyle(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = GlanceTheme.colors.primary
                    )
                )
                Spacer(modifier = GlanceModifier.defaultWeight())
                Text(
                    text = "Goal 10,000",
                    style = TextStyle(fontSize = 11.sp, color = GlanceTheme.colors.secondary)
                )
            }
            Spacer(modifier = GlanceModifier.height(10.dp))
            Text(
                text = "🚶 7,842 STEPS",
                style = TextStyle(
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = GlanceTheme.colors.onSurface
                )
            )
            Spacer(modifier = GlanceModifier.height(6.dp))
            LinearProgressIndicator(
                progress = 0.78f,
                modifier = GlanceModifier.fillMaxWidth().height(8.dp)
            )
            Spacer(modifier = GlanceModifier.height(12.dp))
            Row(modifier = GlanceModifier.fillMaxWidth()) {
                Column(modifier = GlanceModifier.defaultWeight()) {
                    Text(
                        text = "DISTANCE",
                        style = TextStyle(fontSize = 10.sp, color = GlanceTheme.colors.secondary)
                    )
                    Text(
                        text = "5.6 KM",
                        style = TextStyle(fontSize = 15.sp, fontWeight = FontWeight.Bold, color = GlanceTheme.colors.onSurface)
                    )
                }
                Column(modifier = GlanceModifier.defaultWeight()) {
                    Text(
                        text = "ACTIVE KCAL",
                        style = TextStyle(fontSize = 10.sp, color = GlanceTheme.colors.secondary)
                    )
                    Text(
                        text = "384 KCAL",
                        style = TextStyle(fontSize = 15.sp, fontWeight = FontWeight.Bold, color = GlanceTheme.colors.onSurface)
                    )
                }
            }
        }
    }
}
