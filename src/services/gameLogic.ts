import type { TeamColor, Player, Team, SpaceConfig } from '../types/game.types';

/**
 * Calculates the movement for a team based on their performance in a turn
 * @param cardsWon - Number of cards correctly guessed
 * @param cardsPassed - Number of cards passed/skipped
 * @param penalties - Number of penalty points (e.g., for rule violations)
 * @returns The number of spaces to move (can be negative)
 */
export const calculateMovement = (
  cardsWon: number,
  _cardsPassed: number,
  penalties: number
): number => {
  // Movement per rules: correct guesses minus penalties.
  // Pass gives 0 points/movement and should not reduce movement.
  return cardsWon - penalties;
};

/**
 * Gets the next speaker in the current team using circular rotation
 * @param currentTeam - The team color of the current team
 * @param players - Record of all players in the game
 * @param currentSpeakerId - ID of the current speaker
 * @returns The ID of the next speaker in the team
 */
export const getNextSpeaker = (
  currentTeam: TeamColor,
  players: Record<string, Player>,
  currentSpeakerId: string
): string => {
  // Get all players in the current team
  const teamPlayers = Object.values(players).filter(
    player => player.team === currentTeam && player.isConnected
  );

  if (teamPlayers.length === 0) {
    throw new Error(`No connected players found in team ${currentTeam}`);
  }

  if (teamPlayers.length === 1) {
    return teamPlayers[0].id;
  }

  // Find current speaker index
  const currentIndex = teamPlayers.findIndex(player => player.id === currentSpeakerId);
  
  if (currentIndex === -1) {
    // Current speaker not found, return first player
    return teamPlayers[0].id;
  }

  // Return next player (circular)
  const nextIndex = (currentIndex + 1) % teamPlayers.length;
  return teamPlayers[nextIndex].id;
};

/**
 * Gets the next team in rotation that has connected players
 * @param currentTeam - The current team color
 * @param teams - Record of all teams in the game
 * @returns The next team color with players
 */
export const getNextTeam = (
  currentTeam: TeamColor,
  teams: Record<TeamColor, Team>
): TeamColor => {
  const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];
  const teamsWithPlayers = teamColors.filter(color => 
    teams[color] && teams[color].players.length > 0
  );

  if (teamsWithPlayers.length === 0) {
    throw new Error('No teams with players found');
  }

  if (teamsWithPlayers.length === 1) {
    return teamsWithPlayers[0];
  }

  const currentIndex = teamsWithPlayers.findIndex(color => color === currentTeam);
  
  if (currentIndex === -1) {
    // Current team not found, return first team with players
    return teamsWithPlayers[0];
  }

  // Return next team (circular)
  const nextIndex = (currentIndex + 1) % teamsWithPlayers.length;
  return teamsWithPlayers[nextIndex];
};

/**
 * Checks if a team has reached the winning condition
 * @param position - Current position of the team
 * @param boardSize - Size of the game board (finish line)
 * @returns True if the team has won
 */
export const checkWinCondition = (position: number, boardSize: number): boolean => {
  return position >= boardSize;
};

/**
 * Checks if a position on the board is a special space
 * @param position - The board position to check
 * @returns SpaceConfig if it's a special space, null otherwise
 */
export const isSpecialSpace = (position: number): SpaceConfig | null => {
  const spaceType = getSpecialSpaceType(position);
  
  if (!spaceType) {
    return null;
  }

  const effects = {
    bonus: 'Move forward 2 extra spaces',
    lightning: 'All other teams move back 1 space',
    switch: 'Switch positions with the team behind you',
    steal: 'Steal 1 point from the leading team'
  };

  return {
    type: spaceType as 'bonus' | 'lightning' | 'switch' | 'steal',
    position,
    effect: effects[spaceType as keyof typeof effects]
  };
};

/**
 * Determines the type of special space at a given position
 * @param position - The board position to check
 * @returns The type of special space or null if it's a regular space
 */
export const getSpecialSpaceType = (position: number): string | null => {
  // Bonus spaces every 8 positions (8, 16, 24, 32, 40, 48...)
  if (position > 0 && position % 8 === 0) {
    return 'bonus';
  }

  // Lightning spaces at specific positions
  if ([15, 30, 45].includes(position)) {
    return 'lightning';
  }

  // Switch spaces at positions divisible by 12 (but not by 8)
  if (position > 0 && position % 12 === 0 && position % 8 !== 0) {
    return 'switch';
  }

  // Steal spaces at positions 7, 23, 39 (prime-like positions)
  if ([7, 23, 39].includes(position)) {
    return 'steal';
  }

  return null;
};

/**
 * Validates that teams are properly configured for the game
 * @param teams - Record of all teams
 * @returns Validation result with success status and message
 */
export const validateTeams = (
  teams: Record<TeamColor, Team>
): { valid: boolean; message: string } => {
  const teamsWithPlayers = Object.values(teams).filter(team => team.players.length > 0);

  // Check minimum teams
  if (teamsWithPlayers.length < 2) {
    return {
      valid: false,
      message: 'At least 2 teams with players are required to start the game'
    };
  }

  // Check team balance (no team should have more than double the players of the smallest team)
  const playerCounts = teamsWithPlayers.map(team => team.players.length);
  const minPlayers = Math.min(...playerCounts);
  const maxPlayers = Math.max(...playerCounts);

  if (maxPlayers > minPlayers * 2) {
    return {
      valid: false,
      message: 'Teams are too unbalanced. Try to distribute players more evenly'
    };
  }

  // Check maximum players per team (reasonable limit)
  if (maxPlayers > 6) {
    return {
      valid: false,
      message: 'Teams cannot have more than 6 players each'
    };
  }

  return {
    valid: true,
    message: 'Teams are properly configured'
  };
};

/**
 * Calculates the total number of players across all teams
 * @param teams - Record of all teams
 * @returns Total number of players
 */
export const getTotalPlayers = (teams: Record<TeamColor, Team>): number => {
  return Object.values(teams).reduce((total, team) => total + team.players.length, 0);
};

/**
 * Gets the team standings sorted by position (descending)
 * @param teams - Record of all teams
 * @returns Array of teams sorted by position
 */
export const getTeamStandings = (teams: Record<TeamColor, Team>): Team[] => {
  return Object.values(teams)
    .filter(team => team.players.length > 0)
    .sort((a, b) => b.position - a.position);
};
