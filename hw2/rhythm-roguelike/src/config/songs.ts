import type { SongConfig } from '../types/music'

/**
 * All available songs in the game
 * Each song includes metadata like BPM, difficulty, and genre
 * 
 * To add a new song:
 * 1. Add the music file to /src/assets/music/
 * 2. Add the song configuration here
 * 3. The song will automatically appear in the song selector
 */
export const SONG_CONFIGS: SongConfig[] = [
  {
    id: 'beating',
    name: 'Beating',
    filePath: '/src/assets/music/beating.mp3',
    bpm: 120,
    difficulty: 'medium',
    genre: 'Electronic'
  },
  {
    id: 'blue',
    name: 'Blue',
    filePath: '/src/assets/music/blue.mp3',
    bpm: 110,
    difficulty: 'easy',
    genre: 'Ambient'
  },
  {
    id: 'can-we-do-it',
    name: 'Can We Do It',
    filePath: '/src/assets/music/can-we-do-it.mp3',
    bpm: 128,
    difficulty: 'hard',
    genre: 'Hip Hop'
  },
  {
    id: 'edm',
    name: 'EDM',
    filePath: '/src/assets/music/EDM.mp3',
    bpm: 130,
    difficulty: 'hard',
    genre: 'Electronic'
  },
  {
    id: 'embrace',
    name: 'Embrace',
    filePath: '/src/assets/music/embrace.mp3',
    bpm: 95,
    difficulty: 'easy',
    genre: 'Ambient'
  },
  {
    id: 'jungle-waves',
    name: 'Jungle Waves',
    filePath: '/src/assets/music/jungle-waves.mp3',
    bpm: 115,
    difficulty: 'medium',
    genre: 'World'
  },
  {
    id: 'sandbreaker',
    name: 'Sandbreaker',
    filePath: '/src/assets/music/sandbreaker.mp3',
    bpm: 140,
    difficulty: 'hard',
    genre: 'Rock'
  },
  {
    id: 'soft-music',
    name: 'Soft Music',
    filePath: '/src/assets/music/soft-music.mp3',
    bpm: 85,
    difficulty: 'easy',
    genre: 'Chill'
  }
]

/**
 * Default song ID (first song to play when game starts)
 */
export const DEFAULT_SONG_ID = 'beating'

/**
 * Get song configuration by ID
 */
export const getSongById = (songId: string): SongConfig | undefined => {
  return SONG_CONFIGS.find(song => song.id === songId)
}

/**
 * Get all available songs
 */
export const getAllSongs = (): SongConfig[] => {
  return [...SONG_CONFIGS]
}

/**
 * Get songs by difficulty
 */
export const getSongsByDifficulty = (difficulty: SongConfig['difficulty']): SongConfig[] => {
  return SONG_CONFIGS.filter(song => song.difficulty === difficulty)
}

/**
 * Get songs by genre
 */
export const getSongsByGenre = (genre: string): SongConfig[] => {
  return SONG_CONFIGS.filter(song => song.genre === genre)
}

/**
 * Get songs with BPM in a specific range
 */
export const getSongsByBpmRange = (minBpm: number, maxBpm: number): SongConfig[] => {
  return SONG_CONFIGS.filter(song => song.bpm >= minBpm && song.bpm <= maxBpm)
}

/**
 * Get random song
 */
export const getRandomSong = (): SongConfig => {
  const randomIndex = Math.floor(Math.random() * SONG_CONFIGS.length)
  return SONG_CONFIGS[randomIndex]
}

/**
 * Get songs sorted by BPM (ascending)
 */
export const getSongsSortedByBpm = (): SongConfig[] => {
  return [...SONG_CONFIGS].sort((a, b) => a.bpm - b.bpm)
}

/**
 * Get songs sorted by difficulty
 */
export const getSongsSortedByDifficulty = (): SongConfig[] => {
  const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 }
  return [...SONG_CONFIGS].sort((a, b) => {
    const aOrder = difficultyOrder[a.difficulty || 'medium']
    const bOrder = difficultyOrder[b.difficulty || 'medium']
    return aOrder - bOrder
  })
}
