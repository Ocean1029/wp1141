import React, { useEffect, useState } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  progress?: number; // Optional controlled progress (0-100)
}

export function LoadingScreen({ progress: controlledProgress }: LoadingScreenProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If no progress is provided, simulate a loading sequence
  useEffect(() => {
    if (controlledProgress !== undefined) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increment between 1 and 5
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [controlledProgress]);

  // IMPORTANT: To prevent hydration mismatch, the initial render on client (before mount)
  // must match the server render. So we use 0% as the initial state for both.
  const currentProgress = mounted ? (controlledProgress ?? internalProgress) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black font-serif">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Images/loading-page-bg.jpg"
          alt="Avalon Background"
          fill
          className="object-cover object-center opacity-80"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Header Section - AVALON Title */}
      <div className="relative z-10 mt-12 w-full text-center animate-fade-in-down">
        <h1 
          className="text-6xl md:text-8xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-lg"
          style={{ 
            textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(234, 179, 8, 0.4)',
            fontFamily: '"Cinzel", "Times New Roman", serif' 
          }}
        >
          AVALON
        </h1>
        <p className="mt-4 text-yellow-100/80 text-sm md:text-base tracking-[0.2em] uppercase">
          The Resistance
        </p>
      </div>

      {/* Footer Section - Progress Bar */}
      <div className="relative z-10 w-full max-w-md px-8 mb-20 flex flex-col items-center">
        
        {/* Percentage Text - Placed above the bar */}
        <div className="mb-2 font-bold text-xl md:text-2xl text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tabular-nums tracking-wider">
          {Math.round(currentProgress)}%
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-4 md:h-6 bg-gray-900/90 border border-yellow-700/60 rounded-full overflow-hidden shadow-2xl backdrop-blur-sm ring-1 ring-yellow-900/30">
          {/* Animated Progress Fill - Gold Gradient */}
          <div 
            className="h-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-200 transition-all duration-300 ease-out relative shadow-[0_0_15px_rgba(234,179,8,0.6)]"
            style={{ width: `${currentProgress}%` }}
          >
            {/* Shine effect on bar */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
