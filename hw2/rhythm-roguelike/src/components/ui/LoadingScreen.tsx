import React from 'react';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">載入中...</h2>
        <p className="loading-subtitle">正在準備遊戲資源</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
