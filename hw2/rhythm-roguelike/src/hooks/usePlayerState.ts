// Player state management hook for v0.2

import { useState, useCallback, useRef } from 'react';
import type { 
  PlayerState, 
  PlayerPosition, 
  PlayerStats, 
  MovementDirection, 
  AttackDirection,
  PlayerAction 
} from '../types/player';

/**
 * Custom hook for managing player state
 * Handles player position, stats, and actions
 */
export const usePlayerState = () => {
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    position: { x: 0, y: 0 },
    stats: {
      health: 10,
      maxHealth: 10,
      attackPower: 3,
      level: 1,
      experience: 0
    },
    isMoving: false,
    isAttacking: false,
    lastActionTime: 0
  });

  // Refs for performance optimization
  const lastActionTimeRef = useRef<number>(0);
  const isActionInProgressRef = useRef<boolean>(false);

  /**
   * Move player in specified direction
   */
  const movePlayer = useCallback((direction: MovementDirection) => {
    setPlayerState(prevState => {
      const newPosition = calculateNewPosition(prevState.position, direction);
      
      return {
        ...prevState,
        position: newPosition,
        isMoving: true,
        lastActionTime: Date.now()
      };
    });
  }, []);

  /**
   * Execute player attack in specified direction
   */
  const attackPlayer = useCallback((direction: AttackDirection) => {
    setPlayerState(prevState => ({
      ...prevState,
      isAttacking: true,
      attackDirection: direction,
      lastActionTime: Date.now()
    }));
  }, []);

  /**
   * Set player to idle state
   */
  const setPlayerIdle = useCallback(() => {
    setPlayerState(prevState => ({
      ...prevState,
      isMoving: false,
      isAttacking: false,
      attackDirection: undefined
    }));
  }, []);

  /**
   * Update player stats
   */
  const updatePlayerStats = useCallback((newStats: Partial<PlayerStats>) => {
    setPlayerState(prevState => ({
      ...prevState,
      stats: { ...prevState.stats, ...newStats }
    }));
  }, []);

  /**
   * Reset player to initial state
   */
  const resetPlayer = useCallback((initialPosition: PlayerPosition = { x: 0, y: 0 }) => {
    setPlayerState({
      position: initialPosition,
      stats: {
        health: 10,
        maxHealth: 10,
        attackPower: 3,
        level: 1,
        experience: 0
      },
      isMoving: false,
      isAttacking: false,
      lastActionTime: 0
    });
  }, []);

  /**
   * Check if player can perform action (cooldown check)
   */
  const canPerformAction = useCallback((cooldownMs: number = 100): boolean => {
    const now = Date.now();
    return now - lastActionTimeRef.current >= cooldownMs;
  }, []);

  return {
    playerState,
    movePlayer,
    attackPlayer,
    setPlayerIdle,
    updatePlayerStats,
    resetPlayer,
    canPerformAction
  };
};

/**
 * Calculate new position based on current position and direction
 */
function calculateNewPosition(
  currentPosition: PlayerPosition, 
  direction: MovementDirection
): PlayerPosition {
  const { x, y } = currentPosition;
  
  switch (direction) {
    case 'up':
      return { x, y: y - 1 };
    case 'down':
      return { x, y: y + 1 };
    case 'left':
      return { x: x - 1, y };
    case 'right':
      return { x: x + 1, y };
    default:
      return currentPosition;
  }
}
