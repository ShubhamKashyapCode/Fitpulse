import React, { useState } from 'react';
import { UserProfile } from '../../types/fitness';
import { exportDataAsJson, exportDataAsCsv } from '../../services/storage';
import { ShieldCheck, Download, Trash2, Key, ChevronRight, Sliders, Info } from 'lucide-react';

interface SettingsScreenProps {
  profile: UserProfile;
  onOpenPermissionCenter: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onClearAllData: () => void;
  onToggleDeveloperMode: (enabled: boolean) => void;
  exportContextData: {
    activities: any;
    workouts: any;
  };
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onOpenPermissionCenter,
  onUpdateProfile,
  onClearAllData,
  onToggleDeveloperMode,
  exportContextData,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stepGoalInput, setStepGoalInput] = useState(profile.stepGoal.toString());

  const handleSaveStepGoal = () => {
    const val = parseInt(stepGoalInput, 10);
    if (val > 0) {
      onUpdateProfile({ ...profile, stepGoal: val });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Settings & Privacy</h1>
        <p className="text-xs text-slate-400">Permissions, data ownership & device preferences</p>
      </div>

      {/* Permissions Group */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          HARDWARE & SENSORS
        </div>
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl overflow-hidden divide-y divide-[#283144]">
          <button
            onClick={onOpenPermissionCenter}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Permission Center</div>
                <div className="text-xs text-slate-400">Steps, Heart Rate, Sleep, GPS & Notifications</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Daily Target Setting */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          FITNESS GOALS
        </div>
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-4 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">Daily Step Goal</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={stepGoalInput}
              onChange={(e) => setStepGoalInput(e.target.value)}
              className="flex-1 bg-[#141923] border border-[#283144] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleSaveStepGoal}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Data Export & Privacy Group */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          PRIVACY & LOCAL EXPORT
        </div>
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl overflow-hidden divide-y divide-[#283144]">
          <button
            onClick={() => exportDataAsJson(profile, exportContextData.activities, exportContextData.workouts)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm font-semibold text-white">Export Health Data (JSON)</div>
                <div className="text-xs text-slate-400">Complete raw export of all sessions</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => exportDataAsCsv(exportContextData.activities, exportContextData.workouts)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-sm font-semibold text-white">Export Spreadsheet (CSV)</div>
                <div className="text-xs text-slate-400">Step counts and workout logs</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition text-rose-400"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-sm font-semibold text-rose-400">Delete Local Data</div>
                <div className="text-xs text-slate-400">Erase all workouts and activity logs</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Developer Mode Toggle (Section 39) */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
          DEVELOPMENT ONLY MODE
        </div>
        <div className="bg-[#1C2230] border border-amber-500/30 rounded-3xl p-4 flex items-center justify-between">
          <div className="pr-4">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Developer Mode</span>
              {profile.developerModeEnabled && (
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Populates realistic sample UI telemetry for UI verification. Turn off to return to strict production mode where only real device sensors and inputs are rendered.
            </p>
          </div>
          <button
            onClick={() => onToggleDeveloperMode(!profile.developerModeEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
              profile.developerModeEnabled ? 'bg-amber-400' : 'bg-[#283144]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform absolute top-0.5 ${
                profile.developerModeEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About Box */}
      <div className="bg-[#141923] border border-[#283144] rounded-2xl p-4 text-xs text-slate-400 space-y-1">
        <div className="font-bold text-slate-300">FitPulse Android v1.0.0 (Build 35)</div>
        <p className="leading-relaxed">
          Engineered using official Android Health Connect SDK, Room Database, Jetpack Compose, and Foreground Location Services. No health information ever leaves your device.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Erase Local Data?</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                This will delete all locally recorded workouts, daily steps, and water logs from your device storage.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 rounded-xl border border-[#283144] text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowDeleteModal(false);
                }}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-xs font-bold text-white shadow-md shadow-rose-500/20"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
