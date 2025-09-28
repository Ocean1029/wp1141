import { useState, useCallback } from 'react';

export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  isPaused: boolean;
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    isPlaying: false,
    isPaused: false,
  });

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));
  }, []);

  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
    }));
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    endGame,
    updateScore,
    nextLevel,
  };
};
