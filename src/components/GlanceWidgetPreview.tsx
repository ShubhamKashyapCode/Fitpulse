import React, { useState } from 'react';
import { DailyActivity } from '../types/fitness';

interface GlanceWidgetPreviewProps {
  activity: DailyActivity;
  onOpenApp: () => void;
}

export const GlanceWidgetPreview: React.FC<GlanceWidgetPreviewProps> = ({ activity, onOpenApp }) => {
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const stepRatio = Math.min(1, activity.steps / (activity.stepGoal || 10000));
  const percent = Math.round(stepRatio * 100);

  return (
    <div className="bg-[#141923] border border-[#283144] rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
            Jetpack Glance Widget (Android 14+)
          </h3>
        </div>
        <div className="flex bg-[#1C2230] p-1 rounded-xl gap-1 border border-[#283144]">
          <button
            onClick={() => setSize('small')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              size === 'small' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Small (2x2)
          </button>
          <button
            onClick={() => setSize('medium')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              size === 'medium' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Medium (4x2)
          </button>
          <button
            onClick={() => setSize('large')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              size === 'large' ? 'bg-emerald-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Large (4x4)
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Simulates the official Android <code className="text-emerald-400">FitPulseGlanceWidget</code> pinned to the Android launcher. Tap widget to launch app.
      </p>

      {/* Widget Container */}
      <div className="bg-[#0B0E14] p-6 rounded-2xl border border-dashed border-[#283144] flex items-center justify-center min-h-[180px]">
        {size === 'small' && (
          <div
            onClick={onOpenApp}
            className="w-36 h-36 bg-[#1C2230] rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg border border-white/5 cursor-pointer hover:border-emerald-500/50 transition active:scale-95"
          >
            <span className="text-3xl">🚶</span>
            <span className="text-2xl font-black text-white mt-1">{activity.steps.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-400">Steps</span>
          </div>
        )}

        {size === 'medium' && (
          <div
            onClick={onOpenApp}
            className="w-full max-w-sm bg-[#1C2230] rounded-3xl p-5 shadow-lg border border-white/5 cursor-pointer hover:border-emerald-500/50 transition active:scale-98 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚶</span>
                <span className="text-base font-bold text-white">{activity.steps.toLocaleString()} steps</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">{percent}%</span>
            </div>

            <div className="w-full bg-[#283144] h-2.5 rounded-full overflow-hidden my-3">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{(activity.distanceMeters / 1000).toFixed(1)} km</span>
              <span>{Math.round(activity.activeCalories)} kcal</span>
            </div>
          </div>
        )}

        {size === 'large' && (
          <div
            onClick={onOpenApp}
            className="w-full max-w-sm bg-[#1C2230] rounded-3xl p-6 shadow-xl border border-white/5 cursor-pointer hover:border-emerald-500/50 transition active:scale-98 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 tracking-wider">TODAY'S ACTIVITY</span>
              <span className="text-xs text-slate-400">Goal {activity.stepGoal.toLocaleString()}</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚶</span>
                <span className="text-3xl font-black text-white">{activity.steps.toLocaleString()}</span>
                <span className="text-sm font-semibold text-slate-400">STEPS</span>
              </div>
            </div>

            <div className="w-full bg-[#283144] h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#283144]">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">DISTANCE</span>
                <p className="text-base font-bold text-white">{(activity.distanceMeters / 1000).toFixed(2)} KM</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ACTIVE KCAL</span>
                <p className="text-base font-bold text-white">{Math.round(activity.activeCalories)} KCAL</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
