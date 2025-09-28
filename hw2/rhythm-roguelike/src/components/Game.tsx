import React from 'react';

interface GameProps {
  className?: string;
}

const Game: React.FC<GameProps> = ({ className }) => {
  return (
    <div className={`game-container ${className || ''}`}>
      <h1>Rhythm Roguelike</h1>
      <div className="game-area">
        <p>遊戲區域將在這裡顯示</p>
      </div>
    </div>
  );
};

export default Game;
