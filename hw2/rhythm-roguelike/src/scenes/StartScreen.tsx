import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import Button from '../components/ui/Button';
import './StartScreen.css';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { gameData, toggleAudio, isAudioEnabled } = useGameState();
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // 背景動畫效果
  useEffect(() => {
    const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // 創建粒子
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // 清理動畫
    };
  }, []);

  return (
    <div className="start-screen">
      <canvas id="background-canvas" className="background-canvas" />
      
      <div className="start-content">
        <div className="game-title-container">
          <h1 className="game-title">節奏地牢</h1>
          <p className="game-subtitle">Rhythm Roguelike</p>
        </div>

        <div className="game-info">
          <div className="best-score">
            最佳分數: <span className="score-value">{gameData.bestScore}</span>
          </div>
        </div>

        <div className="start-actions">
          <Button
            className={`start-game-button ${isButtonHovered ? 'hovered' : ''}`}
            onClick={onStart}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <span className="button-text">開始遊戲</span>
            <span className="button-icon">▶</span>
          </Button>

          <div className="settings-buttons">
            <Button
              className="settings-button"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? '🔊' : '🔇'} 音效
            </Button>
          </div>
        </div>

        <div className="game-instructions">
          <h3>遊戲說明</h3>
          <ul>
            <li>按空格鍵開始遊戲</li>
            <li>跟隨節拍點擊</li>
            <li>ESC 鍵暫停/繼續</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
