import React, { useEffect, useRef } from 'react';
import './CenterCircle.css';

interface CenterCircleProps {
  isPlaying: boolean;
  bpm: number;
}

const CenterCircle: React.FC<CenterCircleProps> = ({ isPlaying, bpm }) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const beatTimeoutRef = useRef<number>(0);

  // 計算節拍間隔
  const beatInterval = 60000 / bpm; // ms per beat

  // 節拍跳動效果
  const triggerBeatPulse = () => {
    if (!circleRef.current) return;

    const circle = circleRef.current;
    
    // 動畫持續時間應該是節拍間隔的一部分，確保在下次節拍前完成
    const animationDuration = Math.min(beatInterval * 0.3, 300); // 最長300ms，或節拍間隔的30%
    
    // 設置 CSS 變數來控制動畫持續時間
    circle.style.setProperty('--pulse-duration', `${animationDuration}ms`);
    
    // 添加跳動 class
    circle.classList.add('center-circle--pulse');
    
    // 移除 class，準備下次跳動
    setTimeout(() => {
      circle.classList.remove('center-circle--pulse');
    }, animationDuration);
  };

  // 開始節拍系統
  useEffect(() => {
    if (!isPlaying) {
      if (beatTimeoutRef.current) {
        clearInterval(beatTimeoutRef.current);
      }
      return;
    }

    // 立即觸發一次跳動
    triggerBeatPulse();

    // 設置定期跳動
    const interval = setInterval(() => {
      triggerBeatPulse();
    }, beatInterval);

    beatTimeoutRef.current = interval;

    return () => {
      if (beatTimeoutRef.current) {
        clearInterval(beatTimeoutRef.current);
      }
    };
  }, [isPlaying, beatInterval]);

  // 清理函數
  useEffect(() => {
    return () => {
      if (beatTimeoutRef.current) {
        clearInterval(beatTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={circleRef}
      className="center-circle"
    />
  );
};

export default CenterCircle;
