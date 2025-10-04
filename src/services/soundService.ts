import { Howl, Howler } from 'howler';

interface SoundMap {
  [key: string]: Howl;
}

class SoundService {
  private sounds: SoundMap = {};
  private isInitialized = false;
  private isMutedState = false;
  private volume = 1;

  private soundFiles = {
    'timer-tick': '/sounds/timer-tick.mp3',
    'timer-warning': '/sounds/timer-warning.mp3',
    'timer-end': '/sounds/timer-end.mp3',
    'correct-answer': '/sounds/correct-answer.mp3',
    'wrong-answer': '/sounds/wrong-answer.mp3',
    'move-pawn': '/sounds/move-pawn.mp3',
  };

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const loadPromises = Object.entries(this.soundFiles).map(([name, src]) => {
        return new Promise<void>((resolve, reject) => {
          const sound = new Howl({
            src: [src],
            volume: this.volume,
            onload: () => resolve(),
            onloaderror: () => {
              console.warn(`Failed to load sound: ${name}`);
              resolve(); // Continue even if sound fails to load
            },
          });
          this.sounds[name] = sound;
        });
      });

      await Promise.all(loadPromises);
      this.isInitialized = true;
      console.log('✅ Sound service initialized');
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
    }
  }

  play(soundName: string): void {
    if (!this.isInitialized || this.isMutedState) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.play();
    } else {
      console.warn(`Sound not found: ${soundName}`);
    }
  }

  stop(soundName: string): void {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.stop();
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.volume);
  }

  mute(): void {
    this.isMutedState = true;
    Howler.mute(true);
  }

  unmute(): void {
    this.isMutedState = false;
    Howler.mute(false);
  }

  isMuted(): boolean {
    return this.isMutedState;
  }
}

export const soundService = new SoundService();
export default soundService;
