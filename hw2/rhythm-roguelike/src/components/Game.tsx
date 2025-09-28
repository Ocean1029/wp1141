import React from 'react';
import { RhythmController } from './index';

interface GameProps {
  className?: string;
}

const Game: React.FC<GameProps> = ({ className }) => {
  const handleBeat = (beatType: 'downbeat' | 'upbeat', beatNumber: number) => {
    console.log(`節拍: ${beatType}, 節拍號: ${beatNumber}`);
  };

  return (
    <div className={`game-container ${className || ''}`}>
      <RhythmController onBeat={handleBeat} />
    </div>
  );
};

export default Game;
