import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { soundService } from '../../services/soundService';

interface ActionButtonsProps {
  onCorrect: () => Promise<void>;
  onSkip: () => Promise<void>;
  onMistake: () => Promise<void>; // NEW: Mistake button
  onEndTurn?: () => Promise<void>;
  disabled?: boolean;
  turnMode?: 'auto' | 'manual';
  isCurrentPlayerTurn?: boolean;
  currentTeamName?: string;
  loading?: boolean;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCorrect,
  onSkip,
  onMistake, // NEW
  onEndTurn,
  disabled = false,
  turnMode = 'auto',
  isCurrentPlayerTurn = false,
  currentTeamName,
  loading = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, callback: () => Promise<void>) => {
    if (disabled || loading || actionLoading) return;

    setActionLoading(action);
    
    try {
      await callback();
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCorrect = async () => {
    await handleAction('correct', async () => {
      soundService.play('correct-answer');
      await onCorrect();
    });
  };

  const handleSkip = async () => {
    await handleAction('skip', async () => {
      soundService.play('wrong-answer');
      await onSkip();
    });
  };

  const handleMistake = async () => {
    await handleAction('mistake', async () => {
      soundService.play('wrong-answer');
      await onMistake();
    });
  };

  const handleEndTurn = async () => {
    if (!onEndTurn) return;
    await handleAction('endTurn', onEndTurn);
  };

  // Button variants for animations
  const buttonVariants = {
    idle: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    tap: {
      scale: 0.95,
      y: 0,
      transition: {
        duration: 0.1,
      },
    },
    disabled: {
      scale: 1,
      opacity: 0.5,
    },
  };

  const confettiVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0],
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const isButtonDisabled = disabled || loading || !isCurrentPlayerTurn;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Turn Indicator */}
      {!isCurrentPlayerTurn && currentTeamName && (
        <motion.div
          className="text-center p-3 bg-gray-100 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-gray-600">
            {t('game.waitingForTurn', 'Waiting for {{team}} team', { team: currentTeamName })}
          </p>
        </motion.div>
      )}

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Got It! Button */}
        <motion.button
          onClick={handleCorrect}
          disabled={isButtonDisabled}
          className={`
            relative h-16 px-6 rounded-xl font-bold text-lg shadow-lg
            transition-all duration-200 overflow-hidden
            ${isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white active:bg-green-700'
            }
          `}
          variants={buttonVariants}
          initial="idle"
          animate={isButtonDisabled ? 'disabled' : 'idle'}
          whileHover={!isButtonDisabled ? 'hover' : undefined}
          whileTap={!isButtonDisabled ? 'tap' : undefined}
        >
          <div className="flex items-center justify-center space-x-2">
            {actionLoading === 'correct' ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <span className="text-2xl">✅</span>
                <span>{t('game.gotIt', 'Got It!')}</span>
              </>
            )}
          </div>

          {/* Confetti Animation */}
          {actionLoading === 'correct' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -50, 50],
                    x: [0, Math.random() * 40 - 20],
                    rotate: [0, 360],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.button>

        {/* Mistake Button - NEW */}
        <motion.button
          onClick={handleMistake}
          disabled={isButtonDisabled}
          title={t('game.mistakeTooltip', 'Explainer said part of the word? -1 penalty. Anyone can click!')}
          className={`
            h-16 px-6 rounded-xl font-bold text-lg shadow-lg
            transition-all duration-200
            ${isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white active:bg-orange-700'
            }
          `}
          variants={buttonVariants}
          initial="idle"
          animate={isButtonDisabled ? 'disabled' : 'idle'}
          whileHover={!isButtonDisabled ? 'hover' : undefined}
          whileTap={!isButtonDisabled ? 'tap' : undefined}
        >
          <div className="flex items-center justify-center space-x-2">
            {actionLoading === 'mistake' ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <span className="text-2xl">⚠️</span>
                <span>{t('game.mistake', 'Mistake')}</span>
              </>
            )}
          </div>
        </motion.button>

        {/* Skip Button */}
        <motion.button
          onClick={handleSkip}
          disabled={isButtonDisabled}
          title={t('game.skipTooltip', 'Too hard? Skip this card. -1 penalty, new card')}
          className={`
            h-16 px-6 rounded-xl font-bold text-lg shadow-lg
            transition-all duration-200
            ${isButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white active:bg-yellow-700'
            }
          `}
          variants={buttonVariants}
          initial="idle"
          animate={isButtonDisabled ? 'disabled' : 'idle'}
          whileHover={!isButtonDisabled ? 'hover' : undefined}
          whileTap={!isButtonDisabled ? 'tap' : undefined}
        >
          <div className="flex items-center justify-center space-x-2">
            {actionLoading === 'skip' ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <>
                <span className="text-2xl">⏩</span>
                <span>{t('game.skip', 'Skip')}</span>
              </>
            )}
          </div>
        </motion.button>

        {/* End Turn Button (Manual Mode Only) */}
        {turnMode === 'manual' && onEndTurn && (
          <motion.button
            onClick={handleEndTurn}
            disabled={isButtonDisabled}
            className={`
              h-12 px-4 rounded-xl font-semibold text-base shadow-lg
              transition-all duration-200
              ${isButtonDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white active:bg-blue-700'
              }
            `}
            variants={buttonVariants}
            initial="idle"
            animate={isButtonDisabled ? 'disabled' : 'idle'}
            whileHover={!isButtonDisabled ? 'hover' : undefined}
            whileTap={!isButtonDisabled ? 'tap' : undefined}
          >
            <div className="flex items-center justify-center space-x-2">
              {actionLoading === 'endTurn' ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <span className="text-lg">🏁</span>
                  <span>{t('game.endTurn', 'End Turn')}</span>
                </>
              )}
            </div>
          </motion.button>
        )}
      </div>

      {/* Button Descriptions */}
      <motion.div
        className="text-center space-y-1 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>{t('game.gotItDesc', '✅ Got It: Correct answer, +1 point')}</p>
        <p>{t('game.mistakeDesc', '⚠️ Mistake: Said part of word, -1 penalty')}</p>
        <p>{t('game.skipDesc', '⏩ Skip: Skip card, -1 penalty')}</p>
      </motion.div>

      {/* Penalty Warning */}
      {actionLoading === 'skip' && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex items-center space-x-2 text-red-700">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">
              {t('game.skipWarning', 'Skipping will reduce your movement!')}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ActionButtons;
