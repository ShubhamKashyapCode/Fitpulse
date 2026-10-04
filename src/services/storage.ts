import { DailyActivity, UserProfile, WorkoutSession, Achievement, HealthScore } from '../types/fitness';

const STORAGE_KEYS = {
  PROFILE: 'fitpulse_profile',
  ACTIVITIES: 'fitpulse_daily_activities',
  WORKOUTS: 'fitpulse_workouts',
  PERMISSIONS: 'fitpulse_permissions',
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Athlete',
  age: 28,
  gender: 'other',
  heightCm: 175,
  weightKg: 70,
  activityLevel: 'MODERATE',
  unitSystem: 'METRIC',
  stepGoal: 10000,
  waterGoalMl: 2500,
  sleepGoalMinutes: 480,
  weeklyWorkoutGoal: 4,
  isOnboarded: false,
  developerModeEnabled: false,
};

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadActivities(): Record<string, DailyActivity> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activities', e);
  }
  return {};
}

export function saveActivities(activities: Record<string, DailyActivity>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities', e);
  }
}

export function loadWorkouts(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load workouts', e);
  }
  return [];
}

export function saveWorkouts(workouts: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  } catch (e) {
    console.error('Failed to save workouts', e);
  }
}

export function getTodayActivity(
  activities: Record<string, DailyActivity>,
  profile: UserProfile
): DailyActivity {
  const todayKey = getTodayKey();
  if (activities[todayKey]) {
    return activities[todayKey];
  }

  // Strictly follow production rules: no fake metrics
  return {
    date: todayKey,
    steps: 0,
    distanceMeters: 0,
    activeCalories: 0,
    totalCalories: 0,
    waterMilliliters: 0,
    workoutsCount: 0,
    stepGoal: profile.stepGoal,
    waterGoalMl: profile.waterGoalMl,
    sleepGoalMinutes: profile.sleepGoalMinutes,
  };
}

export function calculateBmi(heightCm?: number, weightKg?: number): { bmi: number; category: string } | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obesity category';
  return { bmi, category };
}

