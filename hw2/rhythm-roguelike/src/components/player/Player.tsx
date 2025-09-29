// Player component for v0.2

import React from 'react';
import type { PlayerState, PlayerPosition } from '../../types/player';
import './Player.css';

/**
 * Props for Player component
 */
interface PlayerProps {
  playerState: PlayerState;
  gridSize: { width: number; height: number };
  cellSize: number;
  isVisible?: boolean;
}

/**
 * Player component that renders the player character
 * Displays player position, health, and animation states
 */
export const Player: React.FC<PlayerProps> = ({
  playerState,
  gridSize,
  cellSize,
  isVisible = true
}) => {
  if (!isVisible) return null;

  const { position, stats, isMoving, isAttacking, attackDirection } = playerState;

  // Calculate pixel position from grid position
  const pixelX = position.x * cellSize;
  const pixelY = position.y * cellSize;

  // Determine CSS classes based on player state
  const playerClasses = [
    'player',
    isMoving ? 'player--moving' : '',
    isAttacking ? 'player--attacking' : '',
    attackDirection ? `player--attack-${attackDirection}` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="player-container">
      {/* Player character */}
      <div
        className={playerClasses}
        style={{
          left: `${pixelX}px`,
          top: `${pixelY}px`,
          width: `${cellSize}px`,
          height: `${cellSize}px`
        }}
      >
        {/* Player sprite/visual representation */}
        <div className="player__sprite">
          <div className="player__body" />
          <div className="player__face" />
        </div>

        {/* Attack indicator */}
        {isAttacking && attackDirection && (
          <div className={`player__attack-indicator player__attack-indicator--${attackDirection}`}>
            <div className="player__attack-effect" />
          </div>
        )}

        {/* Health bar */}
        <div className="player__health-bar">
          <div 
            className="player__health-fill"
            style={{ 
              width: `${(stats.health / stats.maxHealth) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Player stats display (optional overlay) */}
      <div className="player__stats-overlay">
        <div className="player__stat">
          <span className="player__stat-label">HP:</span>
          <span className="player__stat-value">{stats.health}/{stats.maxHealth}</span>
        </div>
        <div className="player__stat">
          <span className="player__stat-label">ATK:</span>
          <span className="player__stat-value">{stats.attackPower}</span>
        </div>
        <div className="player__stat">
          <span className="player__stat-label">LVL:</span>
          <span className="player__stat-value">{stats.level}</span>
        </div>
      </div>
    </div>
  );
};

export default Player;
