import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { SongConfig, MusicState, MusicManager } from '../types/music'
import { SONG_CONFIGS, getSongById, DEFAULT_SONG_ID } from '../types/music'

export const useMusicManager = (initialSongId?: string): MusicManager => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSongRef = useRef<SongConfig | null>(null)
  const isPlayingRef = useRef<boolean>(false)

  // 初始化歌曲
  const initialSong =
    initialSongId ? getSongById(initialSongId) || null : getSongById(DEFAULT_SONG_ID) || SONG_CONFIGS[0] || null

  const [state, setState] = useState<MusicState>({
    currentSong: initialSong,
    isPlaying: false,
    volume: 0.5,
    currentTime: 0,
    duration: 0,
  })

  useEffect(() => {
    currentSongRef.current = initialSong
  }, [initialSong])

  // 初始化 audio element
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.loop = true
      audio.volume = 0.5
      audio.preload = 'auto'
      audioRef.current = audio

      // event listeners
      const handleTimeUpdate = () => {
        setState(prev => {
          if (
            prev.currentTime === audio.currentTime &&
            prev.duration === (audio.duration || 0)
          ) {
            return prev
          }
          return {
            ...prev,
            currentTime: audio.currentTime,
            duration: audio.duration || 0,
          }
        })
      }
      

      const handleLoadedMetadata = () => {
        setState((prev) => ({
          ...prev,
          duration: audio.duration || 0,
        }))
      }

      const handlePlay = () => {
        isPlayingRef.current = true
        setState((prev) => ({ ...prev, isPlaying: true }))
      }

      const handlePause = () => {
        isPlayingRef.current = false
        setState((prev) => ({ ...prev, isPlaying: false }))
      }

      const handleEnded = () => {
        isPlayingRef.current = false
        setState((prev) => ({ ...prev, isPlaying: false }))
      }

      const handleError = (error: Event) => {
        console.error('Audio error:', error)
        isPlayingRef.current = false
        setState((prev) => ({ ...prev, isPlaying: false }))
      }

      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      // 預先載入初始歌曲
      if (initialSong) {
        audio.src = initialSong.filePath
        audio.load()
      }

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
        audio.pause()
        audio.src = ''
        audioRef.current = null 
      }
    }
  }, [initialSong])

  const play = useCallback(async (songId?: string) => {
    if (!audioRef.current) return

    try {
      if (songId && songId !== currentSongRef.current?.id) {
        const newSong = getSongById(songId)
        if (newSong) {
          currentSongRef.current = newSong
          audioRef.current.src = newSong.filePath
          audioRef.current.load()
          setState((prev) => ({ ...prev, currentSong: newSong }))
          await audioRef.current.play()
        }
      } else {
        if (audioRef.current.paused) {
          await audioRef.current.play()
        }
      }
    } catch (error) {
      console.error('Failed to play music:', error)
      setState((prev) => ({ ...prev, isPlaying: false }))
    }
  }, [])

  // 暫停
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  // 停止
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    isPlayingRef.current = false
    setState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  // 設定音量
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }
    setState((prev) => ({ ...prev, volume: clampedVolume }))
  }, [])

  // 切換歌曲
  const setCurrentSong = useCallback((songId: string) => {
    const song = getSongById(songId)
    if (song && audioRef.current) {
      currentSongRef.current = song
      audioRef.current.src = song.filePath
      audioRef.current.load()
      setState((prev) => ({ ...prev, currentSong: song, isPlaying: false })) // 🔑 換歌後先視為未播放
    } else if (song) {
      currentSongRef.current = song
      setState((prev) => ({ ...prev, currentSong: song, isPlaying: false }))
    } else {
      console.warn(`Song with ID "${songId}" not found`)
    }
  }, [])

  // 取得目前 BPM
  const getCurrentBpm = useCallback((): number => {
    return currentSongRef.current?.bpm || 120
  }, [])

  // 取得目前歌曲
  const getCurrentSong = useCallback((): SongConfig | null => {
    return currentSongRef.current
  }, [])

  return useMemo(() => ({
    state,
    play,
    pause,
    stop,
    setVolume,
    setCurrentSong,
    getCurrentBpm,
    getCurrentSong,
  }), [state, play, pause, stop, setVolume, setCurrentSong, getCurrentBpm, getCurrentSong])
}
