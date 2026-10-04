import { DailyActivity, WorkoutSession, UserProfile, AiFitnessInsight } from '../types/fitness';

export function generateLocalInsights(
  today: DailyActivity,
  recentActivities: DailyActivity[],
  workouts: WorkoutSession[]
): AiFitnessInsight[] {
  const insights: AiFitnessInsight[] = [];

  // Step comparison with recent days
  const validPastDays = recentActivities.filter((a) => a.date !== today.date && a.steps > 0);
  if (validPastDays.length > 0) {
    const avgSteps = Math.round(validPastDays.reduce((acc, a) => acc + a.steps, 0) / validPastDays.length);
    if (today.steps > avgSteps) {
      insights.push({
        id: 'steps_above_avg',
        title: 'Above 7-Day Average',
        content: `You've recorded ${today.steps.toLocaleString()} steps today, exceeding your recent daily average of ${avgSteps.toLocaleString()} steps.`,
        category: 'ACTIVITY',
        timestamp: Date.now(),
      });
    } else if (today.steps < today.stepGoal) {
      const remaining = today.stepGoal - today.steps;
      insights.push({
        id: 'steps_close_to_goal',
        title: 'Daily Goal Within Reach',
        content: `You are ${remaining.toLocaleString()} steps away from your ${today.stepGoal.toLocaleString()} step goal. A 15-minute walk will close this gap.`,
        category: 'ACTIVITY',
        timestamp: Date.now(),
      });
    }
  } else {
    insights.push({
      id: 'activity_baseline',
      title: 'Building Activity Baseline',
      content: 'FitPulse is recording your daily movement from device sensors. Move consistently to build longitudinal health trends.',
      category: 'ACTIVITY',
      timestamp: Date.now(),
    });
  }

  // Hydration check
  if (today.waterMilliliters < today.waterGoalMl * 0.5) {
    const remainingMl = today.waterGoalMl - today.waterMilliliters;
    insights.push({
      id: 'water_reminder',
      title: 'Hydration Target',
      content: `You have logged ${today.waterMilliliters} ml of water today. Aim for another ${remainingMl} ml to maintain optimal cellular hydration.`,
      category: 'HYDRATION',
      timestamp: Date.now(),
    });
  }

  // Sleep analysis
  if (today.sleepMinutes) {
    const hours = (today.sleepMinutes / 60).toFixed(1);
    insights.push({
      id: 'sleep_recovery',
      title: 'Sleep & Recovery',
      content: `Recorded ${hours} hours of sleep last night. Adequate rest promotes muscular repair and central nervous system recovery.`,
      category: 'RECOVERY',
      timestamp: Date.now(),
    });
  } else {
    insights.push({
      id: 'sleep_unavailable',
      title: 'Sleep Tracking Status',
      content: "Sleep data isn't available for last night yet. Connect a compatible wearable or health platform in Health Connect to import sleep stages.",
      category: 'RECOVERY',
      timestamp: Date.now(),
    });
  }

  // Workout summary
  if (workouts.length > 0) {
    const totalKm = (workouts.reduce((acc, w) => acc + w.distanceMeters, 0) / 1000).toFixed(1);
    insights.push({
      id: 'workout_consistency',
      title: 'Workout Consistency',
      content: `You have completed ${workouts.length} recorded workout sessions totaling ${totalKm} km. Consistent progressive overload fosters aerobic endurance.`,
      category: 'STREAK',
      timestamp: Date.now(),
    });
  }

  return insights;
}

export function answerCoachQuery(
  query: string,
  today: DailyActivity,
  recentActivities: DailyActivity[],
  workouts: WorkoutSession[],
  profile: UserProfile
): string {
  const q = query.toLowerCase();

  // Guard against medical advice queries
  if (q.includes('diagnos') || q.includes('pain') || q.includes('chest') || q.includes('medicine') || q.includes('pill') || q.includes('injury')) {
    return "Medical safety advisory: As an AI fitness coach, I cannot diagnose medical conditions, evaluate acute chest pain or injuries, or prescribe medications. Please consult a qualified physician or healthcare professional immediately for medical evaluation.";
  }

  if (q.includes('step') || q.includes('walk')) {
    const remaining = Math.max(0, today.stepGoal - today.steps);
    return `Today you have recorded ${today.steps.toLocaleString()} steps out of your ${today.stepGoal.toLocaleString()} target (${Math.round((today.steps / today.stepGoal) * 100)}%). ${remaining > 0 ? `You have ${remaining.toLocaleString()} steps left to reach your target.` : "You've successfully hit your daily step goal!"}`;
  }

  if (q.includes('water') || q.includes('hydrat')) {
    const currentL = (today.waterMilliliters / 1000).toFixed(1);
    const goalL = (today.waterGoalMl / 1000).toFixed(1);
    return `You've logged ${currentL} L of water today against your ${goalL} L daily hydration goal (${Math.round((today.waterMilliliters / today.waterGoalMl) * 100)}%). Steady hydration supports cardiovascular volume and cognitive performance.`;
  }

  if (q.includes('workout') || q.includes('run') || q.includes('exercise')) {
    if (workouts.length === 0) {
      return "You haven't recorded any workouts yet. Start a walking, running, or cycling workout in the Workout tab to track your live GPS route, pace, distance, and calories.";
    }
    const lastWorkout = workouts[0];
    const distKm = (lastWorkout.distanceMeters / 1000).toFixed(2);
    const mins = Math.round(lastWorkout.durationSeconds / 60);
    return `You have recorded ${workouts.length} total workout session(s). Your most recent was a ${lastWorkout.type.toLowerCase()} session spanning ${distKm} km over ${mins} minutes, burning an estimated ${Math.round(lastWorkout.activeCalories)} active kcal.`;
  }

  if (q.includes('heart') || q.includes('pulse') || q.includes('bpm')) {
    if (today.averageHeartRate) {
      return `Your latest recorded heart rate is ${today.averageHeartRate} BPM, with a resting heart rate of ${today.restingHeartRate || '--'} BPM.`;
    }
    return "Heart rate data isn't available on this device right now. Connect a compatible wearable (e.g. Pixel Watch, Galaxy Watch, Garmin, Fitbit) or health platform via Health Connect to import real heart-rate telemetry.";
  }

  if (q.includes('sleep')) {
    if (today.sleepMinutes) {
      const hrs = Math.floor(today.sleepMinutes / 60);
      const mins = today.sleepMinutes % 60;
      return `Your recorded sleep duration for last night was ${hrs} hours and ${mins} minutes. Aim for consistent wake times to optimize circadian rhythm.`;
    }
    return "No sleep data is available yet for today. Wear your connected smartwatch to bed and verify Health Connect permissions to view sleep duration and stages.";
  }

  return `Based on your telemetry, you have completed ${today.steps.toLocaleString()} steps today, burned ${Math.round(today.activeCalories)} active kcal, and logged ${(today.waterMilliliters / 1000).toFixed(1)} L of water. Keep maintaining daily movement and hydration consistency!`;
}
