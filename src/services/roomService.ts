import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';
import { generateRoomCode } from '../utils/roomCode';
import type { Room, Player, GameSettings, TeamColor } from '../types/game.types';

const ROOMS_COLLECTION = 'rooms';
const ROOM_EXPIRY_HOURS = 24;

/**
 * Initialize default teams structure
 */
const initializeTeams = (): Room['teams'] => {
  const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];
  const teams = {} as Room['teams'];

  teamColors.forEach((color) => {
    teams[color] = {
      color,
      name: color.charAt(0).toUpperCase() + color.slice(1),
      players: [],
      position: 0,
      score: 0,
    };
  });

  return teams;
};

/**
 * Create a new multiplayer room
 * @param hostId - The host player's ID
 * @param hostName - The host player's name
 * @param settings - Game settings
 * @returns The generated room code
 */
export const createRoom = async (
  hostId: string,
  hostName: string,
  settings: GameSettings
): Promise<string> => {
  try {
    const db = getFirestoreInstance();
    const roomCode = generateRoomCode();

    // Create host player
    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      isHost: true,
      isConnected: true,
      isReady: false,
      lastSeen: Date.now(),
    };

    // Create room data
    const roomData: Room = {
      code: roomCode,
      hostId,
      settings,
      players: {
        [hostId]: hostPlayer,
      },
      teams: initializeTeams(),
      gameState: 'lobby',
      currentTurn: null,
      usedCardIds: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    // Save to Firestore
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    await setDoc(roomRef, roomData);

    console.log(`✅ Room created: ${roomCode}`);
    return roomCode;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw new Error('Failed to create room. Please try again.');
  }
};

/**
 * Join an existing room
 * @param roomCode - The room code to join
 * @param player - The player joining
 * @returns The room data
 */
export const joinRoom = async (
  roomCode: string,
  player: Player
): Promise<Room> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    // Check if room exists
    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }

    const roomData = roomSnap.data() as Room;

    // Check if room is in lobby state
    if (roomData.gameState !== 'lobby') {
      throw new Error('Game has already started');
    }

    // Check if room is full
    const currentPlayerCount = Object.keys(roomData.players).length;
    if (currentPlayerCount >= roomData.settings.maxPlayers) {
      throw new Error('Room is full');
    }

    // Check if player is already in room
    if (roomData.players[player.id]) {
      console.log('Player already in room, updating connection status');
      player.isConnected = true;
    }

    // Add player to room
    const updatedPlayers = {
      ...roomData.players,
      [player.id]: {
        ...player,
        isConnected: true,
        lastSeen: Date.now(),
      },
    };

    await updateDoc(roomRef, {
      players: updatedPlayers,
      lastActivity: Date.now(),
    });

    console.log(`✅ Player ${player.name} joined room ${roomCode}`);

    // Return updated room data
    const updatedRoomSnap = await getDoc(roomRef);
    return updatedRoomSnap.data() as Room;
  } catch (error) {
    console.error('Failed to join room:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to join room. Please try again.');
  }
};

/**
 * Leave a room
 * @param roomCode - The room code
 * @param playerId - The player leaving
 */
export const leaveRoom = async (
  roomCode: string,
  playerId: string
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      console.warn('Room not found when leaving');
      return;
    }

    const roomData = roomSnap.data() as Room;
    const { [playerId]: removedPlayer, ...remainingPlayers } = roomData.players;

    // If no players remain, delete the room
    if (Object.keys(remainingPlayers).length === 0) {
      await deleteRoom(roomCode);
      console.log(`✅ Room ${roomCode} deleted (no players remaining)`);
      return;
    }

    // Remove player from their team if assigned
    const updatedTeams = { ...roomData.teams };
    Object.keys(updatedTeams).forEach((teamColor) => {
      const team = updatedTeams[teamColor as TeamColor];
      team.players = team.players.filter((id) => id !== playerId);
    });

    // Transfer host if necessary
    let newHostId = roomData.hostId;
    if (roomData.hostId === playerId) {
      // Assign host to first remaining player
      newHostId = Object.keys(remainingPlayers)[0];
      remainingPlayers[newHostId] = {
        ...remainingPlayers[newHostId],
        isHost: true,
      };
      console.log(`🔄 Host transferred to ${remainingPlayers[newHostId].name}`);
    }

    // Update room
    await updateDoc(roomRef, {
      players: remainingPlayers,
      teams: updatedTeams,
      hostId: newHostId,
      lastActivity: Date.now(),
    });

    console.log(`✅ Player left room ${roomCode}`);
  } catch (error) {
    console.error('Failed to leave room:', error);
    throw new Error('Failed to leave room');
  }
};

