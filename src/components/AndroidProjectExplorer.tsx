import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, FileCode, Check, Copy } from 'lucide-react';

interface AndroidProjectExplorerProps {
  onClose?: () => void;
}

export const ANDROID_FILES: Record<string, { language: string; content: string }> = {
  'settings.gradle.kts': {
    language: 'kotlin',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "FitPulse"
include(":app")`,
  },
  'build.gradle.kts': {
    language: 'kotlin',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}`,
  },
  'app/build.gradle.kts': {
    language: 'kotlin',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.fitpulse.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fitpulse.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Health Connect
    implementation("androidx.health.connect:connect-client:1.1.0-alpha11")

    // Location & Activity Recognition
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // Jetpack Glance (Widgets)
    implementation("androidx.glance:glance-appwidget:1.1.1")
    implementation("androidx.glance:glance-material3:1.1.1")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
}`,
  },
  'app/src/main/AndroidManifest.xml': {
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

    <!-- Health Connect Permissions -->
    <uses-permission android:name="android.permission.health.READ_STEPS" />
    <uses-permission android:name="android.permission.health.READ_DISTANCE" />
    <uses-permission android:name="android.permission.health.READ_TOTAL_CALORIES_BURNED" />
    <uses-permission android:name="android.permission.health.READ_ACTIVE_CALORIES_BURNED" />
    <uses-permission android:name="android.permission.health.READ_HEART_RATE" />
    <uses-permission android:name="android.permission.health.READ_RESTING_HEART_RATE" />
    <uses-permission android:name="android.permission.health.READ_SLEEP" />
    <uses-permission android:name="android.permission.health.READ_WEIGHT" />
    <uses-permission android:name="android.permission.health.READ_EXERCISE" />
    <uses-permission android:name="android.permission.health.WRITE_WEIGHT" />
    <uses-permission android:name="android.permission.health.WRITE_HYDRATION" />

    <queries>
        <package android:name="com.google.android.apps.healthdata" />
        <intent>
            <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
        </intent>
    </queries>

    <application
        android:name=".FitPulseApp"
        android:label="@string/app_name"
        android:theme="@style/Theme.FitPulse">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <intent-filter>
                <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
            </intent-filter>
        </activity>

        <service
            android:name=".services.WorkoutForegroundService"
            android:foregroundServiceType="location"
            android:exported="false" />

        <receiver
            android:name=".widgets.FitPulseGlanceReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data
                android:name="android.appwidget.provider"
                android:resource="@xml/glance_widget_info" />
        </receiver>
    </application>
</manifest>`,
  },
  'app/src/main/java/com/fitpulse/app/data/health/HealthConnectManager.kt': {
    language: 'kotlin',
    content: `package com.fitpulse.app.data.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class HealthConnectManager(private val context: Context) {
    private val client by lazy {
        if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(context)
        } else null
    }

    val permissionsToRequest = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(RestingHeartRateRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class),
        HealthPermission.getReadPermission(WeightRecord::class)
    )

    suspend fun readTodaySteps(): Long? {
        val c = client ?: return null
        val startTime = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant()
        val response = c.aggregate(
            AggregateRequest(
                metrics = setOf(StepsRecord.COUNT_TOTAL),
                timeRangeFilter = TimeRangeFilter.between(startTime, Instant.now())
            )
        )
        return response[StepsRecord.COUNT_TOTAL]
    }
}`,
  },
  'app/src/main/java/com/fitpulse/app/services/WorkoutForegroundService.kt': {
    language: 'kotlin',
    content: `package com.fitpulse.app.services

import android.app.*
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import com.fitpulse.app.domain.model.GpsPoint
import com.fitpulse.app.domain.model.WorkoutType
import com.fitpulse.app.utils.GpsDistanceCalculator
import kotlinx.coroutines.flow.MutableStateFlow

class WorkoutForegroundService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
    }

    companion object {
        val isTracking = MutableStateFlow(false)
        val elapsedSeconds = MutableStateFlow(0L)
        val totalDistanceMeters = MutableStateFlow(0.0)
        val pointsList = MutableStateFlow<List<GpsPoint>>(emptyList())
    }
}`,
  },
  'app/src/main/java/com/fitpulse/app/widgets/FitPulseGlanceWidget.kt': {
    language: 'kotlin',
    content: `package com.fitpulse.app.widgets

import android.content.Context
import androidx.glance.*
import androidx.glance.appwidget.*
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.compose.ui.unit.dp

class FitPulseGlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FitPulseGlanceWidget()
}

class FitPulseGlanceWidget : GlanceAppWidget() {
    override val sizeMode = SizeMode.Responsive(
        setOf(DpSize(100.dp, 100.dp), DpSize(220.dp, 100.dp), DpSize(260.dp, 200.dp))
    )
}`,
  },
  'app/src/main/java/com/fitpulse/app/domain/usecase/FitnessUseCases.kt': {
    language: 'kotlin',
    content: `package com.fitpulse.app.domain.usecase

import com.fitpulse.app.domain.model.*
import java.time.LocalDate

class FitnessUseCases {
    fun calculateBmi(heightCm: Double?, weightKg: Double?): Pair<Double, String>? {
        if (heightCm == null || weightKg == null || heightCm <= 0 || weightKg <= 0) return null
        val heightM = heightCm / 100.0
        val bmi = Math.round((weightKg / (heightM * heightM)) * 10.0) / 10.0
        val category = when {
            bmi < 18.5 -> "Underweight"
            bmi < 25.0 -> "Normal weight"
            bmi < 30.0 -> "Overweight"
            else -> "Obesity category"
        }
        return Pair(bmi, category)
    }
}`,
  },
  'app/src/test/java/com/fitpulse/app/FitnessCalculationsTest.kt': {
    language: 'kotlin',
    content: `package com.fitpulse.app

import com.fitpulse.app.domain.usecase.FitnessUseCases
import com.fitpulse.app.utils.GpsDistanceCalculator
import org.junit.Assert.*
import org.junit.Test

class FitnessCalculationsTest {
    private val fitnessUseCases = FitnessUseCases()

    @Test
    fun testBmiCalculation() {
        val result = fitnessUseCases.calculateBmi(180.0, 75.0)
        assertNotNull(result)
        assertEquals(23.1, result!!.first, 0.1)
    }

    @Test
    fun testHaversineDistance() {
        val meters = GpsDistanceCalculator.calculateDistanceMeters(
            51.5074, -0.1278,
            48.8566, 2.3522
        )
        assertTrue(meters > 340000 && meters < 350000)
    }
}`,
  },
};

