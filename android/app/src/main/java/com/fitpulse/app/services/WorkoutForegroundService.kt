package com.fitpulse.app.services

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import com.fitpulse.app.MainActivity
import com.fitpulse.app.domain.model.GpsPoint
import com.fitpulse.app.domain.model.GpsStatus
import com.fitpulse.app.domain.model.WorkoutType
import com.fitpulse.app.utils.GpsDistanceCalculator
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.Instant

class WorkoutForegroundService : Service() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    processNewLocation(location)
                }
            }

            override fun onLocationAvailability(availability: LocationAvailability) {
                _gpsStatus.value = if (availability.isLocationAvailable) {
                    GpsStatus.READY
                } else {
                    GpsStatus.SEARCHING
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val typeName = intent.getStringExtra(EXTRA_WORKOUT_TYPE) ?: WorkoutType.RUNNING.name
                currentWorkoutType = WorkoutType.valueOf(typeName)
                startWorkoutTracking()
            }
            ACTION_PAUSE -> pauseWorkoutTracking()
            ACTION_RESUME -> resumeWorkoutTracking()
            ACTION_STOP -> stopWorkoutTracking()
        }
        return START_STICKY
    }

    private fun startWorkoutTracking() {
        _isTracking.value = true
        _isPaused.value = false
        _elapsedSeconds.value = 0
        _totalDistanceMeters.value = 0.0
        _currentPaceSecKm.value = 0
        _currentSpeedKmh.value = 0.0
        _pointsList.value = emptyList()
        _gpsStatus.value = GpsStatus.SEARCHING

        startForeground(NOTIFICATION_ID, buildNotification("Workout Active", "Recording GPS route..."))
        startLocationUpdates()
        startTimer()
    }

    private fun pauseWorkoutTracking() {
        _isPaused.value = true
        stopLocationUpdates()
        updateNotification("Workout Paused", "${GpsDistanceCalculator.formatDuration(_elapsedSeconds.value)} • ${String.format("%.2f", _totalDistanceMeters.value / 1000.0)} km")
    }

    private fun resumeWorkoutTracking() {
        _isPaused.value = false
        startLocationUpdates()
        updateNotification("Workout Resumed", "${GpsDistanceCalculator.formatDuration(_elapsedSeconds.value)} • ${String.format("%.2f", _totalDistanceMeters.value / 1000.0)} km")
    }

    private fun stopWorkoutTracking() {
        _isTracking.value = false
        stopLocationUpdates()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startLocationUpdates() {
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 2000)
            .setMinUpdateIntervalMillis(1000)
            .setMinUpdateDistanceMeters(2.0f)
            .build()

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            _gpsStatus.value = GpsStatus.LOST
        }
    }

    private fun stopLocationUpdates() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    private fun processNewLocation(location: Location) {
        val newPoint = GpsPoint(
            latitude = location.latitude,
            longitude = location.longitude,
            altitude = if (location.hasAltitude()) location.altitude else null,
            speed = if (location.hasSpeed()) location.speed else null,
            accuracy = if (location.hasAccuracy()) location.accuracy else null,
            timestamp = Instant.now()
        )

        val currentPoints = _pointsList.value
        val lastPoint = currentPoints.lastOrNull()

        if (GpsDistanceCalculator.isValidGpsPoint(lastPoint, newPoint)) {
            val updated = currentPoints + newPoint
            _pointsList.value = updated

            if (lastPoint != null) {
                val deltaMeters = GpsDistanceCalculator.calculateDistanceMeters(
                    lastPoint.latitude, lastPoint.longitude,
                    newPoint.latitude, newPoint.longitude
                )
                _totalDistanceMeters.value += deltaMeters

                val speedKmh = (newPoint.speed ?: 0f) * 3.6
                _currentSpeedKmh.value = speedKmh.toDouble()

                if (deltaMeters > 0 && _elapsedSeconds.value > 0) {
                    val distKm = _totalDistanceMeters.value / 1000.0
                    if (distKm > 0.05) {
                        _currentPaceSecKm.value = (_elapsedSeconds.value / distKm).toLong()
                    }
                }
            }
        }
    }

    private fun startTimer() {
        serviceScope.launch {
            while (_isTracking.value) {
                delay(1000)
                if (!_isPaused.value) {
                    _elapsedSeconds.value += 1
                    if (_elapsedSeconds.value % 5 == 0L) {
                        val distKm = _totalDistanceMeters.value / 1000.0
                        updateNotification(
                            "${currentWorkoutType.displayName} Active",
                            "${GpsDistanceCalculator.formatDuration(_elapsedSeconds.value)} • ${String.format("%.2f", distKm)} km • ${GpsDistanceCalculator.formatPace(_currentPaceSecKm.value)}"
                        )
                    }
                }
            }
        }
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Workout Active Tracking",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Maintains active GPS workout metrics and notification controls."
            setShowBadge(false)
        }
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)
    }

    private fun buildNotification(title: String, content: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .build()
    }

    private fun updateNotification(title: String, content: String) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, buildNotification(title, content))
    }

    override fun onDestroy() {
        serviceScope.cancel()
        stopLocationUpdates()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val CHANNEL_ID = "fitpulse_workout_channel"
        const val NOTIFICATION_ID = 2001

        const val ACTION_START = "ACTION_START"
        const val ACTION_PAUSE = "ACTION_PAUSE"
        const val ACTION_RESUME = "ACTION_RESUME"
        const val ACTION_STOP = "ACTION_STOP"
        const val EXTRA_WORKOUT_TYPE = "EXTRA_WORKOUT_TYPE"

        private var currentWorkoutType = WorkoutType.RUNNING

        private val _isTracking = MutableStateFlow(false)
        val isTracking = _isTracking.asStateFlow()

        private val _isPaused = MutableStateFlow(false)
        val isPaused = _isPaused.asStateFlow()

        private val _elapsedSeconds = MutableStateFlow(0L)
        val elapsedSeconds = _elapsedSeconds.asStateFlow()

        private val _totalDistanceMeters = MutableStateFlow(0.0)
        val totalDistanceMeters = _totalDistanceMeters.asStateFlow()

        private val _currentSpeedKmh = MutableStateFlow(0.0)
        val currentSpeedKmh = _currentSpeedKmh.asStateFlow()

        private val _currentPaceSecKm = MutableStateFlow(0L)
        val currentPaceSecKm = _currentPaceSecKm.asStateFlow()

        private val _gpsStatus = MutableStateFlow(GpsStatus.SEARCHING)
        val gpsStatus = _gpsStatus.asStateFlow()

        private val _pointsList = MutableStateFlow<List<GpsPoint>>(emptyList())
        val pointsList = _pointsList.asStateFlow()

        fun start(context: Context, type: WorkoutType) {
            val intent = Intent(context, WorkoutForegroundService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_WORKOUT_TYPE, type.name)
            }
            context.startForegroundService(intent)
        }

        fun pause(context: Context) {
            val intent = Intent(context, WorkoutForegroundService::class.java).apply {
                action = ACTION_PAUSE
            }
            context.startService(intent)
        }

        fun resume(context: Context) {
            val intent = Intent(context, WorkoutForegroundService::class.java).apply {
                action = ACTION_RESUME
            }
            context.startService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, WorkoutForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }
}
