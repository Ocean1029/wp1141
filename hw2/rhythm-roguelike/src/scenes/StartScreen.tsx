import React, { useState } from 'react';
import Button from '../components/ui/Button';
import './StartScreen.css';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <div className="start-screen">
      <div className="cover-image" />
      
      <div className="start-content">
        <div className="start-actions">
          <Button
            className={`start-game-button ${isButtonHovered ? 'hovered' : ''}`}
            onClick={onStart}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <span className="button-text">Accept Quest</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
