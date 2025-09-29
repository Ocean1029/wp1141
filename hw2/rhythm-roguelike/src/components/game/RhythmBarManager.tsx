import React, { useState, useEffect, useCallback } from 'react';
import RhythmBar from './RhythmBar';
import type { RhythmBarData } from './RhythmBar';

interface RhythmBarManagerProps {
  isPlaying: boolean;
  bpm: number;
  onBarComplete?: (barId: string) => void;
  onBarUpdate?: (barId: string, progress: number) => void;
}

const RhythmBarManager: React.FC<RhythmBarManagerProps> = ({
  isPlaying,
  bpm,
  onBarComplete,
  onBarUpdate
}) => {
  const [bars, setBars] = useState<RhythmBarData[]>([]);
  const [beatCount, setBeatCount] = useState(0);

  // 計算節拍相關的時間
  const beatInterval = 60000 / bpm; // ms per beat
  const barMoveDuration = beatInterval * 2;
  const barCreateDuration = beatInterval / 2; // for every 1/2 beat

  // 創建新的節奏條對
  const createBarPair = useCallback(() => {
    const timestamp = Date.now();
    const isBlue = beatCount % 2 === 1;
    const barType = isBlue ? 'blue' : 'white';
    
    const leftBar: RhythmBarData = {
      id: `left-${timestamp}-${beatCount}`,
      type: barType,
      side: 'left',
      startTime: timestamp,
      duration: barMoveDuration,
      startPosition: 0, 
      targetPosition: 50, 
      isActive: true
    };

    const rightBar: RhythmBarData = {
      id: `right-${timestamp}-${beatCount}`,
      type: barType,
      side: 'right',
      startTime: timestamp,
      duration: barMoveDuration,
      startPosition: 100, 
      targetPosition: 50, 
      isActive: true
    };

    setBars(prevBars => [...prevBars, leftBar, rightBar]);
    setBeatCount(prev => prev + 1);
  }, [beatCount, barMoveDuration]);

  // 移除完成的節奏條
  const handleBarComplete = useCallback((barId: string) => {
    setBars(prevBars => prevBars.filter(bar => bar.id !== barId));
    
    // 通知父組件
    if (onBarComplete) {
      onBarComplete(barId);
    }
  }, [onBarComplete]);

  // 處理節奏條更新
  const handleBarUpdate = useCallback((barId: string, progress: number) => {
    if (onBarUpdate) {
      onBarUpdate(barId, progress);
    }
  }, [onBarUpdate]);

  // 開始節拍系統
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(createBarPair, barCreateDuration); 

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, createBarPair, barCreateDuration]);

  useEffect(() => {
    if (!isPlaying) {
      setBars([]);
      setBeatCount(0);
    }
  }, [isPlaying]);

  return (
    <>
      {bars.map(bar => (
        <RhythmBar
          key={bar.id}
          bar={bar}
          onComplete={handleBarComplete}
          onUpdate={handleBarUpdate}
        />
      ))}
    </>
  );
};

export default RhythmBarManager;
