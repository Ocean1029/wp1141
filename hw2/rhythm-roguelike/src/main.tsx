import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

const App: React.FC = () => {
  const [audio] = useState(new Audio('/src/assets/music 1.mp3'));

  // 自動播放音樂 - 多種嘗試方式
  useEffect(() => {
    const autoPlay = async () => {
      try {
        audio.loop = true;
        audio.volume = 0.5;
        await audio.play();
        console.log('音樂自動播放成功');
      } catch {
        // 如果自動播放失敗，嘗試在用戶第一次點擊時播放
        const startOnInteraction = () => {
          audio.loop = true;
          audio.volume = 0.5;
          audio.play();
          console.log('音樂在用戶互動後播放');
          // 移除事件監聽器，避免重複觸發
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('keydown', startOnInteraction);
          document.removeEventListener('touchstart', startOnInteraction);
        };

        document.addEventListener('click', startOnInteraction);
        document.addEventListener('keydown', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);

        console.log('自動播放被阻止，等待用戶互動');
      }
    };

    // 立即嘗試播放
    autoPlay();

    // 也在頁面獲得焦點時嘗試播放
    const handleFocus = () => {
      if (audio.paused) {
        audio.play().catch(() => {
          console.log('焦點時播放失敗');
        });
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [audio]);

  const handlePlayMusic = () => {
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
  };

  useEffect(() => {
    // 總是產生 bar，不論是否在播放音樂
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

    // 立即開始創建 bar，不等播放狀態
    const interval = setInterval(createBarPair, beatInterval / 2); // 每半拍創建一對

    return () => {
      clearInterval(interval);
    };
  }, []); // 移除 isPlaying 依賴

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
