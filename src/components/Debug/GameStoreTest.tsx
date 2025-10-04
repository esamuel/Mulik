import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { generateRoomCode } from '../../utils/roomCode';

/**
 * Debug component to test game store functionality
 * This component should be removed in production
 */
const GameStoreTest: React.FC = () => {
  const {
    roomCode,
    gameState,
    teams,
    players,
    currentTurn,
    initializeRoom,
    addPlayer,
    assignPlayerToTeam,
    togglePlayerReady,
    startGame,
    drawCard,
    markCardCorrect,
    endTurn,
    nextTurn,
    resetGame,
  } = useGameStore();

  const handleInitializeRoom = () => {
    const newRoomCode = generateRoomCode();
    initializeRoom(newRoomCode, 'host-1');
  };

  const handleAddTestPlayers = () => {
    // Add test players
    addPlayer({
      id: 'player-1',
      name: 'Alice',
      isHost: true,
      isConnected: true,
      isReady: false,
    });

    addPlayer({
      id: 'player-2',
      name: 'Bob',
      isHost: false,
      isConnected: true,
      isReady: false,
    });

    addPlayer({
      id: 'player-3',
      name: 'Charlie',
      isHost: false,
      isConnected: true,
      isReady: false,
    });

    addPlayer({
      id: 'player-4',
      name: 'Diana',
      isHost: false,
      isConnected: true,
      isReady: false,
    });

    // Assign to teams
    assignPlayerToTeam('player-1', 'red');
    assignPlayerToTeam('player-2', 'red');
    assignPlayerToTeam('player-3', 'blue');
    assignPlayerToTeam('player-4', 'blue');
  };

  const handleToggleAllReady = () => {
    Object.keys(players).forEach(playerId => {
      togglePlayerReady(playerId);
    });
  };

  const handleDrawCard = () => {
    const card = drawCard();
    console.log('Drew card:', card);
  };

  const handleSimulateTurn = () => {
    if (currentTurn) {
      // Simulate some correct answers
      markCardCorrect();
      markCardCorrect();
      markCardCorrect();
      
      // End the turn
      endTurn();
      
      // Start next turn
      setTimeout(() => {
        nextTurn();
      }, 1000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Game Store Test</h2>
      
      {/* Room Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Room Info</h3>
        <p><strong>Room Code:</strong> {roomCode || 'None'}</p>
        <p><strong>Game State:</strong> {gameState}</p>
        <p><strong>Players:</strong> {Object.keys(players).length}</p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-2">
        <h3 className="text-lg font-semibold mb-2">Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleInitializeRoom}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Initialize Room
          </button>
          
          <button
            onClick={handleAddTestPlayers}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={!roomCode}
          >
            Add Test Players
          </button>
          
          <button
            onClick={handleToggleAllReady}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            disabled={Object.keys(players).length === 0}
          >
            Toggle All Ready
          </button>
          
          <button
            onClick={startGame}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={gameState !== 'lobby'}
          >
            Start Game
          </button>
          
          <button
            onClick={handleDrawCard}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            disabled={gameState !== 'playing'}
          >
            Draw Card
          </button>
          
          <button
            onClick={handleSimulateTurn}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            disabled={!currentTurn}
          >
            Simulate Turn
          </button>
          
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Game
          </button>
        </div>
      </div>

      {/* Teams Display */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Teams</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(teams).map(team => (
            <div key={team.color} className="p-3 border rounded-lg">
              <h4 className={`font-semibold capitalize text-${team.color}-600`}>
                {team.name}
              </h4>
              <p className="text-sm">Position: {team.position}</p>
              <p className="text-sm">Score: {team.score}</p>
              <p className="text-sm">Players: {team.players.length}</p>
              <div className="mt-2">
                {team.players.map(playerId => (
                  <div key={playerId} className="text-xs">
                    {players[playerId]?.name} 
                    {players[playerId]?.isReady ? ' ✓' : ' ⏳'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Turn */}
      {currentTurn && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current Turn</h3>
          <p><strong>Team:</strong> {currentTurn.team}</p>
          <p><strong>Speaker:</strong> {players[currentTurn.speakerId]?.name}</p>
          <p><strong>Time:</strong> {currentTurn.timeRemaining}s</p>
          <p><strong>Cards Won:</strong> {currentTurn.cardsWon}</p>
          <p><strong>Cards Passed:</strong> {currentTurn.cardsPassed}</p>
        </div>
      )}

      {/* Players List */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Players</h3>
        <div className="space-y-2">
          {Object.values(players).map(player => (
            <div key={player.id} className="flex items-center justify-between p-2 border rounded">
              <span>
                {player.name} 
                {player.isHost && ' 👑'}
                {player.isReady ? ' ✅' : ' ⏳'}
              </span>
              <span className={`px-2 py-1 rounded text-sm ${
                player.team ? `bg-${player.team}-100 text-${player.team}-800` : 'bg-gray-100'
              }`}>
                {player.team || 'No Team'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameStoreTest;
