import React from 'react';
import { type GameState } from '../hooks/useGameState';
import StartScreen from '../scenes/StartScreen';
import GameScreen from '../scenes/GameScreen';
import PauseScreen from '../scenes/PauseScreen';
import GameOverScreen from '../scenes/GameOverScreen';
import LoadingScreen from '../scenes/LoadingScreen';

interface GameSceneRendererProps {
  gameState: GameState;
  gameData: {
    score: number;
    level: number;
    lives: number;
    combo: number;
    bestScore: number;
  };
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onEndGame: () => void;
  onRestartGame: () => void;
}

/**
 * Game Scene Renderer Component
 * Handles rendering of different game scenes based on current state
 * Centralizes all scene rendering logic for better maintainability
 */
export const GameSceneRenderer: React.FC<GameSceneRendererProps> = ({
  gameState,
  gameData,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onEndGame,
  onRestartGame,
}) => {
  // Render appropriate scene based on current game state
  switch (gameState) {
    case 'loading':
      return <LoadingScreen />;

    case 'start':
      return <StartScreen onStart={onStartGame} />;

    case 'playing':
      return (
        <GameScreen 
          onPause={onPauseGame}
          onGameOver={onEndGame}
        />
      );

    case 'paused':
      return (
        <PauseScreen 
          onResume={onResumeGame}
          onRestart={onRestartGame}
        />
      );

    case 'gameOver':
      return (
        <GameOverScreen 
          score={gameData.score}
          onRestart={onRestartGame}
        />
      );

    default:
      // Fallback to start screen for unknown states
      console.warn(`Unknown game state: ${gameState}, falling back to start screen`);
      return <StartScreen onStart={onStartGame} />;
  }
};
