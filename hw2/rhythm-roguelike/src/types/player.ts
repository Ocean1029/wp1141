// Player system type definitions for v0.2

/**
 * Player attributes and stats
 */
export type PlayerStats = {
  health: number;
  maxHealth: number;
  attackPower: number;
  level: number;
  experience: number;
};

/**
 * Player position on the game grid
 */
export type PlayerPosition = {
  x: number;
  y: number;
};

/**
 * Player movement direction
 */
export type MovementDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Player attack direction
 */
export type AttackDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Player state during gameplay
 */
export type PlayerState = {
  position: PlayerPosition;
  stats: PlayerStats;
  isMoving: boolean;
  isAttacking: boolean;
  attackDirection?: AttackDirection;
  lastActionTime: number;
};

/**
 * Player input actions
 */
export type PlayerAction = 
  | { type: 'MOVE'; direction: MovementDirection }
  | { type: 'ATTACK'; direction: AttackDirection }
  | { type: 'IDLE' };

/**
 * Player class/type (for future expansion)
 */
export type PlayerClass = 'warrior' | 'mage' | 'archer';

/**
 * Player configuration
 */
export type PlayerConfig = {
  class: PlayerClass;
  initialStats: PlayerStats;
  movementSpeed: number;
  attackRange: number;
  attackCooldown: number;
};

/**
 * Player input handler interface
 */
export type PlayerInputHandler = {
  handleMovement: (direction: MovementDirection) => void;
  handleAttack: (direction: AttackDirection) => void;
  handleIdle: () => void;
};

/**
 * Player collision detection result
 */
export type PlayerCollision = {
  hasCollision: boolean;
  collisionType?: 'wall' | 'enemy' | 'item' | 'boundary';
  collisionPosition?: PlayerPosition;
};
