import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { 
  GameState, 
  TeamColor, 
  Team, 
  Player, 
  CurrentTurn, 
  GameSettings, 
  Card 
} from '../types/game.types';
import { 
  calculateMovement, 
  getNextSpeaker, 
  getNextTeam, 
  checkWinCondition,
  validateTeams 
} from '../services/gameLogic';

interface GameStore {
  // State
  roomCode: string | null;
  gameState: GameState;
  teams: Record<TeamColor, Team>;
  players: Record<string, Player>;
  currentTurn: CurrentTurn | null;
  settings: GameSettings;
  usedCardIds: string[];
  currentCard: Card | null;
  boardSize: number;

  // Actions
  initializeRoom: (roomCode: string, hostId: string) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  assignPlayerToTeam: (playerId: string, team: TeamColor) => void;
  togglePlayerReady: (playerId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: (winningTeam: TeamColor) => void;
  startTurn: (team: TeamColor, speakerId: string) => void;
  endTurn: () => void;
  nextTurn: () => void;
  drawCard: () => Card;
  markCardCorrect: () => void;
  markCardPassed: () => void;
  markPenalty: () => void;
  updateTimer: (timeRemaining: number) => void;
  moveTeam: (team: TeamColor, spaces: number) => void;
  resetGame: () => void;
}

// Default settings
const DEFAULT_SETTINGS: GameSettings = {
  maxPlayers: 12,
  turnDuration: 60,
  difficulty: 'medium',
  language: 'he',
  boardSize: 50,
  teamsCount: 2,
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // Initial State
    roomCode: null,
    gameState: 'lobby',
    teams: {
      red: { color: 'red', name: 'Red Team', players: [], position: 0, wordIndex: 1, score: 0 },
      blue: { color: 'blue', name: 'Blue Team', players: [], position: 0, wordIndex: 1, score: 0 },
      green: { color: 'green', name: 'Green Team', players: [], position: 0, wordIndex: 1, score: 0 },
      yellow: { color: 'yellow', name: 'Yellow Team', players: [], position: 0, wordIndex: 1, score: 0 },
    },
    players: {},
    currentTurn: null,
    settings: DEFAULT_SETTINGS,
    usedCardIds: [],
    currentCard: null,
    boardSize: DEFAULT_SETTINGS.boardSize,

    // Actions
    
    /**
     * Initializes a new game room with a room code and host player
     */
    initializeRoom: (roomCode: string, _hostId: string) => {
      set((state) => {
        state.roomCode = roomCode;
        state.gameState = 'lobby';
        // Reset all game state
        state.teams = {
          red: { color: 'red', name: 'Red Team', players: [], position: 0, wordIndex: 1, score: 0 },
          blue: { color: 'blue', name: 'Blue Team', players: [], position: 0, wordIndex: 1, score: 0 },
          green: { color: 'green', name: 'Green Team', players: [], position: 0, wordIndex: 1, score: 0 },
          yellow: { color: 'yellow', name: 'Yellow Team', players: [], position: 0, wordIndex: 1, score: 0 },
        };
        state.players = {};
        state.currentTurn = null;
        state.usedCardIds = [];
        state.currentCard = null;
      });
    },

    /**
     * Adds a new player to the game
     */
    addPlayer: (player: Player) => {
      set((state) => {
        state.players[player.id] = player;
      });
    },

    /**
     * Removes a player from the game and their team
     */
    removePlayer: (playerId: string) => {
      set((state) => {
        const player = state.players[playerId];
        if (player && player.team) {
          // Remove from team
          const team = state.teams[player.team];
          team.players = team.players.filter(id => id !== playerId);
        }
        // Remove from players
        delete state.players[playerId];
      });
    },

    /**
     * Updates specific properties of a player
     */
    updatePlayer: (playerId: string, updates: Partial<Player>) => {
      set((state) => {
        if (state.players[playerId]) {
          Object.assign(state.players[playerId], updates);
        }
      });
    },

    /**
     * Assigns a player to a specific team
     */
    assignPlayerToTeam: (playerId: string, teamColor: TeamColor) => {
      set((state) => {
        const player = state.players[playerId];
        if (!player) return;

        // Remove from current team if assigned
        if (player.team) {
          const currentTeam = state.teams[player.team];
          currentTeam.players = currentTeam.players.filter(id => id !== playerId);
        }

        // Add to new team
        player.team = teamColor;
        state.teams[teamColor].players.push(playerId);
      });
    },

    /**
     * Toggles the ready state of a player
     */
    togglePlayerReady: (playerId: string) => {
      set((state) => {
        const player = state.players[playerId];
        if (player) {
          player.isReady = !player.isReady;
        }
      });
    },

    /**
     * Updates game settings
     */
    updateSettings: (newSettings: Partial<GameSettings>) => {
      set((state) => {
        Object.assign(state.settings, newSettings);
        if (newSettings.boardSize) {
          state.boardSize = newSettings.boardSize;
        }
      });
    },

    /**
     * Starts the game if all conditions are met
     */
    startGame: () => {
      set((state) => {
        const { teams, players } = state;
        
        // Validate teams
        const validation = validateTeams(teams);
        if (!validation.valid) {
          console.error('Cannot start game:', validation.message);
          return;
        }

        // Check if all players are ready
        const allReady = Object.values(players).every(player => player.isReady);
        if (!allReady) {
          console.error('Cannot start game: Not all players are ready');
          return;
        }

        state.gameState = 'playing';
        
        // Start with the first team that has players
        const firstTeam = Object.values(teams).find(team => team.players.length > 0);
        if (firstTeam) {
          const firstSpeaker = firstTeam.players[0];
          state.currentTurn = {
            team: firstTeam.color,
            speakerId: firstSpeaker,
            timeRemaining: state.settings.turnDuration,
            cardsWon: 0,
            cardsPassed: 0,
            penalties: 0,
          };
        }
      });
    },

    /**
     * Pauses the current game
     */
    pauseGame: () => {
      set((state) => {
        if (state.gameState === 'playing') {
          state.gameState = 'paused';
        }
      });
    },

    /**
     * Resumes a paused game
     */
    resumeGame: () => {
      set((state) => {
        if (state.gameState === 'paused') {
          state.gameState = 'playing';
        }
      });
    },

    /**
     * Ends the game with a winning team
     */
    endGame: (winningTeam: TeamColor) => {
      set((state) => {
        state.gameState = 'finished';
        state.currentTurn = null;
        state.currentCard = null;
        // Mark winning team
        state.teams[winningTeam].score += 10; // Bonus points for winning
      });
    },

    /**
     * Starts a new turn for a specific team and speaker
     */
    startTurn: (team: TeamColor, speakerId: string) => {
      set((state) => {
        state.currentTurn = {
          team,
          speakerId,
          timeRemaining: state.settings.turnDuration,
          cardsWon: 0,
          cardsPassed: 0,
          penalties: 0,
        };
      });
    },

    /**
     * Ends the current turn and calculates movement
     */
    endTurn: () => {
      set((state) => {
        if (!state.currentTurn) return;

        const { team, cardsWon, cardsPassed, penalties } = state.currentTurn;
        const movement = calculateMovement(cardsWon, cardsPassed, penalties);
        
        // Move the team on 1..8 track
        const currentTeam = state.teams[team];
        const currentIndex = currentTeam.wordIndex ?? 1;
        const wrapped = ((currentIndex - 1 + movement) % 8 + 8) % 8 + 1; // keep within 1..8
        currentTeam.wordIndex = wrapped;
        currentTeam.score += cardsWon;

        // Save last turn stats for UI
        currentTeam.lastMovement = movement;
        currentTeam.lastCardsWon = cardsWon;
        currentTeam.lastPassed = cardsPassed;
        currentTeam.lastPenalties = penalties;
        currentTeam.lastUpdated = Date.now();

        // Check win condition
        // Optional: keep legacy position-based win disabled; using score target instead
        if (checkWinCondition(0, state.boardSize)) {
          state.gameState = 'finished';
          state.currentTurn = null;
          return;
        }

        // Clear current turn
        state.currentTurn = null;
        state.currentCard = null;
      });
    },

    /**
     * Advances to the next team's turn
     */
    nextTurn: () => {
      const { teams, players, currentTurn } = get();
      
      if (!currentTurn) return;

      set((state) => {
        const nextTeam = getNextTeam(currentTurn.team, teams);
        const nextSpeaker = getNextSpeaker(nextTeam, players, '');
        
        state.currentTurn = {
          team: nextTeam,
          speakerId: nextSpeaker,
          timeRemaining: state.settings.turnDuration,
          cardsWon: 0,
          cardsPassed: 0,
          penalties: 0,
        };
      });
    },

    /**
     * Draws a random card that hasn't been used
     * Note: This is a simplified version. In practice, you should use the useCards hook
     */
    drawCard: (): Card => {
      // This is a placeholder implementation
      // In a real app, cards should be loaded via the useCards hook
      const placeholderCard: Card = {
        id: 'placeholder',
        category: 'general',
        difficulty: 'medium',
        words: ['טלפון', 'מחשב', 'ספר', 'כדור', 'גיטרה', 'שעון', 'מפתח', 'כוס']
      };

      set((state) => {
        state.currentCard = placeholderCard;
        if (!state.usedCardIds.includes(placeholderCard.id)) {
          state.usedCardIds.push(placeholderCard.id);
        }
      });

      return placeholderCard;
    },

    /**
     * Marks the current card as correctly guessed
     */
    markCardCorrect: () => {
      set((state) => {
        if (state.currentTurn) {
          state.currentTurn.cardsWon += 1;
        }
      });
    },

    /**
     * Marks the current card as passed/skipped
     */
    markCardPassed: () => {
      set((state) => {
        if (state.currentTurn) {
          state.currentTurn.cardsPassed += 1;
        }
      });
    },

    /**
     * Records a penalty (e.g., said part of the word)
     */
    markPenalty: () => {
      set((state) => {
        if (state.currentTurn) {
          state.currentTurn.penalties += 1;
        }
      });
    },

    /**
     * Updates the remaining time for the current turn
     */
    updateTimer: (timeRemaining: number) => {
      set((state) => {
        if (state.currentTurn) {
          state.currentTurn.timeRemaining = Math.max(0, timeRemaining);
        }
      });
    },

    /**
     * Moves a team by a specific number of spaces
     */
    moveTeam: (team: TeamColor, spaces: number) => {
      set((state) => {
        const targetTeam = state.teams[team];
        const currentIndex = targetTeam.wordIndex ?? 1;
        const wrapped = ((currentIndex - 1 + spaces) % 8 + 8) % 8 + 1;
        targetTeam.wordIndex = wrapped;
      });
    },

    /**
     * Resets the game to initial state while keeping players
     */
    resetGame: () => {
      set((state) => {
        state.gameState = 'lobby';
        state.currentTurn = null;
        state.currentCard = null;
        state.usedCardIds = [];
        
        // Reset team positions and scores
        Object.values(state.teams).forEach(team => {
          team.position = 0;
          team.wordIndex = 1;
          team.score = 0;
        });

        // Reset player ready states
        Object.values(state.players).forEach(player => {
          player.isReady = false;
        });
      });
    },
  }))
);
