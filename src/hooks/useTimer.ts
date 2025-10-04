import { useState, useEffect, useCallback, useRef } from 'react';
import { soundService } from '../services/soundService';

interface UseTimerOptions {
  initialDuration: number;
  syncKey?: string;
  onComplete?: () => void;
  onWarning?: () => void;
  autoStart?: boolean;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  sync: (serverTime: number) => void;
}

export const useTimer = ({
  initialDuration,
  syncKey,
  onComplete,
  onWarning,
  autoStart = false,
}: UseTimerOptions): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null);
  const warningTriggeredRef = useRef(false);
  const lastTickRef = useRef<number | null>(null);

  // Calculate progress percentage
  const progress = (timeLeft / initialDuration) * 100;

  // Clear interval helper
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer
  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setIsPaused(false);
    setStartTime(Date.now());
    warningTriggeredRef.current = false;
    lastTickRef.current = Date.now();

    // TODO: Broadcast to Firebase if syncKey provided
    if (syncKey) {
      console.log(`Timer started with sync key: ${syncKey}`);
    }
  }, [isRunning, syncKey]);

  // Pause timer
  const pause = useCallback(() => {
    if (!isRunning) return;

    setIsRunning(false);
    setIsPaused(true);
    clearTimer();

    // TODO: Broadcast to Firebase if syncKey provided
    if (syncKey) {
      console.log(`Timer paused with sync key: ${syncKey}`);
    }
  }, [isRunning, syncKey, clearTimer]);

  // Resume timer
  const resume = useCallback(() => {
    if (!isPaused) return;

    setIsRunning(true);
    setIsPaused(false);
    setStartTime(Date.now());
    lastTickRef.current = Date.now();

    // TODO: Broadcast to Firebase if syncKey provided
    if (syncKey) {
      console.log(`Timer resumed with sync key: ${syncKey}`);
    }
  }, [isPaused, syncKey]);

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(initialDuration);
    setStartTime(null);
    clearTimer();
    warningTriggeredRef.current = false;
    lastTickRef.current = null;

    // TODO: Broadcast to Firebase if syncKey provided
    if (syncKey) {
      console.log(`Timer reset with sync key: ${syncKey}`);
    }
  }, [initialDuration, syncKey, clearTimer]);

  // Sync with server time
  const sync = useCallback((serverTime: number) => {
    if (!syncKey) return;

    const currentTime = Date.now();
    const timeDiff = serverTime - currentTime;
    
    // Adjust timeLeft based on server time
    if (startTime) {
      const adjustedElapsed = (currentTime + timeDiff - startTime) / 1000;
      const adjustedTimeLeft = Math.max(0, initialDuration - adjustedElapsed);
      setTimeLeft(adjustedTimeLeft);
    }
  }, [syncKey, startTime, initialDuration]);

  // Main timer effect
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      
      if (startTime) {
        const elapsed = (now - startTime) / 1000;
        const newTimeLeft = Math.max(0, initialDuration - elapsed);
        
        setTimeLeft(newTimeLeft);

        // Play tick sound every second
        if (lastTickRef.current && now - lastTickRef.current >= 1000) {
          soundService.play('timer-tick');
          lastTickRef.current = now;
        }

        // Warning at 10 seconds
        if (newTimeLeft <= 10 && newTimeLeft > 0 && !warningTriggeredRef.current) {
          warningTriggeredRef.current = true;
          soundService.play('timer-warning');
          onWarning?.();
        }

        // Timer completed
        if (newTimeLeft <= 0) {
          setIsRunning(false);
          setTimeLeft(0);
          clearTimer();
          soundService.play('timer-end');
          onComplete?.();
        }
      }
    }, 100); // Update every 100ms for smooth animation

    return clearTimer;
  }, [isRunning, startTime, initialDuration, onComplete, onWarning, clearTimer]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    timeLeft,
    isRunning,
    isPaused,
    progress,
    start,
    pause,
    resume,
    reset,
    sync,
  };
};
