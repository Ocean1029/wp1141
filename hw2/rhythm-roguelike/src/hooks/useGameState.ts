import { useState, useCallback } from 'react';
import { useGameContext } from '../store/GameContext';

export type GameState = 'loading' | 'start' | 'playing' | 'paused' | 'gameOver';

export const useGameState = () => {
  const { state, dispatch } = useGameContext();
  const [gameState, setGameState] = useState<GameState>('start');

  // 遊戲動作
  const updateScore = useCallback((points: number) => {
    dispatch({ type: 'UPDATE_SCORE', payload: points });
  }, [dispatch]);

  const incrementLevel = useCallback(() => {
    dispatch({ type: 'INCREMENT_LEVEL' });
  }, [dispatch]);

  const decreaseLives = useCallback(() => {
    dispatch({ type: 'DECREASE_LIVES' });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    setGameState('start');
  }, [dispatch]);

  const updateCombo = useCallback((combo: number) => {
    dispatch({ type: 'UPDATE_COMBO', payload: combo });
  }, [dispatch]);

  const toggleAudio = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUDIO' });
  }, [dispatch]);

  const toggleFullscreen = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  }, [dispatch]);

  const updateBestScore = useCallback((score: number) => {
    if (score > state.gameData.bestScore) {
      dispatch({ type: 'UPDATE_BEST_SCORE', payload: score });
    }
  }, [dispatch, state.gameData.bestScore]);

  return {
    gameState,
    setGameState,
    gameData: state.gameData,
    config: state.config,
    isAudioEnabled: state.isAudioEnabled,
    isFullscreen: state.isFullscreen,
    // 動作
    updateScore,
    incrementLevel,
    decreaseLives,
    resetGame,
    updateCombo,
    toggleAudio,
    toggleFullscreen,
    updateBestScore,
  };
};
