import React from 'react';
import Button from './Button';
import { getAllSongs } from '../../types/music';
import './SongSelector.css';

interface SongSelectorProps {
  currentSongId: string;
  onSongChange: (songId: string) => void;
  className?: string;
}

/**
 * Song Selector Component
 * Allows players to switch between different songs
 */
const SongSelector: React.FC<SongSelectorProps> = ({
  currentSongId,
  onSongChange,
  className = ''
}) => {
  const songs = getAllSongs();

  return (
    <div className={`song-selector ${className}`}>
      <h3 className="selector-title">Select Song</h3>
      <div className="song-list">
        {songs.map(song => (
          <Button
            key={song.id}
            variant={song.id === currentSongId ? 'primary' : 'secondary'}
            size="small"
            onClick={() => onSongChange(song.id)}
            className={`song-button ${song.id === currentSongId ? 'active' : ''}`}
          >
            <div className="song-info">
              <div className="song-name">{song.name}</div>
              <div className="song-details">
                {song.bpm} BPM • {song.difficulty} • {song.genre}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SongSelector;
