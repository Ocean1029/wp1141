export interface AudioConfig {
  volume: number;
  enabled: boolean;
}

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private config: AudioConfig;
  private downbeatBuffer: AudioBuffer | null = null;
  private upbeatBuffer: AudioBuffer | null = null;

  constructor(config?: Partial<AudioConfig>) {
    this.config = {
      volume: 0.7,
      enabled: true,
      ...config,
    };
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.createBeatSounds();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private async createBeatSounds(): Promise<void> {
    if (!this.audioContext) return;

    // 創建正拍音效 (較大聲，較低頻)
    this.downbeatBuffer = this.createToneBuffer(800, 0.1, 0.8);
    
    // 創建負拍音效 (較小聲，較高頻)
    this.upbeatBuffer = this.createToneBuffer(1200, 0.05, 0.4);
  }

  private createToneBuffer(frequency: number, duration: number, volume: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // 創建一個簡單的正弦波音調
      data[i] = Math.sin(2 * Math.PI * frequency * t) * volume * Math.exp(-t * 5);
    }

    return buffer;
  }

  public playDownbeat(): void {
    if (!this.config.enabled || !this.audioContext || !this.downbeatBuffer) return;
    this.playSound(this.downbeatBuffer);
  }

  public playUpbeat(): void {
    if (!this.config.enabled || !this.audioContext || !this.upbeatBuffer) return;
    this.playSound(this.upbeatBuffer);
  }

  private playSound(buffer: AudioBuffer): void {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.config.volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public getConfig(): AudioConfig {
    return { ...this.config };
  }

  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}
