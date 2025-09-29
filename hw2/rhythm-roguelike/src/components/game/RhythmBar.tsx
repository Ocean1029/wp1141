import React, { useEffect, useRef } from 'react';
import './RhythmBar.css';

export interface RhythmBarData {
  id: string;
  type: 'blue' | 'white';
  side: 'left' | 'right';
  startTime: number;
  duration: number;
  startPosition: number;
  targetPosition: number;
  isActive: boolean;
}

interface RhythmBarProps {
  bar: RhythmBarData;
  onComplete: (barId: string) => void;
  onUpdate?: (barId: string, progress: number) => void;
}

const RhythmBar: React.FC<RhythmBarProps> = ({ bar, onComplete, onUpdate }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Update phase - 計算當前位置和狀態
  const update = () => {
    // 使用與 RhythmBarManager 一致的時間基準 (Date.now())
    const elapsed = Date.now() - bar.startTime;
    const progress = Math.min(elapsed / bar.duration, 1);
    
    // 計算當前位置
    const currentPosition = bar.startPosition + (bar.targetPosition - bar.startPosition) * progress;
    
    // 呼叫 update 回調
    if (onUpdate) {
      onUpdate(bar.id, progress);
    }

    // Draw phase - 更新 DOM 元素
    draw(currentPosition, progress);

    // 檢查是否完成
    if (progress >= 1) {
      onComplete(bar.id);
      return;
    }

    // 繼續動畫
    animationRef.current = requestAnimationFrame(update);
  };

  // Draw phase - 渲染視覺元素
  const draw = (position: number, progress: number) => {
    if (!barRef.current) return;

    const element = barRef.current;
    
    // 更新位置
    element.style.left = `${position}%`;
    
    
    // 更新透明度 (接近目標時漸隱)
    const opacity = progress > 0.9 ? 1 - (progress - 0.9) * 5 : 1;
    element.style.opacity = opacity.toString();
    
  };

  // 開始動畫
  useEffect(() => {
    if (bar.isActive) {
      animationRef.current = requestAnimationFrame(update);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bar.isActive]);

  // 清理函數
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!bar.isActive) {
    return null;
  }

  return (
    <div
      ref={barRef}
      className={`rhythm-bar rhythm-bar--${bar.type} rhythm-bar--${bar.side}`}
      data-bar-id={bar.id}
    />
  );
};

export default RhythmBar;
