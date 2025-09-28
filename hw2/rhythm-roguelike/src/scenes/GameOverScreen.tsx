import React from 'react';
import { useGameState } from '../hooks/useGameState';
import Button from '../components/ui/Button';
import './GameOverScreen.css';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart }) => {
  const { gameData, updateBestScore } = useGameState();

  React.useEffect(() => {
    // 更新最佳分數
    updateBestScore(score);
  }, [score, updateBestScore]);

  return (
    <div className="game-over-screen">
      <div className="game-over-content">
        <h1 className="game-over-title">遊戲結束</h1>
        
        <div className="score-display">
          <div className="score-item">
            <span className="score-label">本次分數:</span>
            <span className="score-value">{score}</span>
          </div>
          
          <div className="score-item">
            <span className="score-label">最佳分數:</span>
            <span className="score-value">{gameData.bestScore}</span>
          </div>
        </div>

        <div className="game-over-actions">
          <Button onClick={onRestart} variant="primary" size="large">
            再玩一次
          </Button>
        </div>

        <div className="game-over-message">
          {score >= gameData.bestScore ? (
            <p className="new-record">🎉 新紀錄！</p>
          ) : (
            <p>繼續努力，挑戰更高分數！</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
