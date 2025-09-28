import React, { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import StartScreen from './scenes/StartScreen';
import GameScreen from './scenes/GameScreen';
import PauseScreen from './scenes/PauseScreen';
import GameOverScreen from './scenes/GameOverScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

export type GameState = 'loading' | 'start' | 'playing' | 'paused' | 'gameOver';

const App: React.FC = () => {
  const { gameState, setGameState, gameData } = useGameState();
  const [isLoading, setIsLoading] = useState(true);

  // 模擬資源載入
  useEffect(() => {
    const loadResources = async () => {
      try {
        // 這裡可以載入遊戲所需的資源
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('資源載入失敗:', error);
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Escape':
          if (gameState === 'playing') {
            setGameState('paused');
          } else if (gameState === 'paused') {
            setGameState('playing');
          }
          break;
        case 'Space':
          event.preventDefault();
          if (gameState === 'start') {
            setGameState('playing');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, setGameState]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="app">
        {gameState === 'start' && (
          <StartScreen onStart={() => setGameState('playing')} />
        )}
        
        {gameState === 'playing' && (
          <GameScreen 
            onPause={() => setGameState('paused')}
            onGameOver={() => setGameState('gameOver')}
          />
        )}
        
        {gameState === 'paused' && (
          <PauseScreen 
            onResume={() => setGameState('playing')}
            onRestart={() => setGameState('start')}
          />
        )}
        
        {gameState === 'gameOver' && (
          <GameOverScreen 
            score={gameData.score}
            onRestart={() => setGameState('start')}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
