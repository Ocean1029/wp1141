/**
 * Song configuration type
 * Defines the structure for each song in the game
 */
export type SongConfig = {
  id: string;
  name: string;
  filePath: string;
  bpm: number;
  duration?: number; // in seconds, optional for looped songs
  difficulty?: 'easy' | 'medium' | 'hard';
  genre?: string;
};

/**
 * Music state type
 * Represents the current state of music playback
 */
export type MusicState = {
  currentSong: SongConfig | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
};

/**
 * Music manager type
 * Defines the methods available for music control
 */
export type MusicManager = {
  state: MusicState;
  play: (songId?: string) => Promise<void>;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setCurrentSong: (songId: string) => void;
  getCurrentBpm: () => number;
  getCurrentSong: () => SongConfig | null;
};

// Re-export song configurations and utilities from the centralized config file
export {
  SONG_CONFIGS,
  DEFAULT_SONG_ID,
  getSongById,
  getAllSongs,
  getSongsByDifficulty,
  getSongsByGenre,
  getSongsByBpmRange,
  getRandomSong,
  getSongsSortedByBpm,
  getSongsSortedByDifficulty
} from '../config/songs';