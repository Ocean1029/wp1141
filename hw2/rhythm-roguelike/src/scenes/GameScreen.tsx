import React, { useState, useEffect, useRef } from 'react';
import Button from '../components/ui/Button';
import RhythmBarManager from '../components/game/RhythmBarManager';
import CenterCircle from '../components/game/CenterCircle';
import './GameScreen.css';

interface GameScreenProps {
  onPause: () => void;
  onGameOver: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onPause }) => {
  const [audio] = useState(new Audio('/src/assets/music 1.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 固定 BPM，不再動態調整
  const currentBpm = 106;

  useEffect(() => {
    // 開始播放音樂
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      console.log('音樂播放失敗');
      setIsPlaying(true); // 即使音樂失敗也繼續遊戲
    });

    return () => {
      audio.pause();
    };
  }, [audio]);

  // 處理節奏條完成 - 純視覺效果，無遊戲邏輯
  const handleBarComplete = (_barId: string) => {
    // 節奏條完成，純視覺效果
  };

  // 處理節奏條更新 - 純視覺效果
  const handleBarUpdate = (_barId: string, _progress: number) => {
    // 可以在這裡添加額外的視覺效果
  };

  return (
    <div className="game-screen">
      <div className="game-ui">
        <div className="game-controls">
          <Button onClick={onPause} variant="secondary">
            暫停 (ESC)
          </Button>
        </div>
      </div>

      <div 
        className="rhythm-container" 
        ref={containerRef}
      >
        <CenterCircle 
          isPlaying={isPlaying}
          bpm={currentBpm}
        />
        <RhythmBarManager
          isPlaying={isPlaying}
          bpm={currentBpm}
          onBarComplete={handleBarComplete}
          onBarUpdate={handleBarUpdate}
        />
      </div>
    </div>
  );
};

export default GameScreen;
