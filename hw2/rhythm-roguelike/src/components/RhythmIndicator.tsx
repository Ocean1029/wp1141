import React from 'react';
import { useRhythm } from '../hooks/useRhythm';

interface RhythmIndicatorProps {
  className?: string;
  showBeatNumbers?: boolean;
  showProgress?: boolean;
}

const RhythmIndicator: React.FC<RhythmIndicatorProps> = ({
  className = '',
  showBeatNumbers = true,
  showProgress = true,
}) => {
  const { rhythmState } = useRhythm();

  const getBeatColor = (beatNumber: number): string => {
    if (beatNumber === 0) return '#ff6b6b'; // 紅色 - 正拍
    return '#4ecdc4'; // 青色 - 負拍
  };

  const getBeatSize = (beatNumber: number): string => {
    if (beatNumber === 0) return '20px'; // 正拍較大
    return '16px'; // 負拍較小
  };

  return (
    <div className={`rhythm-indicator ${className}`}>
      <div className="rhythm-header">
        <h3>節拍器</h3>
        <div className="bpm-display">
          {rhythmState.config.bpm} BPM
        </div>
        <div className="time-signature">
          {rhythmState.config.timeSignature[0]}/{rhythmState.config.timeSignature[1]}
        </div>
      </div>

      <div className="beat-display">
        {showBeatNumbers && (
          <div className="beat-numbers">
            {Array.from({ length: rhythmState.config.timeSignature[0] }, (_, i) => (
              <div
                key={i}
                className={`beat-number ${i === rhythmState.currentBeat % rhythmState.config.timeSignature[0] ? 'active' : ''}`}
                style={{
                  color: getBeatColor(i),
                  fontSize: getBeatSize(i),
                  fontWeight: i === 0 ? 'bold' : 'normal',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {showProgress && (
          <div className="beat-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${rhythmState.beatProgress * 100}%`,
                  backgroundColor: rhythmState.isDownbeat ? '#ff6b6b' : '#4ecdc4',
                }}
              />
            </div>
            <div className="beat-type">
              {rhythmState.isDownbeat ? '正拍' : '負拍'}
            </div>
          </div>
        )}

        <div className="rhythm-status">
          <div className={`status-indicator ${rhythmState.isPlaying ? 'playing' : 'stopped'}`}>
            {rhythmState.isPlaying ? '播放中' : '已停止'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RhythmIndicator;
