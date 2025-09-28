import React, { useState, useEffect, useCallback } from 'react';
import RhythmBar from './RhythmBar';
import type { RhythmBarData } from './RhythmBar';

interface RhythmBarManagerProps {
  isPlaying: boolean;
  bpm: number;
  onBarComplete?: (barId: string, wasHit: boolean) => void;
  onBarUpdate?: (barId: string, progress: number) => void;
  containerRef: React.MutableRefObject<any>;
}

const RhythmBarManager: React.FC<RhythmBarManagerProps> = ({
  isPlaying,
  bpm,
  onBarComplete,
  onBarUpdate,
  containerRef
}) => {
  const [bars, setBars] = useState<RhythmBarData[]>([]);
  const [beatCount, setBeatCount] = useState(0);

  // 計算節拍相關的時間
  const beatInterval = 60000 / bpm; // ms per beat
  const barMoveDuration = beatInterval * 2;

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
      startPosition: 100, // 從右側開始 (100%)
      targetPosition: 50, // 移動到中央 (50%)
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
      onBarComplete(barId, false); // 預設為未擊中，實際邏輯需要在 GameScreen 中處理
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

    const interval = setInterval(createBarPair, beatInterval / 2); // 每半拍創建一對

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, createBarPair, beatInterval]);

  // 清理所有節奏條當遊戲停止時
  useEffect(() => {
    if (!isPlaying) {
      setBars([]);
      setBeatCount(0);
    }
  }, [isPlaying]);

  // 公開方法：檢查是否有節奏條在完美區域內
  const checkPerfectHit = useCallback((): { hit: boolean; barIds: string[] } => {
    const perfectZone = 5; // 完美區域：中央 ±5%
    const hitBars: string[] = [];

    bars.forEach(bar => {
      const elapsed = Date.now() - bar.startTime;
      const progress = elapsed / bar.duration;
      const currentPosition = bar.startPosition + (bar.targetPosition - bar.startPosition) * progress;
      
      // 檢查是否在完美區域內
      if (Math.abs(currentPosition - 50) <= perfectZone) {
        hitBars.push(bar.id);
      }
    });

    return {
      hit: hitBars.length > 0,
      barIds: hitBars
    };
  }, [bars]);

  // 移除被擊中的節奏條
  const removeHitBars = useCallback((barIds: string[]) => {
    setBars(prevBars => prevBars.filter(bar => !barIds.includes(bar.id)));
  }, []);

  // 將檢查和移除方法暴露給父組件
  React.useImperativeHandle(containerRef, () => ({
    checkPerfectHit,
    removeHitBars
  }), [checkPerfectHit, removeHitBars]);

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
