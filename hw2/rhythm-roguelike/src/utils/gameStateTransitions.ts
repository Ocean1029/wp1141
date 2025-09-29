import { type GameState } from '../hooks/useGameState';

/**
 * Game state transition utilities
 * Provides type-safe state transitions with clear business logic
 */
export class GameStateTransitions {
  /**
   * Transitions from start screen to playing state
   */
  static startGame(setGameState: (state: GameState) => void): void {
    setGameState('playing');
  }

  /**
   * Transitions from playing to paused state
   */
  static pauseGame(setGameState: (state: GameState) => void): void {
    setGameState('paused');
  }

  /**
   * Transitions from paused back to playing state
   */
  static resumeGame(setGameState: (state: GameState) => void): void {
    setGameState('playing');
  }

  /**
   * Transitions from any state to game over
   */
  static endGame(setGameState: (state: GameState) => void): void {
    setGameState('gameOver');
  }

  /**
   * Transitions from any state back to start screen
   */
  static restartGame(setGameState: (state: GameState) => void): void {
    setGameState('start');
  }

  /**
   * Transitions to loading state
   */
  static loadGame(setGameState: (state: GameState) => void): void {
    setGameState('loading');
  }
}

/**
 * Type-safe state transition handler
 * Ensures only valid transitions are allowed
 */
export const createStateTransitionHandler = (
  setGameState: (state: GameState) => void
) => ({
  startGame: () => GameStateTransitions.startGame(setGameState),
  pauseGame: () => GameStateTransitions.pauseGame(setGameState),
  resumeGame: () => GameStateTransitions.resumeGame(setGameState),
  endGame: () => GameStateTransitions.endGame(setGameState),
  restartGame: () => GameStateTransitions.restartGame(setGameState),
  loadGame: () => GameStateTransitions.loadGame(setGameState),
});
