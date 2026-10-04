import React, { useState } from 'react';
import { UserProfile } from '../../types/fitness';
import { Activity, ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('Athlete');
  const [age, setAge] = useState('28');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [stepGoal, setStepGoal] = useState('10000');

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        name: name.trim() || 'Athlete',
        age: parseInt(age, 10) || 28,
        heightCm: parseFloat(height) || 175,
        weightKg: parseFloat(weight) || 70,
        stepGoal: parseInt(stepGoal, 10) || 10000,
        isOnboarded: true,
      });
    }
  };

  return (
    <div className="p-6 flex flex-col justify-between min-h-[750px] pb-8">
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-emerald-400' : 'w-2 bg-[#283144]'
            }`}
          />
        ))}
      </div>

      {/* Screen 1: Meet FitPulse */}
      {step === 1 && (
        <div className="text-center space-y-4 my-auto">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-4xl mx-auto shadow-xl">
            🚶
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Meet FitPulse</h1>
          <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Your everyday health & fitness dashboard. Built with official Android APIs and privacy-first local storage.
          </p>
        </div>
      )}

      {/* Screen 2: Personal Profile */}
      {step === 2 && (
        <div className="space-y-4 my-auto">
          <div>
            <h2 className="text-2xl font-black text-white">About You</h2>
            <p className="text-xs text-slate-400 mt-0.5">Used strictly to estimate BMR and calculate BMI</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1C2230] border border-[#283144] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Age (yrs)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#283144] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-[#1C2230] border border-[#283144] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#1C2230] border border-[#283144] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Daily Target */}
      {step === 3 && (
        <div className="space-y-4 my-auto">
          <div>
            <h2 className="text-2xl font-black text-white">Daily Step Target</h2>
            <p className="text-xs text-slate-400 mt-0.5">Customize your daily movement goal</p>
          </div>

          <div className="bg-[#1C2230] border border-[#283144] rounded-3xl p-5 text-center space-y-3">
            <span className="text-4xl block">🎯</span>
            <input
              type="number"
              value={stepGoal}
              onChange={(e) => setStepGoal(e.target.value)}
              className="text-3xl font-black text-center text-emerald-400 bg-transparent border-b border-[#283144] w-48 mx-auto pb-1 focus:outline-none font-mono"
            />
            <span className="text-xs text-slate-400 block">steps per day</span>
          </div>
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            10,000 steps daily promotes cardiovascular stamina and insulin sensitivity. You can update this goal at any time in Settings.
          </p>
        </div>
      )}

      {/* Screen 4: Widget & Permissions */}
      {step === 4 && (
        <div className="text-center space-y-4 my-auto">
          <div className="w-20 h-20 rounded-3xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-4xl mx-auto shadow-xl">
            📱
          </div>
          <h2 className="text-2xl font-black text-white">Android Glance Widget</h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            FitPulse provides official Jetpack Glance widgets for your Android home screen in Small, Medium, and Large sizes.
          </p>
          <div className="p-3 bg-[#1C2230] border border-[#283144] rounded-2xl text-left flex items-start gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>Health Connect syncs aggregated steps and recovery data without draining battery.</span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3.5 border border-[#283144] hover:bg-white/5 text-slate-300 font-bold text-xs rounded-2xl transition"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-98 shadow-lg shadow-emerald-500/20"
        >
          <span>{step < 4 ? 'Continue' : 'Get Started'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