export function calculateStreak(activities: Record<string, DailyActivity>, stepGoal: number): number {
  let streak = 0;
  const today = new Date();
  const todayKey = getTodayKey();

  // If today reached the goal, count today
  const todayActivity = activities[todayKey];
  let checkDate = new Date(today);

  if (todayActivity && todayActivity.steps >= stepGoal) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is still ongoing, check starting from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    const act = activities[key];
    if (act && act.steps >= stepGoal) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateHealthScore(today: DailyActivity): HealthScore {
  const stepRatio = Math.min(1.2, today.steps / (today.stepGoal || 10000));
  const activityScore = Math.min(30, Math.round(stepRatio * 25));

  const waterRatio = Math.min(1.0, today.waterMilliliters / (today.waterGoalMl || 2500));
  const hydrationScore = Math.min(20, Math.round(waterRatio * 20));

  let sleepScore = 15;
  if (today.sleepMinutes !== undefined) {
    const sleepRatio = Math.min(1.0, today.sleepMinutes / (today.sleepGoalMinutes || 480));
    sleepScore = Math.min(25, Math.round(sleepRatio * 25));
  }

  const workoutScore = Math.min(15, today.workoutsCount * 10);

  let recoveryScore = 7;
  if (today.restingHeartRate) {
    if (today.restingHeartRate >= 50 && today.restingHeartRate <= 70) recoveryScore = 10;
    else if (today.restingHeartRate <= 80) recoveryScore = 8;
    else recoveryScore = 5;
  }

  const total = Math.min(100, activityScore + hydrationScore + sleepScore + workoutScore + recoveryScore);

  return {
    score: total,
    activityScore,
    sleepScore,
    hydrationScore,
    workoutScore,
    recoveryScore,
    disclaimer: 'This is a wellness score generated by FitPulse and is not a medical measurement.',
  };
}

export function evaluateAchievements(
  workouts: WorkoutSession[],
  activities: Record<string, DailyActivity>,
  streak: number
): Achievement[] {
  const totalWorkouts = workouts.length;
  const totalDistanceKm = workouts.reduce((acc, w) => acc + w.distanceMeters, 0) / 1000;
  const maxSteps = Object.values(activities).reduce((acc, a) => Math.max(acc, a.steps), 0);

  return [
    {
      id: 'first_workout',
      title: 'First Workout',
      description: 'Complete and record your first workout session.',
      icon: '🏆',
      isUnlocked: totalWorkouts >= 1,
      progress: Math.min(1, totalWorkouts / 1),
    },
    {
      id: 'workout_10',
      title: '10 Workouts Club',
      description: 'Record 10 complete workout sessions.',
      icon: '💪',
      isUnlocked: totalWorkouts >= 10,
      progress: Math.min(1, totalWorkouts / 10),
    },
    {
      id: 'distance_5k',
      title: 'First 5K',
      description: 'Record a single workout of 5 km or more.',
      icon: '🏃',
      isUnlocked: workouts.some((w) => w.distanceMeters >= 5000),
      progress: workouts.some((w) => w.distanceMeters >= 5000) ? 1 : 0.5,
    },
    {
      id: 'distance_100k',
      title: 'Centurion (100 KM)',
      description: 'Accumulate 100 km across all recorded workouts.',
      icon: '🎖️',
      isUnlocked: totalDistanceKm >= 100,
      progress: Math.min(1, totalDistanceKm / 100),
    },
    {
      id: 'steps_10k',
      title: '10,000 Steps',
      description: 'Walk 10,000 steps in a single calendar day.',
      icon: '👟',
      isUnlocked: maxSteps >= 10000,
      progress: Math.min(1, maxSteps / 10000),
    },
    {
      id: 'steps_25k',
      title: '25,000 Steps Explorer',
      description: 'Reach 25,000 steps in a single calendar day.',
      icon: '⛰️',
      isUnlocked: maxSteps >= 25000,
      progress: Math.min(1, maxSteps / 25000),
    },
    {
      id: 'streak_7',
      title: '7-Day Consistency',
      description: 'Maintain a 7-day daily goal achievement streak.',
      icon: '🔥',
      isUnlocked: streak >= 7,
      progress: Math.min(1, streak / 7),
    },
    {
      id: 'streak_30',
      title: '30-Day Champion',
      description: 'Maintain a 30-day streak of reaching your daily fitness goals.',
      icon: '👑',
      isUnlocked: streak >= 30,
      progress: Math.min(1, streak / 30),
    },
  ];
}

export function exportDataAsJson(profile: UserProfile, activities: Record<string, DailyActivity>, workouts: WorkoutSession[]) {
  const data = {
    exportedAt: new Date().toISOString(),
    application: 'FitPulse Android',
    profile,
    activities,
    workouts,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse_health_export_${getTodayKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataAsCsv(activities: Record<string, DailyActivity>, workouts: WorkoutSession[]) {
  let csv = 'Type,Date,Steps,Distance_Meters,Active_Calories,Duration_Seconds,Average_Pace,Water_Ml,Weight_Kg\n';
  Object.values(activities).forEach((act) => {
    csv += `DailyActivity,${act.date},${act.steps},${act.distanceMeters.toFixed(1)},${act.activeCalories.toFixed(1)},0,0,${act.waterMilliliters},${act.weightKg || ''}\n`;
  });
  workouts.forEach((w) => {
    const date = new Date(w.startTime).toISOString().split('T')[0];
    csv += `Workout_${w.type},${date},0,${w.distanceMeters.toFixed(1)},${w.activeCalories.toFixed(1)},${w.durationSeconds},${w.averagePaceSecPerKm},0,\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitpulse_metrics_${getTodayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Section 39: Development Only Mode sample data generator.
 * Clearly separates demo UI states from production real data.
 */
export function seedDeveloperSampleData(): {
  profile: UserProfile;
  activities: Record<string, DailyActivity>;
  workouts: WorkoutSession[];
} {
  const profile: UserProfile = {
    id: 'user_dev',
    name: 'Dev Athlete',
    age: 29,
    gender: 'male',
    heightCm: 180,
    weightKg: 74.5,
    activityLevel: 'VERY_ACTIVE',
    unitSystem: 'METRIC',
    stepGoal: 10000,
    waterGoalMl: 2800,
    sleepGoalMinutes: 480,
    weeklyWorkoutGoal: 5,
    isOnboarded: true,
    developerModeEnabled: true,
  };

  const today = new Date();
  const activities: Record<string, DailyActivity> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const steps = i === 0 ? 7842 : 8500 + (i * 450);
    activities[key] = {
      date: key,
      steps,
      distanceMeters: steps * 0.72,
      activeCalories: Math.round(steps * 0.045),
      totalCalories: Math.round(steps * 0.045 + 1750),
      restingHeartRate: 64,
      averageHeartRate: 72,
      minHeartRate: 54,
      maxHeartRate: 148,
      sleepMinutes: 462,
      waterMilliliters: i === 0 ? 1800 : 2600,
      weightKg: 74.5,
      workoutsCount: i % 2 === 0 ? 1 : 0,
      stepGoal: 10000,
      waterGoalMl: 2800,
      sleepGoalMinutes: 480,
    };
  }

  const workouts: WorkoutSession[] = [
    {
      id: 'workout_sample_1',
      type: 'RUNNING',
      startTime: Date.now() - 3600000 * 4,
      endTime: Date.now() - 3600000 * 3.5,
      durationSeconds: 1938, // 32m 18s
      distanceMeters: 5210, // 5.21 km
      activeCalories: 342,
      averageSpeedKmh: 9.7,
      maxSpeedKmh: 13.4,
      averagePaceSecPerKm: 372, // 6:12 / km
      elevationGainMeters: 42,
      averageHeartRate: 148,
      maxHeartRate: 168,
      points: [
        { latitude: 37.7749, longitude: -122.4194, altitude: 15, speed: 2.7, accuracy: 4, timestamp: Date.now() - 1938000 },
        { latitude: 37.7760, longitude: -122.4180, altitude: 18, speed: 2.8, accuracy: 4, timestamp: Date.now() - 1500000 },
        { latitude: 37.7785, longitude: -122.4160, altitude: 22, speed: 2.6, accuracy: 4, timestamp: Date.now() - 1000000 },
        { latitude: 37.7810, longitude: -122.4140, altitude: 20, speed: 2.7, accuracy: 4, timestamp: Date.now() - 500000 },
        { latitude: 37.7830, longitude: -122.4120, altitude: 16, speed: 2.5, accuracy: 4, timestamp: Date.now() },
      ],
      notes: 'Morning neighborhood tempo run',
    },
  ];

  return { profile, activities, workouts };
}
