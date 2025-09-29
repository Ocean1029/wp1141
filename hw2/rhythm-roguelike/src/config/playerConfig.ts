// Player configuration for v0.2

import type { PlayerConfig, PlayerStats, PlayerClass } from '../types/player';

/**
 * Default player configurations for different classes
 */
export const PLAYER_CONFIGS: Record<PlayerClass, PlayerConfig> = {
  warrior: {
    class: 'warrior',
    initialStats: {
      health: 10,
      maxHealth: 10,
      attackPower: 3,
      level: 1,
      experience: 0
    },
    movementSpeed: 1, // cells per beat
    attackRange: 1, // adjacent cells only
    attackCooldown: 500 // milliseconds
  },
  
  mage: {
    class: 'mage',
    initialStats: {
      health: 8,
      maxHealth: 8,
      attackPower: 4,
      level: 1,
      experience: 0
    },
    movementSpeed: 1,
    attackRange: 2, // can attack 2 cells away
    attackCooldown: 800
  },
  
  archer: {
    class: 'archer',
    initialStats: {
      health: 9,
      maxHealth: 9,
      attackPower: 3,
      level: 1,
      experience: 0
    },
    movementSpeed: 1,
    attackRange: 3, // can attack 3 cells away
    attackCooldown: 600
  }
};

/**
 * Default player configuration (warrior for v0.2)
 */
export const DEFAULT_PLAYER_CONFIG = PLAYER_CONFIGS.warrior;

/**
 * Player level progression configuration
 */
export const PLAYER_LEVEL_CONFIG = {
  // Experience required for each level
  experiencePerLevel: (level: number) => level * 100,
  
  // Health increase per level
  healthPerLevel: 5,
  
  // Attack power increase per level
  attackPowerPerLevel: 1,
  
  // Maximum level
  maxLevel: 10
};

/**
 * Player movement configuration
 */
export const PLAYER_MOVEMENT_CONFIG = {
  // Input cooldown to prevent spam
  inputCooldown: 100, // milliseconds
  
  // Animation duration for movement
  movementAnimationDuration: 200, // milliseconds
  
  // Animation duration for attacks
  attackAnimationDuration: 300, // milliseconds
  
  // Grid cell size in pixels
  cellSize: 64, // pixels
};

/**
 * Player UI configuration
 */
export const PLAYER_UI_CONFIG = {
  // Health bar configuration
  healthBar: {
    width: '80%',
    height: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    fillColor: 'linear-gradient(90deg, #ff4757, #ff6b6b)'
  },
  
  // Stats overlay configuration
  statsOverlay: {
    fontSize: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  
  // Player sprite configuration
  sprite: {
    size: '80%', // percentage of cell size
    bodyColor: 'linear-gradient(135deg, #4a90e2, #357abd)',
    borderColor: '#2c5aa0',
    faceColor: '#f4e4bc'
  }
};

/**
 * Get player configuration by class
 */
export function getPlayerConfig(playerClass: PlayerClass): PlayerConfig {
  return PLAYER_CONFIGS[playerClass];
}

/**
 * Get initial player stats by class
 */
export function getInitialPlayerStats(playerClass: PlayerClass): PlayerStats {
  return PLAYER_CONFIGS[playerClass].initialStats;
}

/**
 * Calculate stats for a specific level
 */
export function calculateStatsForLevel(
  baseStats: PlayerStats,
  targetLevel: number
): PlayerStats {
  const levelDifference = targetLevel - baseStats.level;
  
  return {
    ...baseStats,
    level: targetLevel,
    maxHealth: baseStats.maxHealth + (levelDifference * PLAYER_LEVEL_CONFIG.healthPerLevel),
    attackPower: baseStats.attackPower + (levelDifference * PLAYER_LEVEL_CONFIG.attackPowerPerLevel),
    health: baseStats.maxHealth + (levelDifference * PLAYER_LEVEL_CONFIG.healthPerLevel) // Full heal
  };
}
