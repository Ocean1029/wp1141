import { useState, useEffect, useCallback, useRef } from 'react';
import { RhythmSystem } from '../systems/RhythmSystem';
import type { BeatType, RhythmConfig } from '../systems/RhythmSystem';

export interface RhythmState {
  isPlaying: boolean;
  currentBeat: number;
  beatProgress: number;
  isDownbeat: boolean;
  isUpbeat: boolean;
  config: RhythmConfig;
}

export interface UseRhythmReturn {
  rhythmState: RhythmState;
  startMetronome: () => void;
  stopMetronome: () => void;
  updateConfig: (config: Partial<RhythmConfig>) => void;
  checkInput: (timestamp: number) => { beatType: BeatType; accuracy: 'perfect' | 'hit' | 'miss' };
  onBeat: (callback: (beatType: BeatType, beatNumber: number) => void) => void;
}

export const useRhythm = (initialConfig?: Partial<RhythmConfig>): UseRhythmReturn => {
  const rhythmSystemRef = useRef<RhythmSystem | null>(null);
  const [rhythmState, setRhythmState] = useState<RhythmState>({
    isPlaying: false,
    currentBeat: 0,
    beatProgress: 0,
    isDownbeat: false,
    isUpbeat: false,
    config: {
      bpm: 120,
      timeSignature: [4, 4],
      tolerance: 50,
      ...initialConfig,
    },
  });

  // 初始化節拍系統
  useEffect(() => {
    rhythmSystemRef.current = new RhythmSystem(initialConfig);
    
    // 設置節拍回調
    rhythmSystemRef.current.setBeatCallback((beatType: BeatType, beatNumber: number) => {
      setRhythmState(prev => ({
        ...prev,
        currentBeat: beatNumber,
        isDownbeat: beatType === 'downbeat',
        isUpbeat: beatType === 'upbeat',
      }));
    });

    return () => {
      if (rhythmSystemRef.current) {
        rhythmSystemRef.current.stopMetronome();
      }
    };
  }, [initialConfig]);

  // 更新節拍進度
  useEffect(() => {
    if (!rhythmState.isPlaying || !rhythmSystemRef.current) return;

    const interval = setInterval(() => {
      if (rhythmSystemRef.current) {
        const progress = rhythmSystemRef.current.getBeatProgress();
        setRhythmState(prev => ({
          ...prev,
          beatProgress: progress,
        }));
      }
    }, 16); // 約 60fps

    return () => clearInterval(interval);
  }, [rhythmState.isPlaying]);

  const startMetronome = useCallback(() => {
    if (rhythmSystemRef.current) {
      rhythmSystemRef.current.startMetronome();
      setRhythmState(prev => ({
        ...prev,
        isPlaying: true,
      }));
    }
  }, []);

  const stopMetronome = useCallback(() => {
    if (rhythmSystemRef.current) {
      rhythmSystemRef.current.stopMetronome();
      setRhythmState(prev => ({
        ...prev,
        isPlaying: false,
        currentBeat: 0,
        beatProgress: 0,
      }));
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<RhythmConfig>) => {
    if (rhythmSystemRef.current) {
      rhythmSystemRef.current.updateConfig(newConfig);
      setRhythmState(prev => ({
        ...prev,
        config: { ...prev.config, ...newConfig },
      }));
    }
  }, []);

  const checkInput = useCallback((timestamp: number) => {
    if (!rhythmSystemRef.current) {
      return { beatType: 'downbeat' as BeatType, accuracy: 'miss' as const };
    }

    const beat = rhythmSystemRef.current.checkBeatHit(timestamp);
    const beatType: BeatType = rhythmSystemRef.current.isDownbeat() ? 'downbeat' : 'upbeat';
    
    return {
      beatType,
      accuracy: beat.type,
    };
  }, []);

  const onBeat = useCallback((callback: (beatType: BeatType, beatNumber: number) => void) => {
    if (rhythmSystemRef.current) {
      rhythmSystemRef.current.setBeatCallback(callback);
    }
  }, []);

  return {
    rhythmState,
    startMetronome,
    stopMetronome,
    updateConfig,
    checkInput,
    onBeat,
  };
};
