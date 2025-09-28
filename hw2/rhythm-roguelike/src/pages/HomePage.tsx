import React from 'react';
import Game from '../components/Game';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>節拍 Roguelike</h1>
        <p>一個結合節拍遊戲和 Roguelike 元素的網頁遊戲</p>
      </header>

      <main className="page-main">
        <Game />
      </main>

      <footer className="page-footer">
        <p>使用 React + TypeScript + Vite 開發</p>
      </footer>
    </div>
  );
};

export default HomePage;
