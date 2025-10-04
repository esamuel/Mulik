import React from 'react';
import { motion } from 'framer-motion';
import type { Player, TeamColor } from '../../types/game.types';

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer?: boolean;
  canRemove?: boolean;
  onRemove?: (playerId: string) => void;
  onClick?: (player: Player) => void;
  isDragging?: boolean;
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentPlayer = false,
  canRemove = false,
  onRemove,
  onClick,
  isDragging = false,
  className = '',
}) => {
  // Get team color styles
  const getTeamStyles = (team?: TeamColor) => {
    if (!team) return 'bg-gray-100 border-gray-300';
    
    const styles = {
      red: 'bg-red-50 border-red-300 text-red-800',
      blue: 'bg-blue-50 border-blue-300 text-blue-800',
      green: 'bg-green-50 border-green-300 text-green-800',
      yellow: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    };
    
    return styles[team];
  };

  // Get avatar color based on player ID
  const getAvatarColor = () => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
    ];
    
    const hash = player.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get player initial
  const getPlayerInitial = () => {
    return player.name.charAt(0).toUpperCase();
  };

  const handleClick = () => {
    if (onClick) {
      onClick(player);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(player.id);
    }
  };

  return (
    <motion.div
      className={`
        relative bg-white rounded-lg border-2 p-4 shadow-sm
        transition-all duration-200 cursor-pointer
        ${getTeamStyles(player.team)}
        ${isCurrentPlayer ? 'ring-2 ring-mulik-primary-500' : ''}
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
        ${onClick ? 'hover:shadow-md hover:scale-105' : ''}
        ${className}
      `}
      onClick={handleClick}
      whileHover={!isDragging ? { scale: 1.02 } : {}}
      whileTap={!isDragging ? { scale: 0.98 } : {}}
      layout
    >
      {/* Remove Button */}
      {canRemove && (
        <motion.button
          onClick={handleRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Remove ${player.name}`}
        >
          ✕
        </motion.button>
      )}

      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="relative">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            text-white font-bold text-lg ${getAvatarColor()}
          `}>
            {getPlayerInitial()}
          </div>
          
          {/* Online Indicator */}
          <div className="absolute -bottom-1 -right-1">
            {player.isConnected ? (
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ) : (
              <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {/* Player Name */}
            <h3 className="font-semibold text-gray-900 truncate">
              {player.name}
            </h3>
            
            {/* Host Badge */}
            {player.isHost && (
              <span className="text-yellow-500 text-lg" title="Host">
                👑
              </span>
            )}
            
            {/* Current Player Badge */}
            {isCurrentPlayer && (
              <span className="text-xs bg-mulik-primary-500 text-white px-2 py-1 rounded-full">
                You
              </span>
            )}
          </div>

          {/* Team Badge */}
          {player.team && (
            <div className="mt-1">
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${getTeamStyles(player.team)}
              `}>
                <span className={`
                  w-2 h-2 rounded-full mr-1
                  ${player.team === 'red' ? 'bg-red-500' : ''}
                  ${player.team === 'blue' ? 'bg-blue-500' : ''}
                  ${player.team === 'green' ? 'bg-green-500' : ''}
                  ${player.team === 'yellow' ? 'bg-yellow-500' : ''}
                `} />
                {player.team.charAt(0).toUpperCase() + player.team.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Ready Status */}
        <div className="flex flex-col items-center">
          {player.isReady ? (
            <motion.div
              className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              ✓
            </motion.div>
          ) : (
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
              ⏳
            </div>
          )}
          <span className="text-xs text-gray-500 mt-1">
            {player.isReady ? 'Ready' : 'Waiting'}
          </span>
        </div>
      </div>

      {/* Dragging Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-mulik-primary-200 bg-opacity-50 rounded-lg border-2 border-dashed border-mulik-primary-400" />
      )}
    </motion.div>
  );
};

export default PlayerCard;
