import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

const App: React.FC = () => {
  const [audio] = useState(new Audio('/src/assets/music 1.mp3'));
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const startGame = () => {
    // 進入遊戲畫面
    setIsGameStarted(true);

    // 延遲 3 秒後播放音樂
    setTimeout(() => {
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(() => {
        console.log('音樂播放失敗');
      });
    }, 1500);
  };

  useEffect(() => {
    if (!isGameStarted) return;

    // 總是產生 bar，不論是否在播放音樂
    const bpm = 100;
    const beatInterval = 60000 / bpm; // 600ms per beat
    const barMoveDuration = beatInterval * 4; // 4 beats to reach center
    let beatCount = 0;

    const createBarPair = () => {
      const container = document.querySelector('.rhythm-container');
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

    // 立即開始創建 bar，不等播放狀態
    const interval = setInterval(createBarPair, beatInterval / 2); // 每半拍創建一對

    return () => {
      clearInterval(interval);
    };
  }, [isGameStarted]);

  if (!isGameStarted) {
    return (
      <div className="start-screen">
        <div className="start-content">
          <h1 className="game-title">節奏地牢</h1>
          <p className="game-subtitle">Rhythm Roguelike</p>
          <button
            className={`start-game-button ${isButtonHovered ? 'hovered' : ''}`}
            onClick={startGame}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <span className="button-text">開始遊戲</span>
            <span className="button-icon">▶</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gray-background">
      <div className="rhythm-container">
        <div className="center-circle"></div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
