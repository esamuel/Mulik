import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TeamColor } from '../../types/game.types';

interface BoardOverlayProps {
  currentTeam?: TeamColor;
  currentPosition?: number;
  totalSpaces?: number;
  className?: string;
}

const BoardOverlay: React.FC<BoardOverlayProps> = ({
  currentTeam,
  currentPosition = 0,
  totalSpaces = 50,
  className = '',
}) => {
  const { t } = useTranslation();

  const teamConfig = {
    red: { color: '#EF4444', name: 'Red' },
    blue: { color: '#3B82F6', name: 'Blue' },
    green: { color: '#10B981', name: 'Green' },
    yellow: { color: '#F59E0B', name: 'Yellow' },
  };

  const spacesToWin = totalSpaces - currentPosition;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Center Logo */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MULIK
          </div>
          <div className="text-sm md:text-base text-gray-600 mt-1">
            {t('board.gameBoard', 'Game Board')}
          </div>
        </motion.div>
      </div>

      {/* Turn Indicator */}
      {currentTeam && (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 border-2 border-gray-200">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: teamConfig[currentTeam].color }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <span className="text-sm font-semibold text-gray-800">
                {t('board.currentTurn', `${teamConfig[currentTeam].name} Team's Turn`)}
              </span>
              <motion.div
                className="text-lg"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                👆
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Position Counter */}
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-white rounded-lg shadow-lg px-3 py-2 border-2 border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {currentPosition}/{totalSpaces}
            </div>
            <div className="text-xs text-gray-600">
              {t('board.position', 'Position')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Distance to Win */}
      {currentPosition > 0 && spacesToWin > 0 && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow-lg px-4 py-2">
            <div className="text-center">
              <div className="text-lg font-bold">
                {spacesToWin} {t('board.spacesToGo', 'spaces to go!')}
              </div>
              <div className="text-xs opacity-90">
                {t('board.toVictory', 'to victory')}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Victory Indicator */}
      {currentPosition >= totalSpaces && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg px-6 py-3">
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                🏁 {t('board.finish', 'FINISH!')} 🏁
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      <motion.div
        className="absolute bottom-4 right-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-white rounded-lg shadow-lg p-3 border-2 border-gray-200">
          <div className="text-xs text-gray-600 mb-1">
            {t('board.progress', 'Progress')}
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentPosition / totalSpaces) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {Math.round((currentPosition / totalSpaces) * 100)}%
          </div>
        </div>
      </motion.div>

      {/* Compass/Direction Indicator */}
      <motion.div
        className="absolute top-4 left-4"
        initial={{ opacity: 0, rotate: -180 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <div className="bg-white rounded-full shadow-lg p-2 border-2 border-gray-200">
          <motion.div
            className="w-8 h-8 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <span className="text-lg">🧭</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-300 rounded-full opacity-30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BoardOverlay;
