// Player input handling hook for v0.2

import { useEffect, useCallback, useRef } from 'react';
import type { 
  MovementDirection, 
  AttackDirection, 
  PlayerAction,
  PlayerInputHandler 
} from '../types/player';

/**
 * Custom hook for handling player input
 * Manages keyboard events and input validation
 */
export const usePlayerInput = (
  onPlayerAction: (action: PlayerAction) => void,
  isInputEnabled: boolean = true
) => {
  // Refs for input state management
  const isInputEnabledRef = useRef<boolean>(isInputEnabled);
  const lastInputTimeRef = useRef<number>(0);
  const inputCooldownRef = useRef<number>(100); // 100ms cooldown between inputs

  // Update input enabled state
  useEffect(() => {
    isInputEnabledRef.current = isInputEnabled;
  }, [isInputEnabled]);

  /**
   * Handle keyboard input events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isInputEnabledRef.current) return;

    const now = Date.now();
    if (now - lastInputTimeRef.current < inputCooldownRef.current) return;

    // Prevent default behavior for game keys
    event.preventDefault();

    let action: PlayerAction | null = null;

    // Movement keys (Arrow keys)
    switch (event.key) {
      case 'ArrowUp':
        action = { type: 'MOVE', direction: 'up' };
        break;
      case 'ArrowDown':
        action = { type: 'MOVE', direction: 'down' };
        break;
      case 'ArrowLeft':
        action = { type: 'MOVE', direction: 'left' };
        break;
      case 'ArrowRight':
        action = { type: 'MOVE', direction: 'right' };
        break;
    }

    // Attack key (F key)
    if (event.key === 'f' || event.key === 'F') {
      // Determine attack direction based on last movement or default
      const attackDirection = getAttackDirection(event);
      action = { type: 'ATTACK', direction: attackDirection };
    }

    // Execute action if valid
    if (action) {
      lastInputTimeRef.current = now;
      onPlayerAction(action);
    }
  }, [onPlayerAction]);

  /**
   * Handle key release events
   */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isInputEnabledRef.current) return;

    // Set player to idle when movement keys are released
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      onPlayerAction({ type: 'IDLE' });
    }
  }, [onPlayerAction]);

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    if (!isInputEnabled) return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, isInputEnabled]);

  /**
   * Create input handler object for external use
   */
  const inputHandler: PlayerInputHandler = {
    handleMovement: useCallback((direction: MovementDirection) => {
      if (isInputEnabledRef.current) {
        onPlayerAction({ type: 'MOVE', direction });
      }
    }, [onPlayerAction]),

    handleAttack: useCallback((direction: AttackDirection) => {
      if (isInputEnabledRef.current) {
        onPlayerAction({ type: 'ATTACK', direction });
      }
    }, [onPlayerAction]),

    handleIdle: useCallback(() => {
      if (isInputEnabledRef.current) {
        onPlayerAction({ type: 'IDLE' });
      }
    }, [onPlayerAction])
  };

  return {
    inputHandler,
    setInputCooldown: (cooldown: number) => {
      inputCooldownRef.current = cooldown;
    }
  };
};

/**
 * Determine attack direction based on input context
 * For now, returns a default direction - can be enhanced later
 */
function getAttackDirection(event: KeyboardEvent): AttackDirection {
  // TODO: Implement smart attack direction based on:
  // - Last movement direction
  // - Enemy positions
  // - Player facing direction
  
  // For now, return default direction
  return 'right';
}
