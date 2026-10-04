import React from 'react';

interface AndroidPhoneFrameProps {
  children: React.ReactNode;
  activeScreenTitle?: string;
  isFrameMode: boolean;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({ children, isFrameMode }) => {
  const [time, setTime] = React.useState('9:41');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isFrameMode) {
    return (
      <div className="w-full min-h-screen bg-[#0B0E14] text-[#F1F5F9] flex flex-col items-center">
        <div className="w-full max-w-md min-h-screen bg-[#0B0E14] relative shadow-2xl flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-[#0B0E14] to-slate-900 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      {/* Outer Phone Shell */}
      <div className="relative w-full max-w-[410px] h-[860px] bg-[#121417] rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[6px] border-[#222733] ring-1 ring-white/10 flex flex-col">
        {/* Device Earpiece Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#283144] rounded-full z-30" />

        {/* Inner Screen Bezel */}
        <div className="w-full h-full bg-[#0B0E14] rounded-[42px] overflow-hidden flex flex-col relative border border-white/5">
          {/* Android Status Bar */}
          <div className="w-full h-10 px-6 flex items-center justify-between text-xs text-slate-300 font-medium z-30 select-none bg-[#0B0E14]/80 backdrop-blur-sm">
            <span className="font-semibold text-[13px]">{time}</span>

            {/* Front Camera Notch */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" />
              </svg>
              <span>5G</span>
              <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-xs" />
              </div>
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none flex flex-col">
            {children}
          </div>

          {/* Android Gesture Pill Navigation Bar */}
          <div className="w-full h-5 bg-[#0B0E14] flex items-center justify-center shrink-0 z-30">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
