import React, { useState, useEffect } from 'react';

interface VoiceCallInterfaceProps {
  onHangup: () => void;
}

const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({ onHangup }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex-1 bg-emerald-900 flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Visualizer Animation */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-64 h-64 bg-emerald-400 rounded-full animate-ping"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl">
          <i className="fa-solid fa-microphone-lines text-2xl animate-pulse"></i>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg">AI Agent</h3>
          <p className="text-emerald-300 font-mono mt-1">{formatTime(seconds)}</p>
        </div>
      </div>

      <div className="absolute bottom-8 w-full flex justify-center">
        <button
          onClick={onHangup}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <i className="fa-solid fa-phone-slash"></i>
        </button>
      </div>
    </div>
  );
};

export default VoiceCallInterface;