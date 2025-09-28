import React, { useState, useEffect, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import Button from '../components/ui/Button';
import RhythmBarManager from '../components/game/RhythmBarManager';
import CenterCircle from '../components/game/CenterCircle';
import './GameScreen.css';

interface GameScreenProps {
  onPause: () => void;
  onGameOver: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onPause }) => {
  const { gameData, updateCombo } = useGameState();
  const [audio] = useState(new Audio('/src/assets/music 1.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(100); // 預設 BPM，可以根據音樂動態調整
  const containerRef = useRef<HTMLDivElement>(null);
  const rhythmManagerRef = useRef<any>(null);

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

  // 動態 BPM 調整示例 - 可以根據音樂時間軸調整
  useEffect(() => {
    if (!isPlaying) return;

    // 這裡可以根據音樂的進度動態調整 BPM
    // 例如：根據音樂的不同段落設置不同的 BPM
    const adjustBpmOverTime = () => {
      const currentTime = audio.currentTime;
      
      // 示例：根據音樂時間調整 BPM
      if (currentTime < 30) {
        setCurrentBpm(100); // 開頭較慢
      } else if (currentTime < 60) {
        setCurrentBpm(120); // 中段加快
      } else {
        setCurrentBpm(140); // 高潮部分更快
      }
    };

    // 每秒檢查一次 BPM 調整
    const bpmCheckInterval = setInterval(adjustBpmOverTime, 1000);

    return () => {
      clearInterval(bpmCheckInterval);
    };
  }, [isPlaying, audio]);

  // 處理節奏條完成
  const handleBarComplete = (_barId: string, wasHit: boolean) => {
    if (!wasHit) {
      // 錯過了節奏條，重置連擊
      setCombo(0);
      updateCombo(0);
    }
  };

  // 處理節奏條更新
  const handleBarUpdate = (_barId: string, _progress: number) => {
    // 可以在這裡添加額外的邏輯，比如視覺效果
  };

  // 點擊處理已移除 - 中央圓圈不再需要點擊互動

  return (
    <div className="game-screen">
      <div className="game-ui">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">分數:</span>
            <span className="stat-value">{gameData.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">連擊:</span>
            <span className="stat-value">{combo}</span>
          </div>
          <div className="stat">
            <span className="stat-label">生命:</span>
            <span className="stat-value">{gameData.lives}</span>
          </div>
        </div>

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
          containerRef={rhythmManagerRef}
        />
      </div>
    </div>
  );
};

export default GameScreen;
