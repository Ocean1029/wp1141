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

const GameScreen: React.FC<GameScreenProps> = ({ onPause }) => {
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

  // Handle pause button click
  const handlePause = () => {
    musicManager.pause();
    onPause();
  };

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
      <div className="game-ui">
        <div className="game-controls">
         
          <Button 
            onClick={() => setShowSongSelector(!showSongSelector)} 
            variant="secondary"
          >
            選擇歌曲
          </Button>
        </div>
        
        {/* Music info display */}
        <div className="music-info">
          <div className="current-song">
            {currentSong?.name || 'No Song'}
          </div>
          <div className="bpm-display">
            BPM: {currentBpm}
          </div>
        </div>
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
            <Button 
              onClick={() => setShowSongSelector(false)}
              variant="secondary"
              className="close-button"
            >
              關閉
            </Button>
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
