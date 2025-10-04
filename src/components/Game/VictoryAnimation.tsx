import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { TeamColor } from '../../types/game.types';

interface VictoryAnimationProps {
  winningTeam: TeamColor;
  teamName: string;
  confetti: boolean;
}

// Simple confetti particle component
const ConfettiParticle: React.FC<{ 
  color: string; 
  delay: number; 
  x: number; 
  duration: number;
}> = ({ color, delay, x, duration }) => {
  return (
    <motion.div
      className={`absolute w-3 h-3 ${color} rounded-full`}
      initial={{ 
        y: -20, 
        x: x,
        opacity: 1,
        rotate: 0,
        scale: 1
      }}
      animate={{ 
        y: window.innerHeight + 50,
        rotate: 360,
        scale: [1, 0.8, 1.2, 0.6],
        opacity: [1, 0.8, 0.6, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
};

// Generate confetti particles
const generateConfetti = (teamColor: TeamColor, count: number = 50) => {
  const colors = {
    red: ['bg-red-400', 'bg-red-500', 'bg-red-600', 'bg-pink-400', 'bg-orange-400'],
    blue: ['bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-cyan-400', 'bg-indigo-400'],
    green: ['bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-emerald-400', 'bg-lime-400'],
    yellow: ['bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-amber-400', 'bg-orange-400']
  };

  const teamColors = colors[teamColor];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: teamColors[Math.floor(Math.random() * teamColors.length)],
    delay: Math.random() * 3,
    x: Math.random() * window.innerWidth,
    duration: 3 + Math.random() * 2
  }));
};

const VictoryAnimation: React.FC<VictoryAnimationProps> = ({
  winningTeam,
  teamName,
  confetti
}) => {
  const { t } = useTranslation();
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState(0);

  const celebrationMessages = [
    t('gameOver.victory'),
    t('gameOver.congratulations'),
    t('gameOver.amazing'),
    t('gameOver.wellPlayed')
  ];

  useEffect(() => {
    if (confetti) {
      setConfettiParticles(generateConfetti(winningTeam, 60));
    }

    // Cycle through celebration messages
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % celebrationMessages.length);
    }, 1000);

    return () => clearInterval(messageInterval);
  }, [winningTeam, confetti, celebrationMessages.length]);

  const teamColorClasses = {
    red: 'from-red-400 to-red-600',
    blue: 'from-blue-400 to-blue-600', 
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${teamColorClasses[winningTeam]}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Confetti Particles */}
      {confetti && confettiParticles.map(particle => (
        <ConfettiParticle
          key={particle.id}
          color={particle.color}
          delay={particle.delay}
          x={particle.x}
          duration={particle.duration}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4">
        
        {/* Trophy Animation */}
        <motion.div
          className="text-8xl md:text-9xl mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.6, 1],
            ease: "easeOut"
          }}
        >
          🏆
        </motion.div>

        {/* Game Over Text */}
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {t('gameOver.gameComplete')}
        </motion.h1>

        {/* Winner Announcement */}
        <motion.div
          className="text-3xl md:text-5xl font-semibold mb-8 drop-shadow-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-4xl md:text-6xl">🎉</span>
            <span>{t('gameOver.winner', { team: teamName })}</span>
            <span className="text-4xl md:text-6xl">🎉</span>
          </div>
        </motion.div>

        {/* Cycling Celebration Messages */}
        <motion.div
          className="text-xl md:text-2xl font-medium mb-8 h-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="drop-shadow-md"
            >
              {celebrationMessages[currentMessage]}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Fireworks Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: 2 + (i * 0.2),
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* Loading indicator for next screen */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 text-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <span>{t('gameOver.loadingResults')}</span>
          </div>
        </motion.div>
      </div>

      {/* Sparkle overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300 text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            initial={{ scale: 0, opacity: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: 360
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 4,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VictoryAnimation;
