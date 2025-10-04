import React from 'react';
import { motion } from 'framer-motion';
import PlayerCard from './PlayerCard';
import type { Team, Player, TeamColor } from '../../types/game.types';

interface TeamSectionProps {
  team: Team;
  players: Player[];
  currentPlayerId?: string;
  canRemovePlayer?: boolean;
  onPlayerRemove?: (playerId: string) => void;
  onPlayerClick?: (player: Player) => void;
  onDrop?: (teamColor: TeamColor) => void;
  isDragOver?: boolean;
  isEmpty?: boolean;
  className?: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({
  team,
  players,
  currentPlayerId,
  canRemovePlayer = false,
  onPlayerRemove,
  onPlayerClick,
  onDrop,
  isDragOver = false,
  isEmpty = false,
  className = '',
}) => {
  // Get team color styles
  const getTeamStyles = (color: TeamColor) => {
    const styles = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        header: 'bg-red-500 text-white',
        accent: 'text-red-600',
        dropZone: 'border-red-400 bg-red-100',
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        header: 'bg-blue-500 text-white',
        accent: 'text-blue-600',
        dropZone: 'border-blue-400 bg-blue-100',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-300',
        header: 'bg-green-500 text-white',
        accent: 'text-green-600',
        dropZone: 'border-green-400 bg-green-100',
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        header: 'bg-yellow-500 text-white',
        accent: 'text-yellow-600',
        dropZone: 'border-yellow-400 bg-yellow-100',
      },
    };
    
    return styles[color];
  };

  const teamStyles = getTeamStyles(team.color);
  const readyCount = players.filter(p => p.isReady).length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(team.color);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <motion.div
      className={`
        rounded-lg border-2 overflow-hidden
        ${teamStyles.bg} ${teamStyles.border}
        ${isDragOver ? teamStyles.dropZone : ''}
        ${className}
      `}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Team Header */}
      <div className={`px-4 py-3 ${teamStyles.header}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {team.name} Team
          </h3>
          <div className="flex items-center space-x-2">
            {/* Team Color Indicator */}
            <div className={`
              w-4 h-4 rounded-full border-2 border-white
              ${team.color === 'red' ? 'bg-red-600' : ''}
              ${team.color === 'blue' ? 'bg-blue-600' : ''}
              ${team.color === 'green' ? 'bg-green-600' : ''}
              ${team.color === 'yellow' ? 'bg-yellow-600' : ''}
            `} />
            {/* Player Count */}
            <span className="text-sm font-medium">
              {players.length} {players.length === 1 ? 'player' : 'players'}
            </span>
          </div>
        </div>
      </div>

      {/* Players Area */}
      <div className="p-4 min-h-[120px]">
        {players.length > 0 ? (
          <div className="space-y-3">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === currentPlayerId}
                canRemove={canRemovePlayer && !player.isHost}
                onRemove={onPlayerRemove}
                onClick={onPlayerClick}
                className="w-full"
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center
              ${isDragOver ? teamStyles.dropZone : 'border-gray-300 bg-gray-50'}
              transition-all duration-200
            `}
            animate={{
              borderColor: isDragOver ? undefined : '#d1d5db',
              backgroundColor: isDragOver ? undefined : '#f9fafb',
            }}
          >
            <div className="text-gray-500">
              {onDrop ? (
                <>
                  <div className="text-2xl mb-2">👥</div>
                  <p className="text-sm">
                    Drag players here or click to assign
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-2">👥</div>
                  <p className="text-sm">No players assigned</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Team Stats Footer */}
      {players.length > 0 && (
        <div className={`px-4 py-2 border-t ${teamStyles.border} bg-white bg-opacity-50`}>
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${teamStyles.accent}`}>
              {players.length} {players.length === 1 ? 'player' : 'players'}
            </span>
            <span className={`${teamStyles.accent}`}>
              {readyCount}/{players.length} ready
            </span>
          </div>
          
          {/* Ready Progress Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className={`h-1.5 rounded-full ${
                team.color === 'red' ? 'bg-red-500' :
                team.color === 'blue' ? 'bg-blue-500' :
                team.color === 'green' ? 'bg-green-500' :
                'bg-yellow-500'
              }`}
              initial={{ width: 0 }}
              animate={{ 
                width: players.length > 0 ? `${(readyCount / players.length) * 100}%` : '0%' 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Drop Zone Overlay (when dragging) */}
      {isDragOver && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
            <span className={`font-semibold ${teamStyles.accent}`}>
              Drop to assign to {team.name} Team
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TeamSection;
