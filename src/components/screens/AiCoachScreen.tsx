import React, { useState } from 'react';
import { DailyActivity, WorkoutSession, UserProfile, AiFitnessInsight } from '../../types/fitness';
import { answerCoachQuery } from '../../services/aiCoach';
import { Sparkles, ArrowLeft, Send, ShieldAlert } from 'lucide-react';

interface AiCoachScreenProps {
  today: DailyActivity;
  recentActivities: DailyActivity[];
  workouts: WorkoutSession[];
  profile: UserProfile;
  insights: AiFitnessInsight[];
  onBack: () => void;
}

export const AiCoachScreen: React.FC<AiCoachScreenProps> = ({
  today,
  recentActivities,
  workouts,
  profile,
  insights,
  onBack,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'coach'; text: string }>>([
    {
      sender: 'coach',
      text: `Hello ${profile.name}! I am your FitPulse AI Coach. I analyze your real sensor telemetry from device hardware and Health Connect to provide grounded athletic and habit insights. How can I assist your training today?`,
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userQuery = inputText.trim();
    setInputText('');

    const newMsgs = [...messages, { sender: 'user' as const, text: userQuery }];
    setMessages(newMsgs);

    setTimeout(() => {
      const response = answerCoachQuery(userQuery, today, recentActivities, workouts, profile);
      setMessages((prev) => [...prev, { sender: 'coach', text: response }]);
    }, 400);
  };

  return (
    <div className="p-4 flex flex-col justify-between h-[750px] pb-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#1C2230] border border-[#283144] flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">AI Fitness Coach</h1>
              <p className="text-[10px] text-slate-400">Strictly grounded in your recorded metrics</p>
            </div>
          </div>
        </div>

        {/* Medical Advisory Box */}
        <div className="p-2.5 bg-[#141923] border border-amber-500/30 rounded-2xl flex items-start gap-2 text-[11px] text-slate-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            Medical Disclaimer: FitPulse AI insights are for lifestyle reference only and do not constitute clinical diagnosis, medical evaluation, or treatment.
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 my-3 pr-1 scrollbar-thin">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-400 text-slate-950 font-medium rounded-tr-xs'
                  : 'bg-[#1C2230] text-slate-200 border border-[#283144] rounded-tl-xs shadow-md'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Quick Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {['Step progress?', 'Hydration status?', 'Recent workouts?'].map((q) => (
          <button
            key={q}
            onClick={() => {
              setInputText(q);
            }}
            className="px-2.5 py-1 bg-[#141923] hover:bg-[#1C2230] border border-[#283144] rounded-full text-[11px] text-slate-300 whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your steps, workouts, recovery..."
          className="flex-1 bg-[#1C2230] border border-[#283144] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-sans"
        />
        <button
          onClick={handleSend}
          className="w-11 h-11 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-2xl flex items-center justify-center shrink-0 transition active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Send className="w-4 h-4 fill-slate-950" />
        </button>
      </div>
    </div>
  );
};
