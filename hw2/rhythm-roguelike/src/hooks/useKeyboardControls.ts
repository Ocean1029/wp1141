import { useEffect } from 'react';
import { type GameState } from './useGameState';

/**
 * Custom hook for handling keyboard controls
 * Manages game state transitions based on keyboard input
 */
export const useKeyboardControls = (
  gameState: GameState,
  setGameState: (state: GameState) => void
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default behavior for space key to avoid page scrolling
      if (event.code === 'Space') {
        event.preventDefault();
      }

      // Handle different key presses based on current game state
      switch (event.code) {
        case 'Escape':
          handleEscapeKey(gameState, setGameState);
          break;
        case 'Space':
          handleSpaceKey(gameState, setGameState);
          break;
        default:
          // No action for other keys
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);
    
    // Cleanup function to remove event listener
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, setGameState]);
};

/**
 * Handles Escape key press for pause/resume functionality
 */
const handleEscapeKey = (
  gameState: GameState,
  setGameState: (state: GameState) => void
) => {
  switch (gameState) {
    case 'playing':
      setGameState('paused');
      break;
    case 'paused':
      setGameState('playing');
      break;
    default:
      // Escape key has no effect in other states
      break;
  }
};

/**
 * Handles Space key press for game start functionality
 */
const handleSpaceKey = (
  gameState: GameState,
  setGameState: (state: GameState) => void
) => {
  switch (gameState) {
    case 'start':
      setGameState('playing');
      break;
    default:
      // Space key has no effect in other states
      break;
  }
};
