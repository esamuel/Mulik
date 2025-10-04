import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Player, Team } from '../../types/game.types';

interface StartGameButtonProps {
  players: Player[];
  teams: Team[];
  onStartGame: () => Promise<void>;
  isHost: boolean;
  disabled?: boolean;
  className?: string;
}

interface GameRequirement {
  met: boolean;
  message: string;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  players,
  teams,
  onStartGame,
  isHost,
  disabled = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check game requirements
  const getGameRequirements = (): GameRequirement[] => {
    const requirements: GameRequirement[] = [];

    // Check if there are at least 2 players
    const totalPlayers = players.length;
    requirements.push({
      met: totalPlayers >= 2,
      message: t('lobby.needMinPlayers', { min: 2, current: totalPlayers }),
    });

    // Check if there are at least 2 teams with players
    const teamsWithPlayers = teams.filter(team => team.players.length > 0);
    requirements.push({
      met: teamsWithPlayers.length >= 2,
      message: t('lobby.needMinTeams', { min: 2, current: teamsWithPlayers.length }),
    });

    // Check if all players are ready (except host can start without being ready)
    // Skip this check in debug mode
    const skipReadyCheck = import.meta.env.VITE_SKIP_READY_CHECK === 'true';
    const playersNotReady = players.filter(player => !player.isReady && !player.isHost);
    requirements.push({
      met: skipReadyCheck || playersNotReady.length === 0,
      message: skipReadyCheck 
        ? t('lobby.readyCheckSkipped', '✓ Ready check skipped (debug mode)')
        : t('lobby.allPlayersReady', { notReady: playersNotReady.length }),
    });

    // Check team balance (optional warning)
    const teamSizes = teamsWithPlayers.map(team => team.players.length);
    const maxSize = Math.max(...teamSizes);
    const minSize = Math.min(...teamSizes);
    const isBalanced = maxSize - minSize <= 1;
    
    if (teamsWithPlayers.length > 1) {
      requirements.push({
        met: isBalanced,
        message: t('lobby.teamsUnbalanced'),
      });
    }

    return requirements;
  };

  const requirements = getGameRequirements();
  const canStart = requirements.slice(0, 3).every(req => req.met); // First 3 are mandatory
  const hasWarnings = requirements.slice(3).some(req => !req.met); // Rest are warnings

  const handleStartGame = async () => {
    if (!canStart || isStarting || disabled) return;

    setIsStarting(true);

    try {
      // Start countdown
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCountdown(null);
      
      // Start the game
      await onStartGame();
      
    } catch (error) {
      console.error('Failed to start game:', error);
      setCountdown(null);
    } finally {
      setIsStarting(false);
    }
  };

  if (!isHost) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            {t('lobby.waitingForHost')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Requirements List */}
      {!canStart && (
        <motion.div
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-semibold text-yellow-800 mb-2">
            {t('lobby.requirementsToStart')}
          </h4>
          <ul className="space-y-1">
            {requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className={`mr-2 ${req.met ? 'text-green-500' : 'text-red-500'}`}>
                  {req.met ? '✅' : '❌'}
                </span>
                <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                  {req.message}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Warnings */}
      {canStart && hasWarnings && (
        <motion.div
          className="bg-orange-50 border border-orange-200 rounded-lg p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-semibold text-orange-800 mb-2">
            {t('lobby.warnings')}
          </h4>
          <ul className="space-y-1">
            {requirements.slice(3).filter(req => !req.met).map((req, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className="mr-2 text-orange-500">⚠️</span>
                <span className="text-orange-700">{req.message}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Start Game Button */}
      <div className="relative">
        <motion.button
          onClick={handleStartGame}
          disabled={!canStart || isStarting || disabled}
          className={`
            w-full py-4 px-8 rounded-xl font-bold text-lg
            transition-all duration-200 relative overflow-hidden
            focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${canStart && !isStarting && !disabled
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl focus:ring-green-300 hover:from-green-600 hover:to-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
          whileHover={canStart && !isStarting && !disabled ? { scale: 1.02 } : {}}
          whileTap={canStart && !isStarting && !disabled ? { scale: 0.98 } : {}}
          layout
        >
          <AnimatePresence mode="wait">
            {countdown !== null ? (
              <motion.div
                key="countdown"
                className="flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  className="text-4xl font-bold"
                  animate={{
                    scale: [1, 1.3, 1],
                    color: ['#ffffff', '#fef3c7', '#ffffff'],
                  }}
                  transition={{ duration: 0.8 }}
                >
                  {countdown}
                </motion.span>
              </motion.div>
            ) : isStarting ? (
              <motion.div
                key="starting"
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                {t('lobby.startingGame')}
              </motion.div>
            ) : (
              <motion.span
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                🎮 {t('lobby.startGame')}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Button Background Animation */}
          {canStart && !isStarting && !disabled && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0"
              whileHover={{ opacity: 0.2 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </motion.button>

        {/* Countdown Circle Animation */}
        {countdown !== null && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Game Info */}
      {canStart && (
        <motion.div
          className="text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>
            {t('lobby.gameInfo', { 
              players: players.length,
              teams: teams.filter(t => t.players.length > 0).length 
            })}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StartGameButton;
