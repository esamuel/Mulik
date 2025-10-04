import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TeamColor } from '../../types/game.types';

interface TurnSummaryProps {
  isOpen: boolean;
  cardsWon: number;
  cardsPassed: number;
  penalties: number;
  movement: number;
  team: TeamColor;
  teamName: string;
  onNextTurn: () => void;
  onClose?: () => void;
}

const TurnSummary: React.FC<TurnSummaryProps> = ({
  isOpen,
  cardsWon,
  cardsPassed,
  penalties,
  movement,
  team,
  teamName,
  onNextTurn,
  onClose,
}) => {
  const { t } = useTranslation();

  const teamConfig = {
    red: { color: '#EF4444', emoji: '🔴', bg: 'from-red-500 to-red-600' },
    blue: { color: '#3B82F6', emoji: '🔵', bg: 'from-blue-500 to-blue-600' },
    green: { color: '#10B981', emoji: '🟢', bg: 'from-green-500 to-green-600' },
    yellow: { color: '#F59E0B', emoji: '🟡', bg: 'from-yellow-500 to-yellow-600' },
  };

  const config = teamConfig[team];
  const isBigWin = cardsWon >= 5;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const pawnVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: movement * 20, // Simulate movement animation
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 0.5,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.bg} p-6 text-white text-center relative`}>
              {isBigWin && (
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'linear-gradient(45deg, #FFD700, #FFA500)',
                      'linear-gradient(45deg, #FFA500, #FFD700)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              
              <motion.div
                className="relative z-10"
                variants={itemVariants}
              >
                <motion.h2
                  className="text-2xl font-bold mb-2"
                  animate={isBigWin ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, -2, 0],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isBigWin ? Infinity : 0,
                  }}
                >
                  {isBigWin ? '🎉 Amazing Turn! 🎉' : t('game.turnComplete', 'Turn Complete!')}
                </motion.h2>
                
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-3xl">{config.emoji}</span>
                  <span className="text-lg font-semibold">{teamName}</span>
                </div>
              </motion.div>

              {/* Celebration Particles */}
              {isBigWin && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -100, 100],
                        x: [0, Math.random() * 100 - 50],
                        rotate: [0, 360],
                        opacity: [1, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.1,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Summary Stats */}
            <div className="p-6 space-y-4">
              <motion.div
                className="space-y-3"
                variants={itemVariants}
              >
                {/* Cards Won */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">✅</span>
                    <span className="font-semibold text-green-800">
                      {t('game.cardsWon', 'Cards Won')}
                    </span>
                  </div>
                  <motion.span
                    className="text-2xl font-bold text-green-600"
                    animate={cardsWon > 0 ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {cardsWon}
                  </motion.span>
                </div>

                {/* Cards Passed */}
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⏭️</span>
                    <span className="font-semibold text-yellow-800">
                      {t('game.cardsPassed', 'Cards Passed')}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {cardsPassed}
                  </span>
                </div>

                {/* Penalties */}
                {penalties > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">❌</span>
                      <span className="font-semibold text-red-800">
                        {t('game.penalties', 'Penalties')}
                      </span>
                    </div>
                    <motion.span
                      className="text-2xl font-bold text-red-600"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: 2,
                      }}
                    >
                      {penalties}
                    </motion.span>
                  </div>
                )}

                {/* Total Movement */}
                <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${config.bg} rounded-lg text-white`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <span className="font-semibold">
                      {t('game.totalMovement', 'Total Movement')}
                    </span>
                  </div>
                  <motion.div
                    className="flex items-center space-x-2"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: 2,
                    }}
                  >
                    <span className="text-3xl font-bold">+{movement}</span>
                    <span className="text-lg">{t('game.spaces', 'spaces')}</span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Pawn Movement Animation */}
              <motion.div
                className="bg-gray-50 rounded-lg p-4 overflow-hidden"
                variants={itemVariants}
              >
                <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  {t('game.pawnMovement', 'Pawn Movement')}
                </h4>
                
                <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
                  {/* Track */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-1 bg-gray-300 rounded-full" />
                  </div>
                  
                  {/* Moving Pawn */}
                  <motion.div
                    className="absolute top-1/2 transform -translate-y-1/2"
                    variants={pawnVariants}
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: config.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {config.emoji}
                  </motion.div>
                  
                  {/* Finish Line */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-2xl">
                    🏁
                  </div>
                </div>
              </motion.div>

              {/* Next Turn Button */}
              <motion.button
                onClick={onNextTurn}
                className={`w-full py-4 bg-gradient-to-r ${config.bg} text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('game.nextTurn', 'Next Turn')} →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TurnSummary;