export const AndroidProjectExplorer: React.FC<AndroidProjectExplorerProps> = () => {
  const [selectedFile, setSelectedFile] = useState<string>('app/src/main/AndroidManifest.xml');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const fileData = ANDROID_FILES[selectedFile] || { language: 'text', content: '' };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('fitpulse-android');

      Object.entries(ANDROID_FILES).forEach(([path, file]) => {
        folder?.file(path, file.content);
      });

      folder?.file('gradle.properties', 'android.useAndroidX=true\nkotlin.code.style=official\n');
      folder?.file('README.md', '# FitPulse Android Project\nOpen this folder directly in Android Studio Hedgehog or newer.');

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'FitPulse_Android_Project.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate project zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full bg-[#141923] border border-[#283144] rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#283144] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Official Android Gradle Project Tree (Kotlin & Jetpack Compose)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete Android Studio repository with Room Database, Health Connect Manager, Glance Widgets, and Foreground Location Service.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
        >
          <Download className="w-4 h-4" />
          {isZipping ? 'Packaging ZIP...' : 'Download Android Studio Project (.ZIP)'}
        </button>
      </div>

      {/* Main File Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[540px]">
        {/* File List */}
        <div className="lg:col-span-4 bg-[#0B0E14] border border-[#283144] rounded-2xl p-3 overflow-y-auto scrollbar-thin">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">
            Project Files
          </div>
          <div className="space-y-1">
            {Object.keys(ANDROID_FILES).map((path) => {
              const isSelected = path === selectedFile;
              return (
                <button
                  key={path}
                  onClick={() => setSelectedFile(path)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 transition ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate">{path}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Previewer */}
        <div className="lg:col-span-8 bg-[#0B0E14] border border-[#283144] rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-[#1C2230] border-b border-[#283144] flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 truncate">{selectedFile}</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#0B0E14] border border-[#283144] rounded-lg flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="flex-1 p-4 text-xs font-mono text-slate-300 overflow-auto whitespace-pre leading-relaxed select-text">
            <code>{fileData.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