/**
 * Update room data
 * @param roomCode - The room code
 * @param updates - Partial room updates
 */
export const updateRoom = async (
  roomCode: string,
  updates: Partial<Room>
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);

    // Add lastActivity to all updates
    const finalUpdates = {
      ...updates,
      lastActivity: Date.now(),
    };

    await updateDoc(roomRef, finalUpdates);
    console.log(`✅ Room ${roomCode} updated`);
  } catch (error) {
    console.error('Failed to update room:', error);
    throw new Error('Failed to update room');
  }
};

/**
 * Get room data
 * @param roomCode - The room code
 * @returns Room data or null if not found
 */
export const getRoomData = async (roomCode: string): Promise<Room | null> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return null;
    }

    return roomSnap.data() as Room;
  } catch (error) {
    console.error('Failed to get room data:', error);
    throw new Error('Failed to fetch room data');
  }
};

/**
 * Delete a room
 * @param roomCode - The room code to delete
 */
export const deleteRoom = async (roomCode: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    await deleteDoc(roomRef);
    console.log(`✅ Room ${roomCode} deleted`);
  } catch (error) {
    console.error('Failed to delete room:', error);
    throw new Error('Failed to delete room');
  }
};

/**
 * Clean up old rooms (older than 24 hours)
 * This should be called periodically or via a Cloud Function
 */
export const cleanupOldRooms = async (): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const expiryTime = Date.now() - (ROOM_EXPIRY_HOURS * 60 * 60 * 1000);

    const roomsRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsRef, where('lastActivity', '<', expiryTime));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);

    console.log(`✅ Cleaned up ${querySnapshot.size} old rooms`);
  } catch (error) {
    console.error('Failed to cleanup old rooms:', error);
  }
};

/**
 * Update player ready status
 * @param roomCode - The room code
 * @param playerId - The player ID
 * @param isReady - Ready status
 */
export const updatePlayerReady = async (
  roomCode: string,
  playerId: string,
  isReady: boolean
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }

    const roomData = roomSnap.data() as Room;
    const updatedPlayers = {
      ...roomData.players,
      [playerId]: {
        ...roomData.players[playerId],
        isReady,
      },
    };

    await updateDoc(roomRef, {
      players: updatedPlayers,
      lastActivity: Date.now(),
    });
  } catch (error) {
    console.error('Failed to update player ready status:', error);
    throw new Error('Failed to update ready status');
  }
};

/**
 * Assign player to team
 * @param roomCode - The room code
 * @param playerId - The player ID
 * @param teamColor - The team color
 */
export const assignPlayerToTeam = async (
  roomCode: string,
  playerId: string,
  teamColor: TeamColor | undefined
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }

    const roomData = roomSnap.data() as Room;

    // Remove player from all teams
    const updatedTeams = { ...roomData.teams };
    Object.keys(updatedTeams).forEach((color) => {
      const team = updatedTeams[color as TeamColor];
      team.players = team.players.filter((id) => id !== playerId);
    });

    // Add to new team if specified
    if (teamColor) {
      updatedTeams[teamColor].players.push(playerId);
    }

    // Update player's team
    const updatedPlayers = {
      ...roomData.players,
      [playerId]: {
        ...roomData.players[playerId],
        team: teamColor,
      },
    };

    await updateDoc(roomRef, {
      teams: updatedTeams,
      players: updatedPlayers,
      lastActivity: Date.now(),
    });

    console.log(`✅ Player assigned to team ${teamColor || 'none'}`);
  } catch (error) {
    console.error('Failed to assign player to team:', error);
    throw new Error('Failed to assign to team');
  }
};

/**
 * Update team score in Firebase
 * @param roomCode - The room code
 * @param teamColor - The team color
 * @param scoreIncrement - Points to add to team score
 */
