import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameProvider } from './store/GameContext';
import App from './App';
import './styles/index.css';

// 遊戲初始化配置
const gameConfig = {
  canvas: {
    width: 800,
    height: 600,
  },
  audio: {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
  },
  game: {
    fps: 60,
    debug: import.meta.env.DEV,
  },
};

// 初始化遊戲
const initGame = () => {
  // 預載入關鍵資源
  const preloadAssets = async () => {
    try {
      // 預載入音效
      new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 預載入圖片
      const imagePromises: Promise<void>[] = [
        // 在這裡添加需要預載入的圖片
      ];
      
      await Promise.all(imagePromises);
      
      console.log('遊戲資源預載入完成');
    } catch (error) {
      console.error('資源預載入失敗:', error);
    }
  };

  preloadAssets();
};

// 啟動應用
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <GameProvider config={gameConfig}>
      <App />
    </GameProvider>
  </React.StrictMode>
);

// 初始化遊戲
initGame();
z