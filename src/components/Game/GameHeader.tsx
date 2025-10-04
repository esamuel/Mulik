import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { TeamColor } from '../../types/game.types';

interface GameHeaderProps {
  roomCode: string;
  currentTeam?: TeamColor;
  currentTeamName?: string;
  turnNumber: number;
  roundNumber: number;
  timeRemaining?: number;
  isPaused?: boolean;
  onPauseToggle?: () => void;
  onShowSettings?: () => void;
  onLeaveGame?: () => void;
  className?: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  roomCode,
  currentTeam,
  currentTeamName,
  turnNumber,
  roundNumber,
  timeRemaining,
  isPaused = false,
  onPauseToggle,
  onShowSettings,
  onLeaveGame,
  className = '',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const teamConfig = {
    red: { color: '#EF4444', emoji: '🔴', bg: 'from-red-500 to-red-600' },
    blue: { color: '#3B82F6', emoji: '🔵', bg: 'from-blue-500 to-blue-600' },
    green: { color: '#10B981', emoji: '🟢', bg: 'from-green-500 to-green-600' },
    yellow: { color: '#F59E0B', emoji: '🟡', bg: 'from-yellow-500 to-yellow-600' },
  };

  const config = currentTeam ? teamConfig[currentTeam] : null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveGame = () => {
    if (onLeaveGame) {
      onLeaveGame();
    } else {
      navigate('/');
    }
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.header
      className={`bg-white shadow-lg rounded-b-2xl relative z-10 ${className}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Left Section - Room Info */}
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-purple-600">MULIK</div>
              <div className="text-sm text-gray-500">
                {t('game.room', 'Room')}: {roomCode}
              </div>
            </motion.div>

            {/* Game Progress */}
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="text-lg">🎯</span>
                <span>{t('game.round', 'Round')} {roundNumber}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-lg">🔄</span>
                <span>{t('game.turn', 'Turn')} {turnNumber}</span>
              </div>
            </div>
          </div>

          {/* Center Section - Current Team */}
          {config && currentTeamName && (
            <motion.div
              className={`flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r ${config.bg} text-white shadow-lg`}
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '0 8px 25px rgba(0, 0, 0, 0.2)',
                  '0 4px 6px rgba(0, 0, 0, 0.1)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="text-xl">{config.emoji}</span>
              <span className="font-bold">{currentTeamName}</span>
              <span className="text-sm opacity-90">
                {t('game.turn', 'Turn')}
              </span>
            </motion.div>
          )}

          {/* Right Section - Timer & Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Timer */}
            {timeRemaining !== undefined && (
              <motion.div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  timeRemaining <= 10 
                    ? 'bg-red-100 text-red-700' 
                    : timeRemaining <= 30 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
                animate={timeRemaining <= 10 ? {
                  scale: [1, 1.1, 1],
                } : {}}
                transition={{
                  duration: 1,
                  repeat: timeRemaining <= 10 ? Infinity : 0,
                }}
              >
                <span className="text-lg">⏱️</span>
                <span className="font-mono font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </motion.div>
            )}

            {/* Pause Button */}
            {onPauseToggle && (
              <motion.button
                onClick={onPauseToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isPaused 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-xl">
                  {isPaused ? '▶️' : '⏸️'}
                </span>
              </motion.button>
            )}

            {/* Menu Button */}
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-xl">⚙️</span>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {onShowSettings && (
                      <button
                        onClick={() => {
                          onShowSettings();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <span>⚙️</span>
                        <span>{t('game.settings', 'Settings')}</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomCode);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <span>📋</span>
                      <span>{t('game.copyRoomCode', 'Copy Room Code')}</span>
                    </button>

                    <div className="border-t border-gray-200 my-1" />
                    
                    <button
                      onClick={() => {
                        handleLeaveGame();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span>{t('game.leaveGame', 'Leave Game')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Game Progress */}
        <div className="md:hidden mt-3 flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <span className="text-lg">🎯</span>
            <span>{t('game.round', 'Round')} {roundNumber}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg">🔄</span>
            <span>{t('game.turn', 'Turn')} {turnNumber}</span>
          </div>
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-20 rounded-b-2xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <span className="text-xl">⏸️</span>
              <span className="font-semibold text-gray-800">
                {t('game.paused', 'Game Paused')}
              </span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.header>
  );
};

export default GameHeader;
