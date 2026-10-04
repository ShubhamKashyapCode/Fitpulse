import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface PermissionCenterScreenProps {
  hasHealthConnect: boolean;
  hasLocation: boolean;
  hasNotifications: boolean;
  onRequestHealthConnect: () => void;
  onRequestLocation: () => void;
  onRequestNotifications: () => void;
  onBack: () => void;
}

export const PermissionCenterScreen: React.FC<PermissionCenterScreenProps> = ({
  hasHealthConnect,
  hasLocation,
  hasNotifications,
  onRequestHealthConnect,
  onRequestLocation,
  onRequestNotifications,
  onBack,
}) => {
  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#1C2230] border border-[#283144] flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Permission Center</h1>
          <p className="text-xs text-slate-400">Android System & Health Connect Permissions</p>
        </div>
      </div>

      <div className="bg-[#141923] border border-[#283144] rounded-2xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          FitPulse adheres strictly to Android privacy standards: permissions are requested only when required for sensor access and all metrics remain on this device.
        </p>
      </div>

      {/* Health Connect Group */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          HEALTH CONNECT SYNC
        </div>
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-4 space-y-3">
          {[
            { label: 'Daily Steps Aggregation', granted: hasHealthConnect },
            { label: 'Heart Rate & Recovery Telemetry', granted: hasHealthConnect },
            { label: 'Sleep Stages & Consistency', granted: hasHealthConnect },
            { label: 'Body Weight & Smart Scale Sync', granted: hasHealthConnect },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1">
              <span className="text-white font-medium">{item.label}</span>
              <div className="flex items-center gap-1.5">
                {item.granted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold text-[11px]">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-500 font-medium text-[11px]">Not Connected</span>
                  </>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={onRequestHealthConnect}
            className={`w-full py-3 rounded-2xl font-bold text-xs uppercase transition shadow-md ${
              hasHealthConnect
                ? 'bg-[#141923] border border-emerald-500/40 text-emerald-400'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            {hasHealthConnect ? 'HEALTH CONNECT ACTIVE ✓' : 'CONNECT HEALTH CONNECT'}
          </button>
        </div>
      </div>

      {/* Hardware & Location Group */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
          HARDWARE & SYSTEM SENSORS
        </div>
        <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs py-1">
            <div>
              <div className="text-white font-medium">Fine GPS Location</div>
              <div className="text-[10px] text-slate-400">Used during active outdoor workouts</div>
            </div>
            <button
              onClick={onRequestLocation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                hasLocation
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
              }`}
            >
              {hasLocation ? 'Allowed ✓' : 'Grant'}
            </button>
          </div>

          <div className="border-t border-[#283144] pt-2 flex items-center justify-between text-xs py-1">
            <div>
              <div className="text-white font-medium">Notifications & Reminders</div>
              <div className="text-[10px] text-slate-400">Hydration alerts & streak milestones</div>
            </div>
            <button
              onClick={onRequestNotifications}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                hasNotifications
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
              }`}
            >
              {hasNotifications ? 'Allowed ✓' : 'Grant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
