import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import Button from '../components/ui/Button';
import './GameScreen.css';

interface GameScreenProps {
  onPause: () => void;
  onGameOver: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onPause, onGameOver }) => {
  const { gameData, updateScore, decreaseLives, updateCombo } = useGameState();
  const [audio] = useState(new Audio('/src/assets/music 1.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 開始播放音樂
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      console.log('音樂播放失敗');
      setIsPlaying(true); // 即使音樂失敗也繼續遊戲
    });

    return () => {
      audio.pause();
    };
  }, [audio]);

  useEffect(() => {
    if (!isPlaying) return;

    // 節拍系統
    const bpm = 100;
    const beatInterval = 60000 / bpm; // 600ms per beat
    const barMoveDuration = beatInterval * 4; // 4 beats to reach center
    let beatCount = 0;

    const createBarPair = () => {
      const container = containerRef.current;
      if (!container) return;

      // 決定這一對的顏色 (每拍交替)
      const isBlue = beatCount % 2 === 1;
      const colorClass = isBlue ? 'blue' : 'white';

      // 創建左側條
      const leftBar = document.createElement('div');
      leftBar.className = `rhythm-bar ${colorClass}`;
      leftBar.style.left = '0%';
      leftBar.style.animationDuration = `${barMoveDuration}ms`;
      leftBar.style.animationName = 'moveFromLeft';
      leftBar.style.animationTimingFunction = 'linear';

      // 創建右側條
      const rightBar = document.createElement('div');
      rightBar.className = `rhythm-bar ${colorClass}`;
      rightBar.style.left = '100%';
      rightBar.style.animationDuration = `${barMoveDuration}ms`;
      rightBar.style.animationName = 'moveFromRight';
      rightBar.style.animationTimingFunction = 'linear';

      container.appendChild(leftBar);
      container.appendChild(rightBar);

      // Remove bars after animation
      setTimeout(() => {
        if (leftBar.parentNode) leftBar.parentNode.removeChild(leftBar);
        if (rightBar.parentNode) rightBar.parentNode.removeChild(rightBar);
      }, barMoveDuration);

      beatCount++;
    };

    // 立即開始創建 bar
    const interval = setInterval(createBarPair, beatInterval / 2);

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  const handleClick = () => {
    // 簡單的點擊計分邏輯
    const points = 10 + combo * 5;
    updateScore(points);
    setCombo(prev => prev + 1);
    updateCombo(combo + 1);
  };

  return (
    <div className="game-screen">
      <div className="game-ui">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">分數:</span>
            <span className="stat-value">{gameData.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">連擊:</span>
            <span className="stat-value">{combo}</span>
          </div>
          <div className="stat">
            <span className="stat-label">生命:</span>
            <span className="stat-value">{gameData.lives}</span>
          </div>
        </div>

        <div className="game-controls">
          <Button onClick={onPause} variant="secondary">
            暫停 (ESC)
          </Button>
        </div>
      </div>

      <div 
        className="rhythm-container" 
        ref={containerRef}
        onClick={handleClick}
      >
        <div className="center-circle"></div>
      </div>

      <div className="game-instructions">
        <p>點擊中央圓圈來得分！</p>
      </div>
    </div>
  );
};

export default GameScreen;
