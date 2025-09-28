import React from 'react';
import Button from '../components/ui/Button';
import './PauseScreen.css';

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onResume, onRestart }) => {
  return (
    <div className="pause-screen">
      <div className="pause-content">
        <h1 className="pause-title">遊戲暫停</h1>
        
        <div className="pause-actions">
          <Button onClick={onResume} variant="primary" size="large">
            繼續遊戲
          </Button>
          
          <Button onClick={onRestart} variant="secondary" size="large">
            重新開始
          </Button>
        </div>

        <div className="pause-instructions">
          <p>按 ESC 鍵或點擊「繼續遊戲」來恢復遊戲</p>
        </div>
      </div>
    </div>
  );
};

export default PauseScreen;
