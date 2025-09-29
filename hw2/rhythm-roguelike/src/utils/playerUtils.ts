// Player utility functions for v0.2

import type { 
  PlayerPosition, 
  MovementDirection, 
  AttackDirection,
  PlayerCollision,
  PlayerStats 
} from '../types/player';

/**
 * Calculate new position based on current position and direction
 */
export function calculateNewPosition(
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

/**
 * Check if a position is within grid boundaries
 */
export function isPositionValid(
  position: PlayerPosition,
  gridSize: { width: number; height: number }
): boolean {
  return (
    position.x >= 0 &&
    position.x < gridSize.width &&
    position.y >= 0 &&
    position.y < gridSize.height
  );
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(
  pos1: PlayerPosition,
  pos2: PlayerPosition
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two positions are adjacent (including diagonals)
 */
export function arePositionsAdjacent(
  pos1: PlayerPosition,
  pos2: PlayerPosition
): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return dx <= 1 && dy <= 1;
}

/**
 * Check if two positions are orthogonally adjacent (no diagonals)
 */
export function arePositionsOrthogonallyAdjacent(
  pos1: PlayerPosition,
  pos2: PlayerPosition
): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * Get all adjacent positions (including diagonals)
 */
export function getAdjacentPositions(position: PlayerPosition): PlayerPosition[] {
  return [
    { x: position.x - 1, y: position.y - 1 }, // top-left
    { x: position.x, y: position.y - 1 },     // top
    { x: position.x + 1, y: position.y - 1 }, // top-right
    { x: position.x - 1, y: position.y },     // left
    { x: position.x + 1, y: position.y },     // right
    { x: position.x - 1, y: position.y + 1 }, // bottom-left
    { x: position.x, y: position.y + 1 },     // bottom
    { x: position.x + 1, y: position.y + 1 }  // bottom-right
  ];
}

/**
 * Get orthogonally adjacent positions (no diagonals)
 */
export function getOrthogonallyAdjacentPositions(position: PlayerPosition): PlayerPosition[] {
  return [
    { x: position.x, y: position.y - 1 }, // top
    { x: position.x - 1, y: position.y }, // left
    { x: position.x + 1, y: position.y }, // right
    { x: position.x, y: position.y + 1 }  // bottom
  ];
}

/**
 * Get attack positions based on direction
 */
export function getAttackPositions(
  playerPosition: PlayerPosition,
  direction: AttackDirection
): PlayerPosition[] {
  const { x, y } = playerPosition;
  
  switch (direction) {
    case 'up':
      return [{ x, y: y - 1 }];
    case 'down':
      return [{ x, y: y + 1 }];
    case 'left':
      return [{ x: x - 1, y }];
    case 'right':
      return [{ x: x + 1, y }];
    default:
      return [];
  }
}

/**
 * Check for collisions at a position
 */
export function checkCollision(
  position: PlayerPosition,
  obstacles: PlayerPosition[],
  gridSize: { width: number; height: number }
): PlayerCollision {
  // Check boundary collision
  if (!isPositionValid(position, gridSize)) {
    return {
      hasCollision: true,
      collisionType: 'boundary',
      collisionPosition: position
    };
  }

  // Check obstacle collision
  const hasObstacleCollision = obstacles.some(
    obstacle => obstacle.x === position.x && obstacle.y === position.y
  );

  if (hasObstacleCollision) {
    return {
      hasCollision: true,
      collisionType: 'wall',
      collisionPosition: position
    };
  }

  return { hasCollision: false };
}

/**
 * Calculate damage dealt by player
 */
export function calculateDamage(
  baseAttack: number,
  level: number = 1,
  multiplier: number = 1
): number {
  return Math.floor(baseAttack * level * multiplier);
}

/**
 * Calculate experience needed for next level
 */
export function getExperienceForLevel(level: number): number {
  return level * 100; // Simple formula: 100 * level
}

/**
 * Check if player can level up
 */
export function canLevelUp(currentExp: number, currentLevel: number): boolean {
  return currentExp >= getExperienceForLevel(currentLevel);
}

/**
 * Level up player stats
 */
export function levelUpStats(currentStats: PlayerStats): PlayerStats {
  const newLevel = currentStats.level + 1;
  const newMaxHealth = currentStats.maxHealth + 5;
  const newAttackPower = currentStats.attackPower + 1;
  
  return {
    ...currentStats,
    level: newLevel,
    maxHealth: newMaxHealth,
    health: newMaxHealth, // Full heal on level up
    attackPower: newAttackPower,
    experience: 0 // Reset experience
  };
}

/**
 * Heal player by specified amount
 */
export function healPlayer(stats: PlayerStats, healAmount: number): PlayerStats {
  const newHealth = Math.min(stats.health + healAmount, stats.maxHealth);
  return {
    ...stats,
    health: newHealth
  };
}

/**
 * Damage player by specified amount
 */
export function damagePlayer(stats: PlayerStats, damageAmount: number): PlayerStats {
  const newHealth = Math.max(stats.health - damageAmount, 0);
  return {
    ...stats,
    health: newHealth
  };
}

/**
 * Check if player is alive
 */
export function isPlayerAlive(stats: PlayerStats): boolean {
  return stats.health > 0;
}

/**
 * Get direction from one position to another
 */
export function getDirection(
  from: PlayerPosition,
  to: PlayerPosition
): MovementDirection | null {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (dx === 0 && dy === -1) return 'up';
  if (dx === 0 && dy === 1) return 'down';
  if (dx === -1 && dy === 0) return 'left';
  if (dx === 1 && dy === 0) return 'right';
  
  return null;
}
