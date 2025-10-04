import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Card, Language } from '../../types/game.types';

interface GameCardProps {
  card?: Card;
  clueNumber?: number;
  language: Language;
  isRevealed?: boolean;
  isFlipping?: boolean;
  onFlipComplete?: () => void;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({
  card,
  clueNumber = 1,
  language,
  isRevealed = false,
  isFlipping = false,
  onFlipComplete,
  className = '',
}) => {
  const { t } = useTranslation();

  // Get the clue text based on language and clue number
  const getClueText = (): string => {
    if (!card || !card.clues || card.clues.length === 0) return '';
    
    // Use the clues array (cards are language-specific, loaded based on current language)
    return card.clues[clueNumber - 1] || card.clues[0] || '';
  };

  // Get category display name
  const getCategoryName = (): string => {
    if (!card || !card.category) return '';
    // Category is already in the correct language based on which card set was loaded
    return card.category;
  };

  // Card flip variants
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
    back: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
      },
    },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        delay: 0.3,
      },
    },
  };

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Card Container */}
      <motion.div
        className="relative w-full h-64 md:h-80"
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
        initial="front"
        animate={isRevealed ? 'back' : 'front'}
        variants={cardVariants}
        onAnimationComplete={onFlipComplete}
      >
        {/* Card Front (MULIK Logo) */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white">
            <div className="text-center text-white">
              <motion.div
                className="text-6xl md:text-8xl font-bold mb-4"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                MULIK
              </motion.div>
              <div className="text-lg md:text-xl opacity-80">
                {t('game.cardGame', 'Card Game')}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Back (Clue Display) */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border-4 border-gray-200 p-6 flex flex-col">
            
            {/* Category Badge */}
            <motion.div
              className="flex justify-between items-center mb-4"
              variants={contentVariants}
              initial="hidden"
              animate={isRevealed ? 'visible' : 'hidden'}
            >
              <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {getCategoryName()}
              </div>
              
              {/* Clue Number Indicator */}
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <motion.div
                    key={num}
                    className={`w-3 h-3 rounded-full ${
                      num <= clueNumber
                        ? 'bg-purple-500'
                        : 'bg-gray-300'
                    }`}
                    animate={{
                      scale: num === clueNumber ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: num === clueNumber ? Infinity : 0,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Clue Text */}
            <motion.div
              className="flex-1 flex items-center justify-center"
              variants={contentVariants}
              initial="hidden"
              animate={isRevealed ? 'visible' : 'hidden'}
            >
              <div className="text-center">
                <motion.h2
                  className={`font-bold text-gray-800 leading-tight ${
                    language === 'he' ? 'text-right' : 'text-left'
                  } ${
                    getClueText().length > 20 
                      ? 'text-2xl md:text-3xl' 
                      : 'text-3xl md:text-4xl'
                  }`}
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {getClueText()}
                </motion.h2>
                
                {/* Clue Number Display */}
                <motion.div
                  className="mt-4 text-sm text-gray-500 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {t('game.clueNumber', 'Clue {{number}}', { number: clueNumber })}
                </motion.div>
              </div>
            </motion.div>

            {/* Card Footer */}
            <motion.div
              className="flex justify-between items-center text-xs text-gray-400"
              variants={contentVariants}
              initial="hidden"
              animate={isRevealed ? 'visible' : 'hidden'}
            >
              <span>{t('game.difficulty', card?.difficulty || 'medium')}</span>
              <span>ID: {card?.id.slice(-4) || '----'}</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Flip Animation Overlay */}
      {isFlipping && (
        <motion.div
          className="absolute inset-0 bg-white bg-opacity-50 rounded-2xl flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      )}

      {/* Card Effects */}
      {isRevealed && (
        <>
          {/* Glow Effect */}
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-3xl opacity-20 blur-lg"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Sparkle Effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 2) * 80}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default React.memo(GameCard);
