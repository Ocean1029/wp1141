import React, { useEffect, useRef } from 'react';
import { useRhythm } from '../hooks/useRhythm';
import { AudioSystem } from '../systems/AudioSystem';
import RhythmIndicator from './RhythmIndicator';

interface RhythmControllerProps {
  className?: string;
  onBeat?: (beatType: 'downbeat' | 'upbeat', beatNumber: number) => void;
}

const RhythmController: React.FC<RhythmControllerProps> = ({
  className = '',
  onBeat,
}) => {
  const { rhythmState, startMetronome, stopMetronome, updateConfig, onBeat: setBeatCallback } = useRhythm();
  const audioSystemRef = useRef<AudioSystem | null>(null);

  // 初始化音效系統
  useEffect(() => {
    audioSystemRef.current = new AudioSystem({
      volume: 0.7,
      enabled: true,
    });

    return () => {
      if (audioSystemRef.current) {
        // 清理音效系統
      }
    };
  }, []);

  // 設置節拍回調
  useEffect(() => {
    setBeatCallback((beatType, beatNumber) => {
      // 播放音效
      if (audioSystemRef.current) {
        if (beatType === 'downbeat') {
          audioSystemRef.current.playDownbeat();
        } else {
          audioSystemRef.current.playUpbeat();
        }
      }

      // 調用外部回調
      if (onBeat) {
        onBeat(beatType, beatNumber);
      }
    });
  }, [setBeatCallback, onBeat]);

  // 處理用戶互動以啟動音效上下文
  const handleUserInteraction = async () => {
    if (audioSystemRef.current) {
      await audioSystemRef.current.resumeAudioContext();
    }
  };

  const handleStart = () => {
    handleUserInteraction();
    startMetronome();
  };

  const handleStop = () => {
    stopMetronome();
  };

  const handleBPMChange = (bpm: number) => {
    updateConfig({ bpm: Math.max(60, Math.min(200, bpm)) });
  };

  const handleVolumeChange = (volume: number) => {
    if (audioSystemRef.current) {
      audioSystemRef.current.setVolume(volume);
    }
  };

  return (
    <div className={`rhythm-controller ${className}`}>
      <div className="controller-header">
        <h2>節拍控制器</h2>
        <div className="controller-status">
          <span className={`status-dot ${rhythmState.isPlaying ? 'playing' : 'stopped'}`} />
          {rhythmState.isPlaying ? '節拍器運行中' : '節拍器已停止'}
        </div>
      </div>

      <div className="controller-controls">
        <div className="control-group">
          <label htmlFor="bpm-slider">BPM: {rhythmState.config.bpm}</label>
          <input
            id="bpm-slider"
            type="range"
            min="60"
            max="200"
            value={rhythmState.config.bpm}
            onChange={(e) => handleBPMChange(Number(e.target.value))}
            disabled={rhythmState.isPlaying}
          />
        </div>

        <div className="control-group">
          <label htmlFor="volume-slider">音量</label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.7"
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
          />
        </div>

        <div className="control-buttons">
          <button
            onClick={handleStart}
            disabled={rhythmState.isPlaying}
            className="start-button"
          >
            開始節拍器
          </button>
          <button
            onClick={handleStop}
            disabled={!rhythmState.isPlaying}
            className="stop-button"
          >
            停止節拍器
          </button>
        </div>
      </div>

      <RhythmIndicator
        showBeatNumbers={true}
        showProgress={true}
        className="rhythm-indicator-container"
      />

      <div className="rhythm-info">
        <div className="info-item">
          <span className="info-label">當前節拍:</span>
          <span className="info-value">{rhythmState.currentBeat + 1}</span>
        </div>
        <div className="info-item">
          <span className="info-label">節拍類型:</span>
          <span className="info-value">{rhythmState.isDownbeat ? '正拍' : '負拍'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">進度:</span>
          <span className="info-value">{Math.round(rhythmState.beatProgress * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default RhythmController;
