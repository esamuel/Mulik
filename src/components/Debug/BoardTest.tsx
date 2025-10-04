import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SpiralBoard from '../Board/SpiralBoard';
import type { TeamColor, Team } from '../../types/game.types';

const BoardTest: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<TeamColor>('red');
  const [currentPosition, setCurrentPosition] = useState(1);

  // Mock teams data
  const [teams, setTeams] = useState<Record<TeamColor, Team>>({
    red: {
      color: 'red',
      name: 'Red Team',
      players: ['player1'],
      position: 5,
      score: 0,
    },
    blue: {
      color: 'blue',
      name: 'Blue Team',
      players: ['player2'],
      position: 12,
      score: 0,
    },
    green: {
      color: 'green',
      name: 'Green Team',
      players: ['player3'],
      position: 8,
      score: 0,
    },
    yellow: {
      color: 'yellow',
      name: 'Yellow Team',
      players: ['player4'],
      position: 15,
      score: 0,
    },
  });

  const handleSpaceClick = (position: number) => {
    console.log(`Clicked space ${position}`);
    setCurrentPosition(position);
  };

  const handleMoveTeam = (team: TeamColor, newPosition: number) => {
    setTeams(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        position: Math.max(1, Math.min(50, newPosition)),
      },
    }));
  };

  const handleRandomMove = () => {
    const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];
    const randomTeam = teamColors[Math.floor(Math.random() * teamColors.length)];
    const currentPos = teams[randomTeam].position;
    const move = Math.floor(Math.random() * 6) + 1; // 1-6 spaces
    const newPosition = Math.min(50, currentPos + move);
    
    handleMoveTeam(randomTeam, newPosition);
    setCurrentTeam(randomTeam);
  };

  const handleResetPositions = () => {
    setTeams(prev => ({
      red: { ...prev.red, position: 1 },
      blue: { ...prev.blue, position: 1 },
      green: { ...prev.green, position: 1 },
      yellow: { ...prev.yellow, position: 1 },
    }));
  };

  const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 Spiral Board Test
          </h1>
          <p className="text-white/80 text-lg">
            Test the animated spiral game board with 50 spaces and special effects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Board */}
          <div className="xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <SpiralBoard
                teams={teams}
                currentPosition={currentPosition}
                currentTeam={currentTeam}
                onSpaceClick={handleSpaceClick}
              />
            </motion.div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            
            {/* Team Controls */}
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Team Controls</h3>
              
              {teamColors.map((color) => (
                <div key={color} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ 
                          backgroundColor: {
                            red: '#EF4444',
                            blue: '#3B82F6',
                            green: '#10B981',
                            yellow: '#F59E0B',
                          }[color]
                        }}
                      />
                      <span className="font-medium capitalize">{color}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Pos: {teams[color].position}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMoveTeam(color, teams[color].position - 1)}
                      className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                      disabled={teams[color].position <= 1}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleMoveTeam(color, teams[color].position + 1)}
                      className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                      disabled={teams[color].position >= 50}
                    >
                      →
                    </button>
                    <button
                      onClick={() => setCurrentTeam(color)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        currentTeam === color
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Turn
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleRandomMove}
                  className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  🎲 Random Move
                </button>
                
                <button
                  onClick={handleResetPositions}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  🔄 Reset All
                </button>
                
                <button
                  onClick={() => {
                    teamColors.forEach(color => {
                      handleMoveTeam(color, Math.floor(Math.random() * 50) + 1);
                    });
                  }}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🎯 Random Positions
                </button>
              </div>
            </motion.div>

            {/* Board Info */}
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Board Features</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>50 spaces in Archimedean spiral</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Special spaces with effects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Animated pawn movement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Interactive space clicking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Current turn highlighting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Responsive SVG design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Accessibility support</span>
                </div>
              </div>
            </motion.div>

            {/* Current State */}
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Current State</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Current Turn:</span> 
                  <span className="capitalize ml-1">{currentTeam}</span>
                </div>
                <div>
                  <span className="font-medium">Highlighted Space:</span> 
                  <span className="ml-1">{currentPosition}</span>
                </div>
                <div>
                  <span className="font-medium">Teams on Board:</span> 
                  <span className="ml-1">{Object.keys(teams).length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardTest;
