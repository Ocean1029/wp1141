import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

const App: React.FC = () => {
  const [audio] = useState(new Audio('/src/assets/music 1.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayMusic = () => {
    audio.loop = true;
    audio.play();
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const bpm = 100;
    const beatInterval = 60000 / bpm; // 600ms per beat
    const barMoveDuration = beatInterval * 4; // 4 beats to reach center
    let beatCount = 0;

    const createBarPair = () => {
      const container = document.querySelector('.rhythm-container');
      if (!container) return;

      // 決定這一對的顏色 (每拍交替)
      const isBlue = beatCount % 2 === 0;
      const colorClass = isBlue ? 'blue' : 'purple';

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

    // Create bar pairs more frequently for denser effect
    const interval = setInterval(createBarPair, beatInterval / 2); // 每半拍創建一對

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying]);

  return (
    <div className="gray-background">
      <button onClick={handlePlayMusic} className="play-button">
        播放音樂
      </button>
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