export const updateTeamScore = async (
  roomCode: string,
  teamColor: TeamColor,
  scoreIncrement: number
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }

    const room = roomSnap.data() as Room;
    const team = room.teams[teamColor];
    
    await updateDoc(roomRef, {
      [`teams.${teamColor}.score`]: team.score + scoreIncrement,
    });

    console.log(`✅ Team ${teamColor} score updated: +${scoreIncrement}`);
  } catch (error) {
    console.error('Failed to update team score:', error);
    throw new Error('Failed to update score');
  }
};

/**
 * Update team position on board
 * @param roomCode - The room code
 * @param teamColor - The team color
 * @param newPosition - New position on board
 */
export const updateTeamPosition = async (
  roomCode: string,
  teamColor: TeamColor,
  newPosition: number
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);

    await updateDoc(roomRef, {
      [`teams.${teamColor}.position`]: newPosition,
    });

    console.log(`✅ Team ${teamColor} moved to position ${newPosition}`);
  } catch (error) {
    console.error('Failed to update team position:', error);
    throw new Error('Failed to update position');
  }
};

/**
 * Start a new turn for a team
 * @param roomCode - The room code
 * @param teamColor - The team whose turn it is
 * @param speakerId - The player who will be speaking
 */
export const startTurn = async (
  roomCode: string,
  teamColor: TeamColor,
  speakerId: string
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);

    await updateDoc(roomRef, {
      currentTurn: {
        team: teamColor,
        speakerId,
        cardsWon: 0,
        cardsPassed: 0,
        penalties: 0,
        startTime: Date.now(),
      },
    });

    console.log(`✅ Turn started for team ${teamColor}, speaker: ${speakerId}`);
  } catch (error) {
    console.error('Failed to start turn:', error);
    throw new Error('Failed to start turn');
  }
};

/**
 * End the current turn and update scores
 * @param roomCode - The room code
 * @param cardsWon - Number of cards guessed correctly
 * @param cardsPassed - Number of cards passed
 * @param penalties - Number of penalties
 */
export const endTurn = async (
  roomCode: string,
  cardsWon: number,
  cardsPassed: number,
  penalties: number
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const roomRef = doc(db, ROOMS_COLLECTION, roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      throw new Error('Room not found');
    }

    const room = roomSnap.data() as Room;
    if (!room.currentTurn) {
      throw new Error('No active turn');
    }

    const { team } = room.currentTurn;
    const currentTeam = room.teams[team];

    // Movement as per rules: cardsWon - penalties (Pass gives 0; Skip is a penalty)
    const movement = (cardsWon || 0) - (penalties || 0);

    // Score increases only by cardsWon
    const newScore = (currentTeam.score || 0) + (cardsWon || 0);

    // Compute new 1..8 word index (fallback from legacy position if not present)
    const legacyMap = (position: number): number => (position === 0 ? 1 : (((position - 1) % 8) + 1));
    const currentWordIndex = (currentTeam as any).wordIndex ?? legacyMap(currentTeam.position || 0);
    const wrappedWordIndex = ((currentWordIndex - 1 + movement) % 8 + 8) % 8 + 1;

    // Keep legacy position updated for compatibility, but non-negative only
    const legacyForward = Math.max(0, movement);
    const newPosition = (currentTeam.position || 0) + legacyForward;

    // Update team stats and clear turn
    await updateDoc(roomRef, {
      [`teams.${team}.score`]: newScore,
      [`teams.${team}.position`]: newPosition,
      [`teams.${team}.wordIndex`]: wrappedWordIndex,
      currentTurn: null,
      lastActivity: Date.now(),
    });

    console.log(`✅ Turn ended for team ${team}. Score: ${newScore}, Position: ${newPosition}, WordIndex: ${wrappedWordIndex}, Movement: ${movement}`);
  } catch (error) {
    console.error('Failed to end turn:', error);
    throw new Error('Failed to end turn');
  }
};

export default {
  createRoom,
  joinRoom,
  leaveRoom,
  updateRoom,
  getRoomData,
  deleteRoom,
  cleanupOldRooms,
  updatePlayerReady,
  assignPlayerToTeam,
  updateTeamScore,
  updateTeamPosition,
  startTurn,
  endTurn,
};
