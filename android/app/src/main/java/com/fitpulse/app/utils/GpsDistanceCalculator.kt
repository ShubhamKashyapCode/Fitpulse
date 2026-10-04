package com.fitpulse.app.utils

import com.fitpulse.app.domain.model.GpsPoint
import kotlin.math.*

object GpsDistanceCalculator {
    private const val EARTH_RADIUS_METERS = 6371000.0

    /**
     * Calculates distance between two coordinates using Haversine formula.
     */
    fun calculateDistanceMeters(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2.0) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2.0)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return EARTH_RADIUS_METERS * c
    }

    /**
     * Filters GPS noise: rejects points with accuracy > 25 meters or
     * sudden unrealistic jumps (> 50 m/s for human movement).
     */
    fun isValidGpsPoint(prevPoint: GpsPoint?, newPoint: GpsPoint): Boolean {
        // Discard poor accuracy points
        if (newPoint.accuracy != null && newPoint.accuracy > 30.0f) {
            return false
        }
        if (prevPoint == null) return true

        val distance = calculateDistanceMeters(
            prevPoint.latitude, prevPoint.longitude,
            newPoint.latitude, newPoint.longitude
        )
        val timeDiffSeconds = (newPoint.timestamp.toEpochMilli() - prevPoint.timestamp.toEpochMilli()) / 1000.0
        if (timeDiffSeconds <= 0.0) return false

        val calculatedSpeed = distance / timeDiffSeconds
        // If speed exceeds 45 m/s (~160 km/h) for a workout, it's a GPS jump
        return calculatedSpeed < 45.0
    }

    /**
     * Formats seconds into HH:MM:SS or MM:SS string
     */
    fun formatDuration(seconds: Long): String {
        val hrs = seconds / 3600
        val mins = (seconds % 3600) / 60
        val secs = seconds % 60
        return if (hrs > 0) {
            String.format("%02d:%02d:%02d", hrs, mins, secs)
        } else {
            String.format("%02d:%02d", mins, secs)
        }
    }

    /**
     * Formats pace (seconds per km) into M:SS / km
     */
    fun formatPace(paceSecPerKm: Long): String {
        if (paceSecPerKm <= 0 || paceSecPerKm > 3600) return "--:--"
        val mins = paceSecPerKm / 60
        val secs = paceSecPerKm % 60
        return String.format("%d:%02d / km", mins, secs)
    }
}
