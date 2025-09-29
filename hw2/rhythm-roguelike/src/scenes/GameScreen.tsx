import React, { useEffect, useRef, useState } from 'react';
import Button from '../components/ui/Button';
import RhythmBarManager from '../components/game/RhythmBarManager';
import CenterCircle from '../components/game/CenterCircle';
import SongSelector from '../components/ui/SongSelector';
import { useMusicManager } from '../hooks/useMusicManager';
import './GameScreen.css';

interface GameScreenProps {
  onPause: () => void;
  onGameOver: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ onPause: _ }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSongSelector, setShowSongSelector] = useState(false);
  
  // Initialize music manager with default song
  const musicManager = useMusicManager(); // Will use DEFAULT_SONG_ID from config
  
  // Start music when component mounts (only once)
  useEffect(() => {
    musicManager.play();
    
    return () => {
      musicManager.stop();
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle song change
  const handleSongChange = (songId: string) => {
    musicManager.setCurrentSong(songId);
    musicManager.play(songId);
    setShowSongSelector(false);
  };

  // Get current BPM from music manager
  const currentBpm = musicManager.getCurrentBpm();
  const isPlaying = musicManager.state.isPlaying;
  const currentSong = musicManager.getCurrentSong();

  // Handle rhythm bar completion - pure visual effect
  const handleBarComplete = (_barId: string) => {
    // Rhythm bar completion, pure visual effect
  };

  // Handle rhythm bar update - pure visual effect
  const handleBarUpdate = (_barId: string, _progress: number) => {
    // Additional visual effects can be added here
  };

  return (
    <div className="game-screen">
      {/* Fixed top bar with music info */}
      <div className="top-bar">
        <div className="music-info">
          <div className="current-song">
            {currentSong?.name || 'No Song'}
          </div>
          <div className="bpm-display">
            BPM: {currentBpm}
          </div>
        </div>
      </div>

      {/* Fixed song selector button in top right */}
      <div className="song-selector-button">
        <Button 
          onClick={() => setShowSongSelector(!showSongSelector)} 
          variant="secondary"
          size="small"
        >
          選擇歌曲
        </Button>
      </div>

      {/* Song Selector Modal */}
      {showSongSelector && (
        <div className="song-selector-modal">
          <div className="modal-backdrop" onClick={() => setShowSongSelector(false)} />
          <div className="modal-content">
            <SongSelector
              currentSongId={currentSong?.id || ''}
              onSongChange={handleSongChange}
            />
          </div>
        </div>
      )}

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
