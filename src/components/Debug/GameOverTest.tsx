import React from 'react';
import { useTranslation } from 'react-i18next';
import GameOverPage from '../../pages/GameOverPage';
import { useGameStore } from '../../stores/gameStore';
import type { TeamColor } from '../../types/game.types';

const GameOverTest: React.FC = () => {
  const { t } = useTranslation();
  const { endGame, moveTeam, resetGame } = useGameStore();

  const mockTeams = {
    red: {
      color: 'red' as TeamColor,
      name: 'Red Dragons',
      players: ['player1', 'player2'],
      position: 50,
      score: 12
    },
    blue: {
      color: 'blue' as TeamColor,
      name: 'Blue Sharks',
      players: ['player3', 'player4'],
      position: 45,
      score: 10
    },
    green: {
      color: 'green' as TeamColor,
      name: 'Green Eagles',
      players: ['player5'],
      position: 38,
      score: 8
    },
    yellow: {
      color: 'yellow' as TeamColor,
      name: 'Yellow Lions',
      players: ['player6', 'player7', 'player8'],
      position: 32,
      score: 6
    }
  };

  const setupMockGame = (winner: TeamColor) => {
    // Set up mock team positions
    moveTeam('red', winner === 'red' ? 50 : 45);
    moveTeam('blue', winner === 'blue' ? 50 : 40);
    moveTeam('green', winner === 'green' ? 50 : 35);
    moveTeam('yellow', winner === 'yellow' ? 50 : 30);
    
    // End the game with the winning team
    endGame(winner);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Test Controls */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🏆 {t('gameOver.gameComplete')} - Test Page
          </h1>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setupMockGame('red')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              🔴 Red Team Wins
            </button>
            
            <button
              onClick={() => setupMockGame('blue')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔵 Blue Team Wins
            </button>
            
            <button
              onClick={() => setupMockGame('green')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              🟢 Green Team Wins
            </button>
            
            <button
              onClick={() => setupMockGame('yellow')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              🟡 Yellow Team Wins
            </button>

            <button
              onClick={() => {
                resetGame();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Reset Game
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Victory animations with confetti</li>
              <li>• Final score cards with team rankings</li>
              <li>• Game statistics and fun facts</li>
              <li>• Share results functionality</li>
              <li>• Action buttons (Play Again, New Game, Exit)</li>
              <li>• Multi-language support (EN/HE)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Game Over Page */}
      <div className="relative">
        <GameOverPage />
      </div>
    </div>
  );
};

export default GameOverTest;
