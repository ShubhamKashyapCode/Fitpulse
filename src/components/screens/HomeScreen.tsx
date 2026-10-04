import React from 'react';
import { DailyActivity, UserProfile, WorkoutType, AiFitnessInsight } from '../../types/fitness';
import { Sparkles, Flame, Droplet, Moon, Heart, ChevronRight, Play } from 'lucide-react';

interface HomeScreenProps {
  activity: DailyActivity;
  profile: UserProfile;
  insights: AiFitnessInsight[];
  streak: number;
  onQuickStartWorkout: (type: WorkoutType) => void;
  onNavigateToActivity: (tab: string) => void;
  onNavigateToCoach: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activity,
  profile,
  insights,
  streak,
  onQuickStartWorkout,
  onNavigateToActivity,
  onNavigateToCoach,
}) => {
  const stepRatio = Math.min(1, activity.steps / (activity.stepGoal || 10000));
  const percent = Math.round(stepRatio * 100);
  const remainingSteps = Math.max(0, activity.stepGoal - activity.steps);

  const topInsight = insights[0] || {
    id: 'default',
    title: 'Daily Movement Momentum',
    content: 'FitPulse records your authentic sensor data locally. Regular walking throughout the day boosts metabolic recovery.',
    category: 'ACTIVITY',
  };

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - stepRatio * circumference;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Good day, {profile.name}</h1>
          <p className="text-xs text-slate-400">Every step moves you forward</p>
        </div>
        <button
          onClick={onNavigateToCoach}
          className="w-10 h-10 rounded-full bg-[#1C2230] border border-[#283144] flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition active:scale-95 shadow-md"
          title="AI Coach"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Streak Badge */}
      {streak > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 rounded-xl w-fit">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
            🔥 {streak} DAY STREAK
          </span>
        </div>
      )}

      {/* Hero Step Card with Animated Progress Ring */}
      <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase mb-3">
          TODAY'S STEPS
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-black text-white tracking-tight">
              {activity.steps.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Goal: {activity.stepGoal.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-1">
              {percent}% achieved
            </div>
          </div>

          {/* SVG Circular Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-[#283144]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-2xl">🚶</span>
          </div>
        </div>

        <div className="border-t border-[#283144] my-4" />

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-3 text-center divide-x divide-[#283144]">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">DISTANCE</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {(activity.distanceMeters / 1000).toFixed(2)} km
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">ACTIVE KCAL</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {Math.round(activity.activeCalories)} kcal
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">REMAINING</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {remainingSteps.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Hourly Activity Visualization */}
        <div className="mt-4 pt-3 border-t border-[#283144]/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            HOURLY ACTIVITY VISUALIZATION
          </div>
          <div className="flex items-end justify-between h-12 gap-1.5 pt-2">
            {[
              { label: '8 AM', val: 35 },
              { label: '10 AM', val: 75 },
              { label: '12 PM', val: 90 },
              { label: '2 PM', val: 45 },
              { label: '4 PM', val: 60 },
              { label: '6 PM', val: 85 },
              { label: '8 PM', val: 20 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full bg-emerald-400/80 hover:bg-emerald-400 rounded-t-sm transition-all"
                  style={{ height: `${Math.max(10, (bar.val * (activity.steps > 0 ? 1 : 0.2)))}%` }}
                />
                <span className="text-[8px] text-slate-500 font-mono">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HEALTH SNAPSHOT Grid */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          HEALTH SNAPSHOT
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Heart Rate */}
          <div
            onClick={() => onNavigateToActivity('HEART')}
            className="bg-[#1C2230] border border-[#283144] rounded-2xl p-3.5 cursor-pointer hover:border-emerald-500/40 transition active:scale-98 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
              <Heart className="w-4 h-4 fill-rose-500/30" />
              <span>Heart Rate</span>
            </div>
            <div className="my-2">
              <div className="text-lg font-bold text-white">
                {activity.averageHeartRate ? `${activity.averageHeartRate} BPM` : 'Data unavailable'}
              </div>
              <div className={`text-[10px] mt-0.5 ${activity.averageHeartRate ? 'text-slate-400' : 'text-amber-400 font-medium'}`}>
                {activity.averageHeartRate ? `Resting: ${activity.restingHeartRate || '--'} BPM` : 'Connect wearable'}
              </div>
            </div>
          </div>

          {/* Sleep */}
          <div
            onClick={() => onNavigateToActivity('SLEEP')}
            className="bg-[#1C2230] border border-[#283144] rounded-2xl p-3.5 cursor-pointer hover:border-emerald-500/40 transition active:scale-98 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
              <Moon className="w-4 h-4 fill-purple-500/30" />
              <span>Sleep</span>
            </div>
            <div className="my-2">
              <div className="text-lg font-bold text-white">
                {activity.sleepMinutes
                  ? `${Math.floor(activity.sleepMinutes / 60)}h ${activity.sleepMinutes % 60}m`
                  : 'Data unavailable'}
              </div>
              <div className={`text-[10px] mt-0.5 ${activity.sleepMinutes ? 'text-slate-400' : 'text-amber-400 font-medium'}`}>
                {activity.sleepMinutes ? 'Optimal recovery' : 'Connect sleep tracker'}
              </div>
            </div>
          </div>

          {/* Water */}
          <div
            onClick={() => onNavigateToActivity('WATER')}
            className="bg-[#1C2230] border border-[#283144] rounded-2xl p-3.5 cursor-pointer hover:border-emerald-500/40 transition active:scale-98 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
              <Droplet className="w-4 h-4 fill-sky-500/30" />
              <span>Hydration</span>
            </div>
            <div className="my-2">
              <div className="text-lg font-bold text-white">
                {(activity.waterMilliliters / 1000).toFixed(1)} / {(activity.waterGoalMl / 1000).toFixed(1)} L
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {Math.round((activity.waterMilliliters / (activity.waterGoalMl || 1)) * 100)}% of goal
              </div>
            </div>
          </div>

          {/* Weight */}
          <div
            onClick={() => onNavigateToActivity('WEIGHT')}
            className="bg-[#1C2230] border border-[#283144] rounded-2xl p-3.5 cursor-pointer hover:border-emerald-500/40 transition active:scale-98 flex flex-col justify-between"
          >
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <span className="text-sm">⚖️</span>
              <span>Weight</span>
            </div>
            <div className="my-2">
              <div className="text-lg font-bold text-white">
                {activity.weightKg ? `${activity.weightKg} kg` : 'Log weight'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {activity.weightKg ? 'BMI monitored' : 'Tap to record'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK START */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          QUICK START WORKOUT
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { type: 'WALKING' as WorkoutType, label: 'Walking', icon: '🚶' },
            { type: 'RUNNING' as WorkoutType, label: 'Running', icon: '🏃' },
            { type: 'CYCLING' as WorkoutType, label: 'Cycling', icon: '🚴' },
            { type: 'GYM' as WorkoutType, label: 'Gym', icon: '🏋️' },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => onQuickStartWorkout(item.type)}
              className="bg-[#1C2230] border border-[#283144] rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-emerald-500/40 transition active:scale-95 group"
            >
              <span className="text-2xl group-hover:scale-110 transition">{item.icon}</span>
              <span className="text-[11px] font-medium text-slate-300">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Fitness Insight Card */}
      <div
        onClick={onNavigateToCoach}
        className="bg-gradient-to-br from-[#1C2230] to-[#141923] border border-emerald-500/30 rounded-3xl p-4.5 cursor-pointer shadow-lg hover:border-emerald-400 transition"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{topInsight.title}</span>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">AI INSIGHT</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{topInsight.content}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
        </div>
      </div>
    </div>
  );
};
