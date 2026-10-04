export type WorkoutType = 'WALKING' | 'RUNNING' | 'CYCLING' | 'HIKING' | 'GYM' | 'TREADMILL' | 'OTHER';

export type GpsStatus = 'READY' | 'SEARCHING' | 'WEAK' | 'LOST';

export interface GpsPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

export interface WorkoutSession {
  id: string;
  type: WorkoutType;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  distanceMeters: number;
  activeCalories: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  averagePaceSecPerKm: number;
  elevationGainMeters: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  points: GpsPoint[];
  notes?: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceMeters: number;
  activeCalories: number;
  totalCalories: number;
  restingHeartRate?: number;
  averageHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  sleepMinutes?: number;
  waterMilliliters: number;
  weightKg?: number;
  workoutsCount: number;
  stepGoal: number;
  waterGoalMl: number;
  sleepGoalMinutes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  activityLevel: 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE';
  unitSystem: 'METRIC' | 'IMPERIAL';
  stepGoal: number;
  waterGoalMl: number;
  sleepGoalMinutes: number;
  weeklyWorkoutGoal: number;
  weightTargetKg?: number;
  isOnboarded: boolean;
  developerModeEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: number; // 0 to 1
}

export interface HealthScore {
  score: number;
  activityScore: number;
  sleepScore: number;
  hydrationScore: number;
  workoutScore: number;
  recoveryScore: number;
  disclaimer: string;
}

export interface AiFitnessInsight {
  id: string;
  title: string;
  content: string;
  category: 'ACTIVITY' | 'RECOVERY' | 'HYDRATION' | 'STREAK';
  timestamp: number;
}
