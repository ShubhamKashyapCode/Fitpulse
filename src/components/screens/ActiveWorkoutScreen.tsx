import React from 'react';
import { WorkoutType, GpsStatus, GpsPoint } from '../../types/fitness';
import { MapRouteCanvas } from '../MapRouteCanvas';
import { Pause, Play, Square, Heart, Flame, Compass } from 'lucide-react';

interface ActiveWorkoutScreenProps {
  workoutType: WorkoutType;
  durationSeconds: number;
  distanceMeters: number;
  currentSpeedKmh: number;
  currentPaceSecKm: number;
  calories: number;
  heartRate?: number;
  gpsStatus: GpsStatus;
  isPaused: boolean;
  points: GpsPoint[];
  onTogglePause: () => void;
  onFinishWorkout: () => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  workoutType,
  durationSeconds,
  distanceMeters,
  currentSpeedKmh,
  currentPaceSecKm,
  calories,
  heartRate,
  gpsStatus,
  isPaused,
  points,
  onTogglePause,
  onFinishWorkout,
}) => {
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatPace = (paceSec: number) => {
    if (!paceSec || paceSec <= 0 || paceSec > 3600) return '--:--';
    const m = Math.floor(paceSec / 60);
    const s = Math.round(paceSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s} / km`;
  };

  const getGpsBadge = () => {
    switch (gpsStatus) {
      case 'READY':
        return { text: 'GPS Ready', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', dot: 'bg-emerald-400' };
      case 'SEARCHING':
        return { text: 'GPS Searching...', bg: 'bg-slate-700/50 text-slate-300 border-slate-600', dot: 'bg-amber-400 animate-ping' };
      case 'WEAK':
        return { text: 'GPS Weak', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40', dot: 'bg-amber-400' };
      case 'LOST':
        return { text: 'GPS Lost', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40', dot: 'bg-rose-400' };
    }
  };

  const badge = getGpsBadge();

  return (
    <div className="p-4 flex flex-col justify-between min-h-[750px] pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {workoutType === 'RUNNING' ? '🏃' : workoutType === 'CYCLING' ? '🚴' : '🚶'}
          </span>
          <span className="text-base font-black text-white tracking-widest uppercase">
            {workoutType}
          </span>
        </div>

        {/* GPS Badge */}
        <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span>{badge.text}</span>
        </div>
      </div>

      {/* Main Big Metrics */}
      <div className="text-center my-2 space-y-4">
        <div>
          <div className="text-5xl font-black text-white tracking-tight font-mono">
            {formatTime(durationSeconds)}
          </div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
            DURATION
          </div>
        </div>

        <div>
          <div className="text-6xl font-black text-emerald-400 tracking-tight font-mono">
            {(distanceMeters / 1000).toFixed(2)}
          </div>
          <div className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1">
            KILOMETERS
          </div>
        </div>
      </div>

      {/* Map Polyline Route View */}
      <div className="my-2">
        <MapRouteCanvas points={points} isLive={!isPaused} className="h-44" />
      </div>

      {/* Sub-Metrics 2x2 Grid */}
      <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-4 shadow-xl">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="border-r border-[#283144] pr-2">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">PACE</span>
            <p className="text-xl font-black text-white font-mono mt-0.5">{formatPace(currentPaceSecKm)}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">SPEED</span>
            <p className="text-xl font-black text-white font-mono mt-0.5">{currentSpeedKmh.toFixed(1)} km/h</p>
          </div>
        </div>

        <div className="border-t border-[#283144] my-3" />

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="border-r border-[#283144] pr-2 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
              <Heart className="w-3 h-3 text-rose-400" />
              <span>HEART RATE</span>
            </div>
            <p className="text-lg font-black text-rose-400 font-mono mt-0.5">
              {heartRate ? `${heartRate} BPM` : 'Unavailable'}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>ACTIVE KCAL</span>
            </div>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              {Math.round(calories)} kcal
            </p>
          </div>
        </div>
      </div>

      {/* Controls: Pause/Resume & Finish */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={onTogglePause}
          className={`py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
            isPaused
              ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
              : 'bg-[#1C2230] text-white border border-[#283144] hover:bg-[#283144]'
          }`}
        >
          {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={onFinishWorkout}
          className="py-4 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-rose-500/20"
        >
          <Square className="w-4 h-4 fill-white" />
          Finish
        </button>
      </div>
    </div>
  );
};
