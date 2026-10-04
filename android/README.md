# FitPulse - Production-Quality Android Fitness & Health Application

FitPulse is a modern, privacy-first Android fitness and health application engineered with **Kotlin**, **Jetpack Compose**, **Material 3**, **Room Database**, **Health Connect**, **Jetpack Glance**, and Android's official **Foreground Service & Location APIs**.

---

## 🏗️ Architecture & Technology Stack

- **UI Layer**: Jetpack Compose, Material 3, StateFlow, Coroutines.
- **Data Layer**:
  - **Room Database**: Local encrypted SQLite database storing user profiles, workouts, GPS points, water intake, weight logs, and achievements.
  - **Health Connect**: Official Android Health Connect SDK (`androidx.health.connect:connect-client`) to read real aggregated daily steps, distance, active calories, resting heart rate, sleep sessions, and weight.
- **Background & GPS Services**:
  - **Foreground Service**: `WorkoutForegroundService` with notification controls (`location` service type) to record GPS workouts when minimized or screen locked.
  - **Jetpack Glance**: Interactive Android home-screen widget supporting Small, Medium, and Large layouts.
- **Privacy-First**: No health metrics leave the device.

---

## 🚀 How to Build & Run in Android Studio

1. Open **Android Studio** (Hedgehog, Iguana, or Koala).
2. Choose **Open an Existing Project** and select the `/android` folder.
3. Allow Gradle sync to complete with JDK 17.
4. Run on an Android 14+ or Android 10+ device/emulator with **Health Connect** installed.
5. To build debug APK via terminal:
   ```bash
   ./gradlew assembleDebug
   ```
6. To run unit tests:
   ```bash
   ./gradlew testDebugUnitTest
   ```

---

## 🔒 Data Accuracy & Sensor Transparency

In adherence to strict health telemetry standards:
- **No data fabrication**: FitPulse never fabricates steps, heart rate, or sleep stages.
- If a sensor or wearable is not connected, the UI displays **"Data unavailable"** with actionable guidance on connecting Health Connect or supported Bluetooth wearables.
- A **Developer Mode** toggle in Settings allows previewing mock UI states without ever mixing fake numbers into production logs.
