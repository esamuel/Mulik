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

  // No-op helper removed (word displayed inline from props)

  // Flip transition config
  const flipTransition = { duration: 0.6, ease: 'easeInOut' as const };

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
      {/* Perspective wrapper */}
      <div
        className="relative w-full h-96 md:h-[500px]"
        style={{ perspective: '1000px', WebkitPerspective: '1000px' as any }}
      >
        {/* Card Container (the element that rotates) */}
        <motion.div
          className="relative w-full h-full"
          style={{ 
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d' as any,
            willChange: 'transform'
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={flipTransition}
          onAnimationComplete={onFlipComplete}
        >
        {/* Card Front (MULIK Logo) */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
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
            
            {/* Word Number and Category */}
            <motion.div
              className="flex justify-between items-center mb-3 px-2"
              variants={contentVariants}
              initial="hidden"
              animate={isRevealed ? 'visible' : 'hidden'}
            >
              <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {t('game.wordNumber', 'Word {{number}}/8', { number: clueNumber })}
              </div>
              {card?.category && (
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {card.category}
                </div>
              )}
            </motion.div>

            {/* All 8 Words List */}
            <motion.div
              className="flex-1 overflow-y-auto px-4 py-2"
              variants={contentVariants}
              initial="hidden"
              animate={isRevealed ? 'visible' : 'hidden'}
            >
              <div className={`w-full space-y-1.5 ${language === 'he' ? 'text-right' : 'text-left'}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
                {card?.words?.map((word, index) => {
                  const wordNumber = index + 1;
                  const isCurrentWord = wordNumber === clueNumber;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`flex items-center gap-2 py-1.5 px-3 rounded-lg ${
                        isCurrentWord 
                          ? 'bg-purple-100 border-2 border-purple-500' 
                          : 'bg-white border border-gray-200'
                      }`}
                      animate={{
                        scale: isCurrentWord ? [1, 1.01, 1] : 1,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isCurrentWord ? Infinity : 0,
                      }}
                    >
                      <span className={`font-bold min-w-[24px] ${
                        isCurrentWord ? 'text-purple-600 text-lg' : 'text-gray-500 text-base'
                      }`}>
                        {wordNumber}.
                      </span>
                      <span className={`font-semibold ${
                        isCurrentWord ? 'text-purple-900 text-lg' : 'text-gray-700 text-base'
                      }`}>
                        {word}
                      </span>
                      {isCurrentWord && (
                        <motion.span
                          className="ml-auto text-purple-600 font-bold text-sm"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ← {t('game.explainThis', 'Explain this!')}
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
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
        {/* End of back face */}
        {/* Close rotating container */}
        </motion.div>
      </div>

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
