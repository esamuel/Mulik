export type GameState = 'lobby' | 'playing' | 'paused' | 'finished';

export type TeamColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  isReady: boolean;
  team?: TeamColor;
  lastSeen?: number; // Timestamp for presence system
}

export interface Team {
  color: TeamColor;
  name: string;
  players: string[]; // Player IDs
  position: number; // legacy board position (spiral) - not used for word selection
  wordIndex?: number; // 1..8 index indicating which word to use on cards
  score: number;
  // Last turn summary (for UI display on team cards)
  lastMovement?: number; // positive or negative movement applied at end of last turn
  lastCardsWon?: number;
  lastPassed?: number;
  lastPenalties?: number;
  lastUpdated?: number; // timestamp when last turn finished
}

export type Category = 'general' | 'movies' | 'places' | 'food' | 'animals' | 'technology';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Card {
  id: string;
  category?: Category; // Optional, for filtering/organization
  difficulty?: Difficulty; // Optional, for filtering
  words: string[]; // 8 words per card - the words to explain
}

export interface CurrentTurn {
  team: TeamColor;
  speakerId: string;
  timeRemaining: number;
  cardsWon: number;
  cardsPassed: number;
  penalties: number;
}

export interface GameSettings {
  maxPlayers: number;
  turnDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  language: Language;
  boardSize: number;
  teamsCount: number;
}

export interface SpaceConfig {
  type: 'normal' | 'bonus' | 'lightning' | 'switch' | 'steal';
  position: number;
  effect: string;
  x: number;
  y: number;
}

export interface Settings {
  language: Language;
  theme: 'modern' | 'cartoon' | 'dark' | 'high-contrast' | 'colorblind';
  timerDuration: 30 | 60 | 90 | 120;
  turnMode: 'auto' | 'manual';
  soundEnabled: boolean;
  // UI variant for timer visualization
  timerStyle?: 'ring' | 'sandglass';
  cardDifficulty?: 'easy' | 'mixed' | 'hard';
  targetScore?: 50 | 100 | 150;
  volume?: number; // 0..1
}

export interface GameAction {
  type: 'CREATE_GAME' | 'JOIN_GAME' | 'START_GAME' | 'END_GAME' | 'UPDATE_SCORE';
  payload: any;
}

export type Language = 'en' | 'he';

export interface NavigationProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

/**
 * Room structure for Firebase multiplayer rooms
 */
export interface Room {
  code: string;
  hostId: string;
  settings: GameSettings;
  players: { [playerId: string]: Player };
  teams: {
    red: Team;
    blue: Team;
    green: Team;
    yellow: Team;
  };
  gameState: GameState;
  currentTurn: CurrentTurn | null;
  usedCardIds: string[];
  createdAt: number; // Timestamp
  lastActivity: number; // Timestamp
}

/**
 * Presence data for real-time player status
 */
export interface PresenceData {
  online: boolean;
  lastSeen: number; // Timestamp
}
