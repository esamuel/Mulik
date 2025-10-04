import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ref,
  set,
  onDisconnect,
  onValue,
} from 'firebase/database';
import type { Database } from 'firebase/database';
import { getRealtimeDatabaseInstance, isFirebaseAvailable } from '../services/firebase';
import type { PresenceData } from '../types/game.types';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

interface UseMultiplayerOptions {
  roomCode: string | null;
  playerId: string | null;
  enabled?: boolean;
}

interface UseMultiplayerReturn {
  isOnline: boolean;
  presenceData: Record<string, PresenceData>;
  updatePresence: () => Promise<void>;
}

/**
 * Hook for managing multiplayer presence and online status
 * @param options - Configuration options
 * @returns Online status, presence data, and update function
 */
export const useMultiplayer = ({
  roomCode,
  playerId,
  enabled = true,
}: UseMultiplayerOptions): UseMultiplayerReturn => {
  const [isOnline, setIsOnline] = useState(false);
  const [presenceData, setPresenceData] = useState<Record<string, PresenceData>>({});
  const heartbeatIntervalRef = useRef<number | null>(null);
  const dbRef = useRef<Database | null>(null);

  /**
   * Update player's presence
   */
  const updatePresence = useCallback(async () => {
    if (!roomCode || !playerId || !enabled) {
      return;
    }

    if (!isFirebaseAvailable()) {
      console.warn('Firebase not available, skipping presence update');
      return;
    }

    try {
      if (!dbRef.current) {
        dbRef.current = getRealtimeDatabaseInstance();
      }

      const presenceRef = ref(dbRef.current, `presence/${roomCode}/${playerId}`);

      // Set online status
      await set(presenceRef, {
        online: true,
        lastSeen: Date.now(),
      } as PresenceData);

      // Set up automatic offline on disconnect
      const disconnectRef = onDisconnect(presenceRef);
      await disconnectRef.set({
        online: false,
        lastSeen: Date.now(),
      } as PresenceData);

      setIsOnline(true);
    } catch (error) {
      console.error('Failed to update presence:', error);
      setIsOnline(false);
    }
  }, [roomCode, playerId, enabled]);

  /**
   * Set up heartbeat to keep presence alive
   */
  useEffect(() => {
    if (!roomCode || !playerId || !enabled) {
      return;
    }

    if (!isFirebaseAvailable()) {
      console.warn('Firebase not available, skipping heartbeat setup');
      return;
    }

    // Initial presence update
    updatePresence();

    // Set up heartbeat interval
    heartbeatIntervalRef.current = setInterval(() => {
      updatePresence();
    }, HEARTBEAT_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Set offline status when component unmounts
      if (dbRef.current && roomCode && playerId) {
        const presenceRef = ref(dbRef.current, `presence/${roomCode}/${playerId}`);
        set(presenceRef, {
          online: false,
          lastSeen: Date.now(),
        } as PresenceData).catch((error) => {
          console.error('Failed to set offline status:', error);
        });
      }
    };
  }, [roomCode, playerId, enabled, updatePresence]);

  /**
   * Subscribe to presence updates for all players in room
   */
  useEffect(() => {
    if (!roomCode || !enabled) {
      return;
    }

    if (!isFirebaseAvailable()) {
      return;
    }

    try {
      if (!dbRef.current) {
        dbRef.current = getRealtimeDatabaseInstance();
      }

      const roomPresenceRef = ref(dbRef.current, `presence/${roomCode}`);

      // Listen for presence changes
      const unsubscribe = onValue(
        roomPresenceRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val() as Record<string, PresenceData>;
            setPresenceData(data);
          } else {
            setPresenceData({});
          }
        },
        (error) => {
          console.error('Failed to listen to presence:', error);
        }
      );

      // Cleanup listener
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Failed to set up presence listener:', error);
    }
  }, [roomCode, enabled]);

  /**
   * Handle browser tab visibility changes
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible, update presence
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, updatePresence]);

  /**
   * Handle online/offline events
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleOnline = () => {
      console.log('Connection restored');
      updatePresence();
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, updatePresence]);

  return {
    isOnline,
    presenceData,
    updatePresence,
  };
};

export default useMultiplayer;
