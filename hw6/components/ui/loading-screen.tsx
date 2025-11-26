import React, { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  progress?: number; // Controlled progress (0-100)
}

export function LoadingScreen({ progress: controlledProgress }: LoadingScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If no progress provided, simulate internal progress
  const [internalProgress, setInternalProgress] = useState(0);
  
  useEffect(() => {
    if (controlledProgress !== undefined) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) return 0;
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [controlledProgress]);

  const displayProgress = controlledProgress ?? internalProgress;
  const safeProgress = mounted ? Math.max(0, Math.min(100, displayProgress)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black font-serif overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Images/loading-page-bg.jpg"
          alt="Avalon Background"
          fill
          className="object-cover object-center opacity-80"
          priority
          sizes="100vw"
          style={{ backgroundColor: '#1a1c30' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Header Section */}
      <div className="relative z-10 mt-20 w-full text-center animate-in fade-in slide-in-from-top-10 duration-700">
        <h1 
          className="text-6xl md:text-8xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-lg"
          style={{ 
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(234, 179, 8, 0.4)',
            fontFamily: '"Times New Roman", serif'
          }}
        >
          AVALON
        </h1>
        <p className="mt-4 text-yellow-100/80 text-sm md:text-base tracking-[0.4em] uppercase font-light">
          The Resistance
        </p>
      </div>

      {/* Footer Section */}
      <div className="relative z-10 w-full max-w-md px-8 mb-24 flex flex-col items-center space-y-4">
        {/* Percentage - Always show when controlled */}
        {controlledProgress !== undefined && (
          <div className="font-bold text-2xl text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider tabular-nums">
            {Math.round(safeProgress)}%
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full h-3 md:h-4 bg-gray-900/90 border border-yellow-700/60 rounded-full overflow-hidden shadow-2xl backdrop-blur-sm ring-1 ring-yellow-900/30">
          <div 
            className="h-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-200 transition-all duration-300 ease-out relative shadow-[0_0_15px_rgba(234,179,8,0.6)]"
            style={{ width: `${safeProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
