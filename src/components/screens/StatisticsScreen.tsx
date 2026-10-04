import React, { useState } from 'react';
import { DailyActivity, HealthScore, Achievement } from '../../types/fitness';
import { Trophy, Award, Lock, Sparkles, TrendingUp } from 'lucide-react';

interface StatisticsScreenProps {
  activities: Record<string, DailyActivity>;
  healthScore: HealthScore;
  achievements: Achievement[];
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  activities,
  healthScore,
  achievements,
}) => {
  const [timeframe, setTimeframe] = useState<'DAY' | 'WEEK' | 'MONTH' | 'YEAR'>('WEEK');

  const activityList = Object.values(activities);
  const totalSteps = activityList.reduce((acc, a) => acc + a.steps, 0);
  const avgSteps = activityList.length > 0 ? Math.round(totalSteps / activityList.length) : 0;
  const maxSteps = activityList.reduce((acc, a) => Math.max(acc, a.steps), 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Analytics & Progress</h1>
        <p className="text-xs text-slate-400">Longitudinal health trends & wellness index</p>
      </div>

      {/* Timeframe Switcher */}
      <div className="flex bg-[#141923] p-1 rounded-2xl border border-[#283144] gap-1">
        {(['DAY', 'WEEK', 'MONTH', 'YEAR'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              timeframe === tf
                ? 'bg-[#1C2230] text-emerald-400 border border-[#283144] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* FitPulse Wellness Score Card */}
      <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              FITPULSE WELLNESS SCORE
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-white font-mono">{healthScore.score}</span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Circular Gauge */}
          <div className="w-16 h-16 rounded-full bg-[#141923] border-4 border-emerald-400 flex items-center justify-center font-bold text-white text-lg">
            {healthScore.score}
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#283144] text-[11px]">
          <div>
            <span className="text-slate-400">Activity</span>
            <div className="font-bold text-white mt-0.5">{healthScore.activityScore} / 30</div>
          </div>
          <div>
            <span className="text-slate-400">Hydration</span>
            <div className="font-bold text-white mt-0.5">{healthScore.hydrationScore} / 20</div>
          </div>
          <div>
            <span className="text-slate-400">Sleep</span>
            <div className="font-bold text-white mt-0.5">{healthScore.sleepScore} / 25</div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 italic pt-1 leading-normal">
          {healthScore.disclaimer}
        </p>
      </div>

      {/* Performance Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1C2230] border border-[#283144] rounded-2xl p-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">DAILY AVERAGE</span>
          <div className="text-xl font-black text-white font-mono mt-1">{avgSteps.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">steps per day</span>
        </div>
        <div className="bg-[#1C2230] border border-[#283144] rounded-2xl p-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HIGHEST DAY</span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">{maxSteps.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">recorded steps</span>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>ACHIEVEMENTS & BADGES</span>
          <span>{achievements.filter((a) => a.isUnlocked).length} / {achievements.length}</span>
        </div>

        <div className="space-y-2">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                ach.isUnlocked
                  ? 'bg-[#1C2230] border-emerald-500/30'
                  : 'bg-[#141923] border-[#283144] opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    ach.isUnlocked ? 'bg-emerald-500/15' : 'bg-[#1C2230]'
                  }`}
                >
                  {ach.isUnlocked ? ach.icon : <Lock className="w-4 h-4 text-slate-500" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{ach.title}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{ach.description}</div>
                </div>
              </div>

              <div>
                {ach.isUnlocked ? (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">
                    {Math.round(ach.progress * 100)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
