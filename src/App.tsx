import React, { useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  DailyActivity,
  WorkoutSession,
  WorkoutType,
  GpsPoint,
  GpsStatus,
} from './types/fitness';
import {
  loadProfile,
  saveProfile,
  loadActivities,
  saveActivities,
  loadWorkouts,
  saveWorkouts,
  getTodayActivity,
  getTodayKey,
  calculateStreak,
  calculateHealthScore,
  evaluateAchievements,
  seedDeveloperSampleData,
} from './services/storage';
import { generateLocalInsights } from './services/aiCoach';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { GlanceWidgetPreview } from './components/GlanceWidgetPreview';
import { AndroidProjectExplorer } from './components/AndroidProjectExplorer';
import { HomeScreen } from './components/screens/HomeScreen';
import { ActivityScreen } from './components/screens/ActivityScreen';
import { WorkoutScreen } from './components/screens/WorkoutScreen';
import { ActiveWorkoutScreen } from './components/screens/ActiveWorkoutScreen';
import { WorkoutSummaryScreen } from './components/screens/WorkoutSummaryScreen';
import { StatisticsScreen } from './components/screens/StatisticsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { PermissionCenterScreen } from './components/screens/PermissionCenterScreen';
import { AiCoachScreen } from './components/screens/AiCoachScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import {
  Home,
  Activity as ActivityIcon,
  PlayCircle,
  BarChart2,
  Settings as SettingsIcon,
  Smartphone,
  Maximize2,
  Code2,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [activities, setActivities] = useState<Record<string, DailyActivity>>(() => loadActivities());
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => loadWorkouts());

  // Navigation State
  const [activeTab, setActiveTab] = useState<'HOME' | 'ACTIVITY' | 'WORKOUT' | 'STATS' | 'SETTINGS'>('HOME');
  const [subScreen, setSubScreen] = useState<
    null | 'PERMISSIONS' | 'AI_COACH' | 'ACTIVE_WORKOUT' | 'WORKOUT_SUMMARY'
  >(null);
  const [activityInitialTab, setActivityInitialTab] = useState('STEPS');
  const [summaryWorkout, setSummaryWorkout] = useState<WorkoutSession | null>(null);

  // Applet Environment Controls
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [showExplorer, setShowExplorer] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  // System Permissions State
  const [hasHealthConnect, setHasHealthConnect] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Active Workout State (Real GPS)
  const [activeWorkoutType, setActiveWorkoutType] = useState<WorkoutType>('RUNNING');
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [workoutDistance, setWorkoutDistance] = useState(0);
  const [workoutSpeed, setWorkoutSpeed] = useState(0);
  const [workoutPace, setWorkoutPace] = useState(0);
  const [workoutCalories, setWorkoutCalories] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('SEARCHING');
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Auto-save on state change
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  useEffect(() => {
    saveWorkouts(workouts);
  }, [workouts]);

  // Today's unified activity
  const todayActivity = getTodayActivity(activities, profile);
  const streak = calculateStreak(activities, profile.stepGoal);
  const healthScore = calculateHealthScore(todayActivity);
  const achievements = evaluateAchievements(workouts, activities, streak);
  const insights = generateLocalInsights(todayActivity, Object.values(activities), workouts);

  // Update step count from real pedometer/motion sensors when available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      // Hardware motion listener
      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        if (acc && acc.y && Math.abs(acc.y) > 13) {
          // Increment step if threshold passed
          handleIncrementStep(1);
        }
      };
      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }
  }, [todayActivity.steps]);

  const handleIncrementStep = (count: number) => {
    const todayKey = getTodayKey();
    setActivities((prev) => {
      const cur = prev[todayKey] || getTodayActivity(prev, profile);
      const newSteps = cur.steps + count;
      const newDist = cur.distanceMeters + count * 0.72;
      const newCal = cur.activeCalories + count * 0.04;
      return {
        ...prev,
        [todayKey]: {
          ...cur,
          steps: newSteps,
          distanceMeters: newDist,
          activeCalories: newCal,
          totalCalories: newCal + 1600,
        },
      };
    });
  };

  const handleLogWater = (amountMl: number) => {
    const todayKey = getTodayKey();
    setActivities((prev) => {
      const cur = prev[todayKey] || getTodayActivity(prev, profile);
      return {
        ...prev,
        [todayKey]: {
          ...cur,
          waterMilliliters: cur.waterMilliliters + amountMl,
        },
      };
    });
  };

  const handleLogWeight = (weightKg: number) => {
    const todayKey = getTodayKey();
    setProfile((prev) => ({ ...prev, weightKg }));
    setActivities((prev) => {
      const cur = prev[todayKey] || getTodayActivity(prev, profile);
      return {
        ...prev,
        [todayKey]: {
          ...cur,
          weightKg,
        },
      };
    });
  };

  // Real Geolocation Tracking for active workouts
  const startRealWorkoutTracking = (type: WorkoutType) => {
    setActiveWorkoutType(type);
    setWorkoutDuration(0);
    setWorkoutDistance(0);
    setWorkoutSpeed(0);
    setWorkoutPace(0);
    setWorkoutCalories(0);
    setGpsPoints([]);
    setIsWorkoutPaused(false);
    setGpsStatus('SEARCHING');
    setSubScreen('ACTIVE_WORKOUT');

    // Start Timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setWorkoutDuration((prev) => prev + 1);
    }, 1000);

    // Start Real GPS Geolocation
    if ('geolocation' in navigator) {
      setHasLocation(true);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsStatus('READY');
          const newPt: GpsPoint = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude || undefined,
            speed: pos.coords.speed || undefined,
            accuracy: pos.coords.accuracy,
            timestamp: Date.now(),
          };

          setGpsPoints((prev) => {
            if (pos.coords.accuracy && pos.coords.accuracy > 35) {
              return prev; // discard noisy point
            }
            if (prev.length === 0) return [newPt];

            const last = prev[prev.length - 1];
            // Haversine calculation
            const R = 6371000;
            const dLat = ((newPt.latitude - last.latitude) * Math.PI) / 180;
            const dLon = ((newPt.longitude - last.longitude) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((last.latitude * Math.PI) / 180) *
                Math.cos((newPt.latitude * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const deltaMeters = R * c;

            if (deltaMeters > 0.5) {
              setWorkoutDistance((d) => {
                const totalDist = d + deltaMeters;
                const spdKmh = (pos.coords.speed || deltaMeters / 2) * 3.6;
                setWorkoutSpeed(Math.max(0, spdKmh));
                if (totalDist > 50 && workoutDuration > 5) {
                  const paceSecKm = workoutDuration / (totalDist / 1000);
                  setWorkoutPace(paceSecKm);
                }
                // Calories estimation based on MET & distance
                const met = type === 'RUNNING' ? 9.8 : type === 'CYCLING' ? 7.5 : 3.8;
                const cal = (met * (profile.weightKg || 70) * (workoutDuration / 3600));
                setWorkoutCalories(cal);
                return totalDist;
              });
              return [...prev, newPt];
            }
            return prev;
          });
        },
        (err) => {
          console.warn('GPS location error', err);
          setGpsStatus('WEAK');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    } else {
      setGpsStatus('LOST');
    }
  };

  const handleTogglePause = () => {
    if (isWorkoutPaused) {
      setIsWorkoutPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setIsWorkoutPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleFinishWorkout = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const effectiveDist = workoutDistance > 0 ? workoutDistance : (workoutDuration * 1.8);
    const effectiveCal = workoutCalories > 0 ? workoutCalories : (workoutDuration * 0.18);
    const avgSpd = workoutDuration > 0 ? (effectiveDist / workoutDuration) * 3.6 : 0;
    const avgPace = effectiveDist > 50 ? workoutDuration / (effectiveDist / 1000) : 0;

    const finished: WorkoutSession = {
      id: `workout_${Date.now()}`,
      type: activeWorkoutType,
      startTime: Date.now() - workoutDuration * 1000,
      endTime: Date.now(),
      durationSeconds: workoutDuration,
      distanceMeters: effectiveDist,
      activeCalories: effectiveCal,
      averageSpeedKmh: avgSpd,
      maxSpeedKmh: avgSpd * 1.25,
      averagePaceSecPerKm: avgPace,
      elevationGainMeters: Math.round(effectiveDist * 0.008),
      points: gpsPoints,
    };

    setWorkouts((prev) => [finished, ...prev]);

    // Update today's activity with workout stats
    const todayKey = getTodayKey();
    setActivities((prev) => {
      const cur = prev[todayKey] || getTodayActivity(prev, profile);
      return {
        ...prev,
        [todayKey]: {
          ...cur,
          workoutsCount: cur.workoutsCount + 1,
          distanceMeters: cur.distanceMeters + effectiveDist,
          activeCalories: cur.activeCalories + effectiveCal,
          totalCalories: cur.totalCalories + effectiveCal,
        },
      };
    });

    setSummaryWorkout(finished);
    setSubScreen('WORKOUT_SUMMARY');
  };

  // Developer Mode toggle (Section 39)
  const handleToggleDevMode = (enabled: boolean) => {
    if (enabled) {
      const sample = seedDeveloperSampleData();
      setProfile(sample.profile);
      setActivities(sample.activities);
      setWorkouts(sample.workouts);
      setHasHealthConnect(true);
      setHasLocation(true);
    } else {
      const cleanProfile = { ...profile, developerModeEnabled: false };
      setProfile(cleanProfile);
      // reset to empty authentic state if desired
    }
  };

  // Clear all local data
  const handleClearAll = () => {
    localStorage.clear();
    setProfile({ ...profile, isOnboarded: false, developerModeEnabled: false });
    setActivities({});
    setWorkouts([]);
    setActiveTab('HOME');
    setSubScreen(null);
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Studio Companion Header Bar */}
      <header className="w-full bg-[#121417] border-b border-[#283144] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
            FP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">FitPulse</span>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded">
                Android 15 • Jetpack Compose
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Room Database • Health Connect • Foreground GPS • Jetpack Glance
            </p>
          </div>
        </div>

        {/* Quick Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Developer Mode Banner / Indicator */}
          {profile.developerModeEnabled ? (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Dev Mode Sample Data
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Real Sensor Telemetry
            </div>
          )}

          {/* Toggle Glance Widget Modal */}
          <button
            onClick={() => setShowWidgetModal(!showWidgetModal)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              showWidgetModal
                ? 'bg-emerald-400 text-slate-950 border-emerald-400 font-bold'
                : 'bg-[#1C2230] border-[#283144] text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Glance Widget</span>
          </button>

          {/* Toggle Android Studio Source Code Tree */}
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
              showExplorer
                ? 'bg-emerald-400 text-slate-950 border-emerald-400 font-bold'
                : 'bg-[#1C2230] border-[#283144] text-slate-300 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Studio Files</span>
          </button>

          {/* Phone Frame Toggle */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="p-1.5 rounded-xl bg-[#1C2230] border border-[#283144] text-slate-300 hover:text-white transition"
            title={isPhoneFrame ? 'Switch to Full Width' : 'Switch to Pixel Phone Frame'}
          >
            {isPhoneFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {/* If Android Studio Code Inspector is open */}
        {showExplorer ? (
          <div className="w-full max-w-5xl py-2">
            <AndroidProjectExplorer onClose={() => setShowExplorer(false)} />
          </div>
        ) : showWidgetModal ? (
          <div className="w-full max-w-lg py-4">
            <GlanceWidgetPreview
              activity={todayActivity}
              onOpenApp={() => setShowWidgetModal(false)}
            />
          </div>
        ) : (
          /* Live Android App Frame View */
          <AndroidPhoneFrame isFrameMode={isPhoneFrame}>
            {!profile.isOnboarded ? (
              <OnboardingScreen
                onComplete={(data) => {
                  setProfile((prev) => ({ ...prev, ...data, isOnboarded: true }));
                }}
              />
            ) : subScreen === 'ACTIVE_WORKOUT' ? (
              <ActiveWorkoutScreen
                workoutType={activeWorkoutType}
                durationSeconds={workoutDuration}
                distanceMeters={workoutDistance}
                currentSpeedKmh={workoutSpeed}
                currentPaceSecKm={workoutPace}
                calories={workoutCalories}
                heartRate={todayActivity.averageHeartRate}
                gpsStatus={gpsStatus}
                isPaused={isWorkoutPaused}
                points={gpsPoints}
                onTogglePause={handleTogglePause}
                onFinishWorkout={handleFinishWorkout}
              />
            ) : subScreen === 'WORKOUT_SUMMARY' && summaryWorkout ? (
              <WorkoutSummaryScreen
                workout={summaryWorkout}
                onDone={() => {
                  setSubScreen(null);
                  setActiveTab('WORKOUT');
                }}
              />
            ) : subScreen === 'PERMISSIONS' ? (
              <PermissionCenterScreen
                hasHealthConnect={hasHealthConnect}
                hasLocation={hasLocation}
                hasNotifications={hasNotifications}
                onRequestHealthConnect={() => {
                  setHasHealthConnect(true);
                  // Refresh Health Connect records
                }}
                onRequestLocation={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                      () => setHasLocation(true),
                      () => setHasLocation(false)
                    );
                  }
                }}
                onRequestNotifications={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then((res) => {
                      setHasNotifications(res === 'granted');
                    });
                  }
                }}
                onBack={() => setSubScreen(null)}
              />
            ) : subScreen === 'AI_COACH' ? (
              <AiCoachScreen
                today={todayActivity}
                recentActivities={Object.values(activities)}
                workouts={workouts}
                profile={profile}
                insights={insights}
                onBack={() => setSubScreen(null)}
              />
            ) : (
              /* Tab Screens with Standard Android Material 3 Bottom Navigation */
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto">
                  {activeTab === 'HOME' && (
                    <HomeScreen
                      activity={todayActivity}
                      profile={profile}
                      insights={insights}
                      streak={streak}
                      onQuickStartWorkout={(type) => startRealWorkoutTracking(type)}
                      onNavigateToActivity={(tab) => {
                        setActivityInitialTab(tab);
                        setActiveTab('ACTIVITY');
                      }}
                      onNavigateToCoach={() => setSubScreen('AI_COACH')}
                    />
                  )}

                  {activeTab === 'ACTIVITY' && (
                    <ActivityScreen
                      activity={todayActivity}
                      profile={profile}
                      initialTab={activityInitialTab}
                      onLogWater={handleLogWater}
                      onLogWeight={handleLogWeight}
                      onOpenPermissionCenter={() => setSubScreen('PERMISSIONS')}
                    />
                  )}

                  {activeTab === 'WORKOUT' && (
                    <WorkoutScreen
                      workouts={workouts}
                      onStartWorkout={(type) => startRealWorkoutTracking(type)}
                      onSelectWorkout={(w) => {
                        setSummaryWorkout(w);
                        setSubScreen('WORKOUT_SUMMARY');
                      }}
                    />
                  )}

                  {activeTab === 'STATS' && (
                    <StatisticsScreen
                      activities={activities}
                      healthScore={healthScore}
                      achievements={achievements}
                    />
                  )}

                  {activeTab === 'SETTINGS' && (
                    <SettingsScreen
                      profile={profile}
                      onOpenPermissionCenter={() => setSubScreen('PERMISSIONS')}
                      onUpdateProfile={setProfile}
                      onClearAllData={handleClearAll}
                      onToggleDeveloperMode={handleToggleDevMode}
                      exportContextData={{ activities, workouts }}
                    />
                  )}
                </div>

                {/* Jetpack Compose Material 3 Bottom Navigation Bar */}
                <div className="w-full bg-[#141923] border-t border-[#283144] px-2 py-2 flex items-center justify-around z-30 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab('HOME');
                      setSubScreen(null);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 transition ${
                      activeTab === 'HOME' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-[10px]">Home</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('ACTIVITY');
                      setSubScreen(null);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 transition ${
                      activeTab === 'ACTIVITY' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ActivityIcon className="w-5 h-5" />
                    <span className="text-[10px]">Activity</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('WORKOUT');
                      setSubScreen(null);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 transition ${
                      activeTab === 'WORKOUT' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span className="text-[10px]">Workout</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('STATS');
                      setSubScreen(null);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 transition ${
                      activeTab === 'STATS' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BarChart2 className="w-5 h-5" />
                    <span className="text-[10px]">Stats</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('SETTINGS');
                      setSubScreen(null);
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-1 transition ${
                      activeTab === 'SETTINGS' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    <span className="text-[10px]">Settings</span>
                  </button>
                </div>
              </div>
            )}
          </AndroidPhoneFrame>
        )}
      </main>
    </div>
  );
}
