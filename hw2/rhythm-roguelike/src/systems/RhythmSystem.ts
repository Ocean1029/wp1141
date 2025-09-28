export interface Beat {
  timestamp: number;
  type: 'hit' | 'miss' | 'perfect';
}

export interface RhythmPattern {
  beats: number[];
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface RhythmConfig {
  bpm: number;
  timeSignature: [number, number]; // [beats per measure, note value]
  tolerance: number; // milliseconds
}

export type BeatType = 'downbeat' | 'upbeat';

export class RhythmSystem {
  private patterns: RhythmPattern[] = [];
  private currentPattern: RhythmPattern | null = null;
  private startTime: number = 0;
  private config: RhythmConfig;
  private isPlaying: boolean = false;
  private beatInterval: number | null = null;
  private onBeatCallback: ((beatType: BeatType, beatNumber: number) => void) | null = null;
  private currentBeat: number = 0;

  constructor(config?: Partial<RhythmConfig>) {
    this.config = {
      bpm: 120,
      timeSignature: [4, 4],
      tolerance: 50, // 50ms tolerance for input
      ...config,
    };
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // 簡單節拍模式
    this.patterns.push({
      beats: [0, 500, 1000, 1500],
      duration: 2000,
      difficulty: 'easy',
    });

    // 中等節拍模式
    this.patterns.push({
      beats: [0, 250, 500, 750, 1000, 1250, 1500, 1750],
      duration: 2000,
      difficulty: 'medium',
    });

    // 困難節拍模式
    this.patterns.push({
      beats: [
        0, 125, 250, 375, 500, 625, 750, 875, 1000, 1125, 1250, 1375, 1500,
        1625, 1750, 1875,
      ],
      duration: 2000,
      difficulty: 'hard',
    });
  }

  public getRandomPattern(
    difficulty: 'easy' | 'medium' | 'hard'
  ): RhythmPattern {
    const availablePatterns = this.patterns.filter(
      p => p.difficulty === difficulty
    );
    const randomIndex = Math.floor(Math.random() * availablePatterns.length);
    return availablePatterns[randomIndex];
  }

  public startPattern(pattern: RhythmPattern): void {
    this.currentPattern = pattern;
    this.startTime = Date.now();
  }

  public checkBeatHit(timestamp: number, tolerance: number = 100): Beat {
    if (!this.currentPattern) {
      return { timestamp, type: 'miss' };
    }

    const relativeTime = timestamp - this.startTime;
    const closestBeat = this.findClosestBeat(relativeTime);

    if (closestBeat === null) {
      return { timestamp, type: 'miss' };
    }

    const timeDiff = Math.abs(relativeTime - closestBeat);

    if (timeDiff <= tolerance / 2) {
      return { timestamp, type: 'perfect' };
    } else if (timeDiff <= tolerance) {
      return { timestamp, type: 'hit' };
    } else {
      return { timestamp, type: 'miss' };
    }
  }

  private findClosestBeat(relativeTime: number): number | null {
    if (!this.currentPattern) return null;

    let closestBeat: number | null = null;
    let minDiff = Infinity;

    for (const beat of this.currentPattern.beats) {
      const diff = Math.abs(relativeTime - beat);
      if (diff < minDiff) {
        minDiff = diff;
        closestBeat = beat;
      }
    }

    return closestBeat;
  }

  public getCurrentPattern(): RhythmPattern | null {
    return this.currentPattern;
  }

  public isPatternComplete(): boolean {
    if (!this.currentPattern) return true;
    return Date.now() - this.startTime >= this.currentPattern.duration;
  }

  // 節拍器功能
  public startMetronome(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentBeat = 0;
    this.startTime = Date.now();
    
    const beatInterval = 60000 / this.config.bpm; // milliseconds per beat
    
    this.beatInterval = setInterval(() => {
      if (!this.isPlaying) return;
      
      const beatNumber = this.currentBeat % this.config.timeSignature[0];
      const beatType: BeatType = beatNumber === 0 ? 'downbeat' : 'upbeat';
      
      if (this.onBeatCallback) {
        this.onBeatCallback(beatType, beatNumber);
      }
      
      this.currentBeat++;
    }, beatInterval);
  }

  public stopMetronome(): void {
    this.isPlaying = false;
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  public setBeatCallback(callback: (beatType: BeatType, beatNumber: number) => void): void {
    this.onBeatCallback = callback;
  }

  public getCurrentBeat(): number {
    return this.currentBeat;
  }

  public getBeatProgress(): number {
    if (!this.isPlaying) return 0;
    const beatInterval = 60000 / this.config.bpm;
    const elapsed = Date.now() - this.startTime;
    return (elapsed % beatInterval) / beatInterval;
  }

  public isDownbeat(): boolean {
    return this.currentBeat % this.config.timeSignature[0] === 0;
  }

  public isUpbeat(): boolean {
    return !this.isDownbeat();
  }

  public getConfig(): RhythmConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<RhythmConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
