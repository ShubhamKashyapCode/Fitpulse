import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorkoutSession } from '../../types/fitness';
import { MapRouteCanvas } from '../MapRouteCanvas';
import { CheckCircle2, ChevronLeft } from 'lucide-react';

interface WorkoutSummaryScreenProps {
  workout: WorkoutSession;
  onDone: () => void;
}

export const WorkoutSummaryScreen: React.FC<WorkoutSummaryScreenProps> = ({ workout, onDone }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00E676', '#00B0FF', '#FFB300'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatPace = (paceSec: number) => {
    if (!paceSec || paceSec <= 0) return '--:--';
    const m = Math.floor(paceSec / 60);
    const s = Math.round(paceSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s} / km`;
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header Banner */}
      <div className="text-center pt-2 space-y-1">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
        <h1 className="text-2xl font-black text-white tracking-tight">WORKOUT COMPLETE 🎉</h1>
        <p className="text-xs text-slate-400 capitalize">{workout.type.toLowerCase()} Session Saved</p>
      </div>

      {/* Hero Metric Card */}
      <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl text-center space-y-4">
        <div>
          <div className="text-5xl font-black text-emerald-400 font-mono">
            {(workout.distanceMeters / 1000).toFixed(2)}
          </div>
          <div className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-0.5">
            KILOMETERS
          </div>
        </div>

        <div className="border-t border-[#283144] pt-3 grid grid-cols-3 divide-x divide-[#283144] text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">DURATION</span>
            <p className="text-sm font-bold text-white mt-0.5 font-mono">{formatDuration(workout.durationSeconds)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">AVG PACE</span>
            <p className="text-sm font-bold text-white mt-0.5 font-mono">{formatPace(workout.averagePaceSecPerKm)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">CALORIES</span>
            <p className="text-sm font-bold text-white mt-0.5 font-mono">{Math.round(workout.activeCalories)} kcal</p>
          </div>
        </div>
      </div>

      {/* Route Map Preview */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">RECORDED GPS ROUTE</div>
        <MapRouteCanvas points={workout.points} className="h-48" />
      </div>

      {/* Performance Details Card */}
      <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-4 shadow-xl space-y-2 text-xs">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider pb-1 border-b border-[#283144]">
          PERFORMANCE BREAKDOWN
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#283144]/50">
          <span className="text-slate-400">Average Speed</span>
          <span className="text-white font-mono font-semibold">{workout.averageSpeedKmh.toFixed(1)} km/h</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#283144]/50">
          <span className="text-slate-400">Max Speed</span>
          <span className="text-white font-mono font-semibold">{workout.maxSpeedKmh.toFixed(1)} km/h</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#283144]/50">
          <span className="text-slate-400">Elevation Gain</span>
          <span className="text-white font-mono font-semibold">{Math.round(workout.elevationGainMeters)} m</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#283144]/50">
          <span className="text-slate-400">GPS Coordinates</span>
          <span className="text-white font-mono font-semibold">{workout.points.length} points</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-slate-400">Heart Rate</span>
          <span className="text-white font-mono font-semibold">
            {workout.averageHeartRate ? `${workout.averageHeartRate} BPM avg` : 'No wearable connected'}
          </span>
        </div>
      </div>

      {/* Finish & Save Button */}
      <button
        onClick={onDone}
        className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm rounded-2xl transition active:scale-98 shadow-lg shadow-emerald-500/20"
      >
        SAVE & CLOSE
      </button>
    </div>
  );
};
