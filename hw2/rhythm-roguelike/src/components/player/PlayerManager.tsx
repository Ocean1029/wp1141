// Player manager component for v0.2

import React, { useCallback, useEffect } from 'react';
import { usePlayerState } from '../../hooks/usePlayerState';
import { usePlayerInput } from '../../hooks/usePlayerInput';
import { Player } from './Player';
import type { PlayerAction, PlayerPosition } from '../../types/player';
import { DEFAULT_PLAYER_CONFIG } from '../../config/playerConfig';
import { 
  calculateNewPosition, 
  isPositionValid, 
  checkCollision 
} from '../../utils/playerUtils';

/**
 * Props for PlayerManager component
 */
interface PlayerManagerProps {
  gridSize: { width: number; height: number };
  cellSize: number;
  obstacles?: PlayerPosition[];
  onPlayerAction?: (action: PlayerAction) => void;
  onPlayerPositionChange?: (position: PlayerPosition) => void;
  onPlayerStatsChange?: (stats: any) => void;
  isInputEnabled?: boolean;
  initialPosition?: PlayerPosition;
}

/**
 * PlayerManager component that handles all player-related logic
 * Integrates player state, input handling, and rendering
 */
export const PlayerManager: React.FC<PlayerManagerProps> = ({
  gridSize,
  cellSize,
  obstacles = [],
  onPlayerAction,
  onPlayerPositionChange,
  onPlayerStatsChange,
  isInputEnabled = true,
  initialPosition = { x: 0, y: 0 }
}) => {
  // Player state management
  const {
    playerState,
    movePlayer,
    attackPlayer,
    setPlayerIdle,
    updatePlayerStats,
    resetPlayer,
    canPerformAction
  } = usePlayerState();

  // Handle player actions from input
  const handlePlayerAction = useCallback((action: PlayerAction) => {
    if (!canPerformAction(DEFAULT_PLAYER_CONFIG.attackCooldown)) {
      return;
    }

    switch (action.type) {
      case 'MOVE':
        handleMovement(action.direction);
        break;
      case 'ATTACK':
        handleAttack(action.direction);
        break;
      case 'IDLE':
        setPlayerIdle();
        break;
    }

    // Notify parent component
    onPlayerAction?.(action);
  }, [canPerformAction, onPlayerAction, setPlayerIdle]);

  // Player input handling
  usePlayerInput(handlePlayerAction, isInputEnabled);

  // Handle movement with collision detection
  const handleMovement = useCallback((direction: any) => {
    const newPosition = calculateNewPosition(playerState.position, direction);
    
    // Check if new position is valid
    if (!isPositionValid(newPosition, gridSize)) {
      return;
    }

    // Check for collisions
    const collision = checkCollision(newPosition, obstacles, gridSize);
    if (collision.hasCollision) {
      return;
    }

    // Move player
    movePlayer(direction);
    
    // Notify parent of position change
    onPlayerPositionChange?.(newPosition);
  }, [playerState.position, gridSize, obstacles, movePlayer, onPlayerPositionChange]);

  // Handle attack
  const handleAttack = useCallback((direction: any) => {
    attackPlayer(direction);
    
    // TODO: Implement attack logic
    // - Check for enemies in attack direction
    // - Calculate damage
    // - Apply damage to enemies
    // - Play attack effects
  }, [attackPlayer]);

  // Initialize player on mount
  useEffect(() => {
    resetPlayer(initialPosition);
  }, [resetPlayer, initialPosition]);

  // Notify parent of stats changes
  useEffect(() => {
    onPlayerStatsChange?.(playerState.stats);
  }, [playerState.stats, onPlayerStatsChange]);

  return (
    <Player
      playerState={playerState}
      gridSize={gridSize}
      cellSize={cellSize}
      isVisible={isInputEnabled}
    />
  );
};

export default PlayerManager;
