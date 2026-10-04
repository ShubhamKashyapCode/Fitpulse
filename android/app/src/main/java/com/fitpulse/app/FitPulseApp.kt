package com.fitpulse.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import com.fitpulse.app.data.database.FitPulseDatabase
import com.fitpulse.app.data.health.HealthConnectManager
import com.fitpulse.app.data.repository.FitPulseRepository

class FitPulseApp : Application() {

    lateinit var database: FitPulseDatabase
        private set

    lateinit var healthConnectManager: HealthConnectManager
        private set

    lateinit var repository: FitPulseRepository
        private set

    override fun onCreate() {
        super.onCreate()
        database = FitPulseDatabase.getInstance(this)
        healthConnectManager = HealthConnectManager(this)
        repository = FitPulseRepository(database, healthConnectManager)

        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        val manager = getSystemService(NotificationManager::class.java)

        val remindersChannel = NotificationChannel(
            CHANNEL_REMINDERS,
            "Health & Hydration Reminders",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Daily reminders for water intake, step milestones, and sleep consistency."
        }

        manager?.createNotificationChannel(remindersChannel)
    }

    companion object {
        const val CHANNEL_REMINDERS = "fitpulse_reminders_channel"
    }
}
