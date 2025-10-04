import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseAvailable } from '../services/firebase';
import {
  updateRoom,
  updatePlayerReady,
  assignPlayerToTeam,
} from '../services/roomService';
import { useGameStore } from '../stores/gameStore';
import type { Room, GameSettings, TeamColor } from '../types/game.types';

interface UseRoomReturn {
  room: Room | null;
  loading: boolean;
  error: Error | null;
  updateRoomSettings: (settings: Partial<GameSettings>) => Promise<void>;
  assignTeam: (playerId: string, team: TeamColor | undefined) => Promise<void>;
  toggleReady: (playerId: string) => Promise<void>;
  startGame: () => Promise<void>;
}

/**
 * Hook for real-time room synchronization
 * @param roomCode - The room code to subscribe to
 * @returns Room data, loading state, error, and update functions
 */
export const useRoom = (roomCode: string | null): UseRoomReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get game store actions
  const { updateSettings } = useGameStore();

  /**
   * Update room settings (host only)
   */
  const updateRoomSettings = useCallback(
    async (settings: Partial<GameSettings>) => {
      if (!roomCode) {
        throw new Error('No room code provided');
      }

      if (!room) {
        throw new Error('Room not loaded');
      }

      // Check if current user is host
      // TODO: Get current user ID from auth context
      // For now, we'll allow the update
      
      try {
        await updateRoom(roomCode, {
          settings: {
            ...room.settings,
            ...settings,
          },
        });
      } catch (err) {
        console.error('Failed to update room settings:', err);
        throw err;
      }
    },
    [roomCode, room]
  );

  /**
   * Assign player to team
   */
  const assignTeam = useCallback(
    async (playerId: string, team: TeamColor | undefined) => {
      if (!roomCode) {
        throw new Error('No room code provided');
      }

      try {
        await assignPlayerToTeam(roomCode, playerId, team);
      } catch (err) {
        console.error('Failed to assign team:', err);
        throw err;
      }
    },
    [roomCode]
  );

  /**
   * Toggle player ready status
   */
  const toggleReady = useCallback(
    async (playerId: string) => {
      if (!roomCode) {
        throw new Error('No room code provided');
      }

      if (!room) {
        throw new Error('Room not loaded');
      }

      const currentStatus = room.players[playerId]?.isReady || false;

      try {
        await updatePlayerReady(roomCode, playerId, !currentStatus);
      } catch (err) {
        console.error('Failed to toggle ready:', err);
        throw err;
      }
    },
    [roomCode, room]
  );

  /**
   * Start the game (host only)
   */
  const startGame = useCallback(async () => {
    if (!roomCode) {
      throw new Error('No room code provided');
    }

    if (!room) {
      throw new Error('Room not loaded');
    }

    // Check if all players are ready (skip in debug mode)
    const skipReadyCheck = import.meta.env.VITE_SKIP_READY_CHECK === 'true';
    const allReady = Object.values(room.players).every(
      (player) => player.isReady || player.isHost
    );

    if (!skipReadyCheck && !allReady) {
      throw new Error('Not all players are ready');
    }

    // Check if teams are balanced
    const teamsWithPlayers = Object.values(room.teams).filter(
      (team) => team.players.length > 0
    );

    if (teamsWithPlayers.length < 2) {
      throw new Error('Need at least 2 teams to start');
    }

    try {
      await updateRoom(roomCode, {
        gameState: 'playing',
      });
    } catch (err) {
      console.error('Failed to start game:', err);
      throw err;
    }
  }, [roomCode, room]);

  /**
   * Subscribe to room updates
   */
  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      setRoom(null);
      return;
    }

    // Check if Firebase is available
    if (!isFirebaseAvailable()) {
      setError(new Error('Firebase is not configured. Running in offline mode.'));
      setLoading(false);
      return;
    }

    let unsubscribe: Unsubscribe | undefined;

    const subscribeToRoom = async () => {
      try {
        const db = getFirestoreInstance();
        const roomRef = doc(db, 'rooms', roomCode);

        // Set up real-time listener
        unsubscribe = onSnapshot(
          roomRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const roomData = snapshot.data() as Room;
              setRoom(roomData);
              setError(null);

              // Sync with game store
              if (roomData.settings) {
                updateSettings(roomData.settings);
              }

              // TODO: Sync players with store
              // This would require comparing current players with new players
              // and calling addPlayer/removePlayer accordingly

            } else {
              setRoom(null);
              setError(new Error('Room not found'));
            }
            setLoading(false);
          },
          (err) => {
            console.error('Room snapshot error:', err);
            setError(err as Error);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to subscribe to room:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    subscribeToRoom();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [roomCode, updateSettings]);

  return {
    room,
    loading,
    error,
    updateRoomSettings,
    assignTeam,
    toggleReady,
    startGame,
  };
};

export default useRoom;
