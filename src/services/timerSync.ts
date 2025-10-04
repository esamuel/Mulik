import { ref, set, onValue, serverTimestamp, off } from 'firebase/database';
import { getRealtimeDatabaseInstance, isFirebaseAvailable } from './firebase';

interface TimerState {
  startTime: number | null;
  duration: number;
  pausedAt: number | null;
  isPaused: boolean;
  hostId: string;
}

interface TimerSyncCallbacks {
  onTimerUpdate?: (state: TimerState) => void;
  onError?: (error: Error) => void;
}

class TimerSyncService {
  private listeners: Map<string, any> = new Map();

  /**
   * Start timer sync for a room
   */
  async startTimer(
    roomCode: string, 
    duration: number, 
    hostId: string
  ): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    try {
      const db = getRealtimeDatabaseInstance();
      const timerRef = ref(db, `games/${roomCode}/timer`);

      const timerState: TimerState = {
        startTime: Date.now(),
        duration,
        pausedAt: null,
        isPaused: false,
        hostId,
      };

      await set(timerRef, timerState);
      console.log(`✅ Timer started for room ${roomCode}`);
    } catch (error) {
      console.error('Failed to start timer:', error);
      throw error;
    }
  }

  /**
   * Pause timer
   */
  async pauseTimer(roomCode: string, hostId: string): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    try {
      const db = getRealtimeDatabaseInstance();
      const timerRef = ref(db, `games/${roomCode}/timer`);

      const updates = {
        pausedAt: Date.now(),
        isPaused: true,
      };

      await set(timerRef, updates);
      console.log(`⏸️ Timer paused for room ${roomCode}`);
    } catch (error) {
      console.error('Failed to pause timer:', error);
      throw error;
    }
  }

  /**
   * Resume timer
   */
  async resumeTimer(
    roomCode: string, 
    hostId: string, 
    remainingTime: number
  ): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    try {
      const db = getRealtimeDatabaseInstance();
      const timerRef = ref(db, `games/${roomCode}/timer`);

      const updates = {
        startTime: Date.now(),
        duration: remainingTime,
        pausedAt: null,
        isPaused: false,
      };

      await set(timerRef, updates);
      console.log(`▶️ Timer resumed for room ${roomCode}`);
    } catch (error) {
      console.error('Failed to resume timer:', error);
      throw error;
    }
  }

  /**
   * Reset timer
   */
  async resetTimer(
    roomCode: string, 
    duration: number, 
    hostId: string
  ): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not available');
    }

    try {
      const db = getRealtimeDatabaseInstance();
      const timerRef = ref(db, `games/${roomCode}/timer`);

      const timerState: TimerState = {
        startTime: null,
        duration,
        pausedAt: null,
        isPaused: false,
        hostId,
      };

      await set(timerRef, timerState);
      console.log(`🔄 Timer reset for room ${roomCode}`);
    } catch (error) {
      console.error('Failed to reset timer:', error);
      throw error;
    }
  }

  /**
   * Subscribe to timer updates
   */
  subscribeToTimer(
    roomCode: string, 
    callbacks: TimerSyncCallbacks
  ): () => void {
    if (!isFirebaseAvailable()) {
      callbacks.onError?.(new Error('Firebase not available'));
      return () => {};
    }

    try {
      const db = getRealtimeDatabaseInstance();
      const timerRef = ref(db, `games/${roomCode}/timer`);

      const unsubscribe = onValue(
        timerRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const timerState = snapshot.val() as TimerState;
            callbacks.onTimerUpdate?.(timerState);
          }
        },
        (error) => {
          console.error('Timer sync error:', error);
          callbacks.onError?.(error as Error);
        }
      );

      // Store listener for cleanup
      this.listeners.set(roomCode, unsubscribe);

      // Return cleanup function
      return () => {
        this.unsubscribeFromTimer(roomCode);
      };
    } catch (error) {
      console.error('Failed to subscribe to timer:', error);
      callbacks.onError?.(error as Error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from timer updates
   */
  unsubscribeFromTimer(roomCode: string): void {
    const listener = this.listeners.get(roomCode);
    if (listener) {
      listener();
      this.listeners.delete(roomCode);
      console.log(`🔌 Unsubscribed from timer for room ${roomCode}`);
    }
  }

  /**
   * Calculate current time left based on server state
   */
  calculateTimeLeft(timerState: TimerState): number {
    if (!timerState.startTime) {
      return timerState.duration;
    }

    if (timerState.isPaused && timerState.pausedAt) {
      const elapsed = (timerState.pausedAt - timerState.startTime) / 1000;
      return Math.max(0, timerState.duration - elapsed);
    }

    const elapsed = (Date.now() - timerState.startTime) / 1000;
    return Math.max(0, timerState.duration - elapsed);
  }

  /**
   * Check if current user is the timer host
   */
  isTimerHost(timerState: TimerState, currentUserId: string): boolean {
    return timerState.hostId === currentUserId;
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe, roomCode) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log('🧹 Timer sync service cleaned up');
  }
}

export const timerSyncService = new TimerSyncService();
export default timerSyncService;
