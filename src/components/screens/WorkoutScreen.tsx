import React, { useState } from 'react';
import { WorkoutSession, WorkoutType } from '../../types/fitness';
import { Play, ChevronRight, Activity } from 'lucide-react';

interface WorkoutScreenProps {
  workouts: WorkoutSession[];
  onStartWorkout: (type: WorkoutType) => void;
  onSelectWorkout: (workout: WorkoutSession) => void;
}

const WORKOUT_TYPES: { type: WorkoutType; label: string; icon: string }[] = [
  { type: 'RUNNING', label: 'Running', icon: '🏃' },
  { type: 'WALKING', label: 'Walking', icon: '🚶' },
  { type: 'CYCLING', label: 'Cycling', icon: '🚴' },
  { type: 'HIKING', label: 'Hiking', icon: '⛰️' },
  { type: 'GYM', label: 'Gym', icon: '🏋️' },
  { type: 'TREADMILL', label: 'Treadmill', icon: '👟' },
  { type: 'OTHER', label: 'Other', icon: '⏱️' },
];

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({
  workouts,
  onStartWorkout,
  onSelectWorkout,
}) => {
  const [selectedType, setSelectedType] = useState<WorkoutType>('RUNNING');

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatPace = (paceSec: number) => {
    if (!paceSec || paceSec <= 0) return '--:--';
    const m = Math.floor(paceSec / 60);
    const s = Math.round(paceSec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s} / km`;
  };

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Record Workout</h1>
        <p className="text-xs text-slate-400">High-accuracy GPS routes & real-time pace metrics</p>
      </div>

      {/* Start Workout Card */}
      <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
          CHOOSE SPORT
        </div>

        {/* Workout Type Selector */}
        <div className="grid grid-cols-4 gap-2">
          {WORKOUT_TYPES.slice(0, 4).map((item) => {
            const isSelected = selectedType === item.type;
            return (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-400'
                    : 'bg-[#141923] border-[#283144] text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Start Button */}
        <button
          onClick={() => onStartWorkout(selectedType)}
          className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 active:scale-98 transition text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          START {selectedType}
        </button>
      </div>

      {/* Workout History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>WORKOUT HISTORY</span>
          <span>{workouts.length} Sessions</span>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-8 text-center space-y-2">
            <span className="text-4xl block">🏃</span>
            <div className="text-base font-bold text-white">No workouts recorded yet</div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start a walk, run, or cycle to record your route on the map, measure distance, pace, and calories burned.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => onSelectWorkout(workout)}
                className="bg-[#1C2230] border border-[#283144] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#141923] border border-[#283144] flex items-center justify-center text-xl shrink-0">
                    {workout.type === 'RUNNING' ? '🏃' : workout.type === 'CYCLING' ? '🚴' : '🚶'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white capitalize">{workout.type.toLowerCase()} Session</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatDuration(workout.durationSeconds)} • {Math.round(workout.activeCalories)} kcal
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">
                      {(workout.distanceMeters / 1000).toFixed(2)} km
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {formatPace(workout.averagePaceSecPerKm)}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
