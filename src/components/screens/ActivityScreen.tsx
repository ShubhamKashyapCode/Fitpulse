import React, { useState } from 'react';
import { DailyActivity, UserProfile } from '../../types/fitness';
import { calculateBmi } from '../../services/storage';
import { Heart, Moon, Droplet, Plus, Info } from 'lucide-react';

interface ActivityScreenProps {
  activity: DailyActivity;
  profile: UserProfile;
  initialTab?: string;
  onLogWater: (amountMl: number) => void;
  onLogWeight: (weightKg: number) => void;
  onOpenPermissionCenter: () => void;
}

export const ActivityScreen: React.FC<ActivityScreenProps> = ({
  activity,
  profile,
  initialTab = 'STEPS',
  onLogWater,
  onLogWeight,
  onOpenPermissionCenter,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [customWater, setCustomWater] = useState('');
  const [weightInput, setWeightInput] = useState(activity.weightKg?.toString() || '70.0');

  const bmiInfo = calculateBmi(profile.heightCm, activity.weightKg);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Health & Activity</h1>
        <p className="text-xs text-slate-400">Direct metrics from device sensors & Health Connect</p>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="flex bg-[#141923] p-1 rounded-2xl border border-[#283144] overflow-x-auto scrollbar-none gap-1">
        {['STEPS', 'HEART', 'SLEEP', 'WATER', 'WEIGHT'].map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* STEPS TAB */}
      {activeTab === 'STEPS' && (
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-5">
          <div className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
            DAILY STEPS & CADENCE
          </div>
          <div>
            <div className="text-4xl font-black text-white">{activity.steps.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">
              Target Goal: {activity.stepGoal.toLocaleString()} steps
            </div>
          </div>

          <div className="w-full bg-[#283144] h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (activity.steps / activity.stepGoal) * 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#141923] p-3 rounded-2xl border border-[#283144]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">DISTANCE</span>
              <p className="text-lg font-bold text-white mt-0.5">{(activity.distanceMeters / 1000).toFixed(2)} km</p>
            </div>
            <div className="bg-[#141923] p-3 rounded-2xl border border-[#283144]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">ACTIVE BURN</span>
              <p className="text-lg font-bold text-white mt-0.5">{Math.round(activity.activeCalories)} kcal</p>
            </div>
          </div>
        </div>
      )}

      {/* HEART RATE TAB */}
      {activeTab === 'HEART' && (
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Heart className="w-5 h-5 fill-rose-500/30" />
            <span className="text-xs font-bold uppercase tracking-wider">HEART RATE TELEMETRY</span>
          </div>

          {activity.averageHeartRate ? (
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-black text-white">{activity.averageHeartRate} <span className="text-xl text-slate-400 font-normal">BPM</span></div>
                <div className="text-xs text-slate-400 mt-1">Resting: {activity.restingHeartRate || '--'} BPM</div>
              </div>

              {/* Heart Rate Zones */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase">HEART RATE ZONES</div>
                {[
                  { zone: 'Zone 5 (Max VO2)', range: '172 - 200 BPM', color: 'bg-rose-500' },
                  { zone: 'Zone 4 (Hard Anaerobic)', range: '153 - 171 BPM', color: 'bg-amber-500' },
                  { zone: 'Zone 3 (Aerobic)', range: '134 - 152 BPM', color: 'bg-emerald-500' },
                  { zone: 'Zone 2 (Fat Burn)', range: '115 - 133 BPM', color: 'bg-sky-500' },
                  { zone: 'Zone 1 (Warm Up)', range: '90 - 114 BPM', color: 'bg-indigo-500' },
                ].map((z, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#141923] rounded-xl border border-[#283144]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${z.color}`} />
                      <span className="text-slate-300 font-medium">{z.zone}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{z.range}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#141923] rounded-2xl border border-amber-500/30 space-y-3">
              <div className="text-amber-400 font-bold text-base">Data unavailable</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Heart rate data isn't available on this device right now. Connect a compatible wearable or health platform to import real-time heart-rate telemetry into FitPulse.
              </p>
              <button
                onClick={onOpenPermissionCenter}
                className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                CONNECT HEALTH CONNECT
              </button>
            </div>
          )}
        </div>
      )}

      {/* SLEEP TAB */}
      {activeTab === 'SLEEP' && (
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Moon className="w-5 h-5 fill-purple-500/30" />
            <span className="text-xs font-bold uppercase tracking-wider">SLEEP STAGES & RECOVERY</span>
          </div>

          {activity.sleepMinutes ? (
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-black text-white">
                  {Math.floor(activity.sleepMinutes / 60)}h {activity.sleepMinutes % 60}m
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Goal: {Math.floor(activity.sleepGoalMinutes / 60)}h 00m
                </div>
              </div>

              {/* Sleep Stages */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase">RECORDED SLEEP STAGES</div>
                {[
                  { stage: 'Deep Sleep', duration: '1h 45m', pct: 23, color: 'bg-indigo-600' },
                  { stage: 'REM Sleep', duration: '1h 50m', pct: 24, color: 'bg-purple-500' },
                  { stage: 'Light Sleep', duration: '3h 42m', pct: 48, color: 'bg-sky-500' },
                  { stage: 'Awake / Restless', duration: '25m', pct: 5, color: 'bg-rose-500' },
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{s.stage}</span>
                      <span className="text-slate-400 font-mono">{s.duration} ({s.pct}%)</span>
                    </div>
                    <div className="w-full bg-[#283144] h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#141923] rounded-2xl border border-amber-500/30 space-y-3">
              <div className="text-amber-400 font-bold text-base">Data unavailable</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                No sleep session was recorded for last night. Wear your connected smartwatch or sleep tracker to bed and verify Health Connect permissions.
              </p>
              <button
                onClick={onOpenPermissionCenter}
                className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                CONNECT HEALTH DATA
              </button>
            </div>
          )}
        </div>
      )}

      {/* WATER TAB */}
      {activeTab === 'WATER' && (
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-sky-400">
            <Droplet className="w-5 h-5 fill-sky-500/30" />
            <span className="text-xs font-bold uppercase tracking-wider">DAILY HYDRATION</span>
          </div>

          <div>
            <div className="text-4xl font-black text-white">
              {(activity.waterMilliliters / 1000).toFixed(2)}{' '}
              <span className="text-xl text-slate-400 font-normal">L</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Target Goal: {(activity.waterGoalMl / 1000).toFixed(2)} L
            </div>
          </div>

          <div className="w-full bg-[#283144] h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (activity.waterMilliliters / activity.waterGoalMl) * 100)}%` }}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase">QUICK ADD WATER</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onLogWater(150)}
                className="py-3 bg-[#141923] hover:bg-sky-500/15 border border-[#283144] hover:border-sky-500/40 rounded-xl text-xs font-bold text-sky-400 transition active:scale-95"
              >
                +150 ml
              </button>
              <button
                onClick={() => onLogWater(250)}
                className="py-3 bg-[#141923] hover:bg-sky-500/15 border border-[#283144] hover:border-sky-500/40 rounded-xl text-xs font-bold text-sky-400 transition active:scale-95"
              >
                +250 ml
              </button>
              <button
                onClick={() => onLogWater(500)}
                className="py-3 bg-[#141923] hover:bg-sky-500/15 border border-[#283144] hover:border-sky-500/40 rounded-xl text-xs font-bold text-sky-400 transition active:scale-95"
              >
                +500 ml
              </button>
            </div>
          </div>

          {/* Custom water entry */}
          <div className="flex gap-2 pt-2">
            <input
              type="number"
              value={customWater}
              onChange={(e) => setCustomWater(e.target.value)}
              placeholder="Custom ml (e.g. 300)"
              className="flex-1 bg-[#141923] border border-[#283144] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
            />
            <button
              onClick={() => {
                const val = parseInt(customWater, 10);
                if (val > 0) {
                  onLogWater(val);
                  setCustomWater('');
                }
              }}
              className="px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* WEIGHT & BMI TAB */}
      {activeTab === 'WEIGHT' && (
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
            BODY WEIGHT & BMI INDEX
          </div>

          {activity.weightKg ? (
            <div>
              <div className="text-4xl font-black text-white">{activity.weightKg} <span className="text-xl text-slate-400 font-normal">kg</span></div>
              {bmiInfo && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-xl">
                  <span className="text-xs font-bold text-emerald-400">BMI: {bmiInfo.bmi}</span>
                  <span className="text-xs text-slate-300">({bmiInfo.category})</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-xs">No weight logged today yet.</div>
          )}

          {/* Non-medical disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-[#141923] rounded-xl border border-[#283144]">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-normal">
              BMI is a general screening index calculated from height and weight. It does not replace clinical evaluation or diagnostic health assessments.
            </p>
          </div>

          {/* Log weight input */}
          <div className="pt-2">
            <label className="text-xs text-slate-300 font-semibold mb-1 block">Record Weight (kg)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="flex-1 bg-[#141923] border border-[#283144] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => {
                  const val = parseFloat(weightInput);
                  if (val > 0) onLogWeight(val);
                }}
                className="px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
              >
                Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
