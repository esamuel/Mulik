import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Team, GameSettings, CurrentTurn } from '../../types/game.types';

interface GameStatsProps {
  teams: Record<string, Team>;
  gameSettings: GameSettings;
  currentTurn: CurrentTurn | null;
}

interface StatItem {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

const GameStats: React.FC<GameStatsProps> = ({ teams, gameSettings, currentTurn }) => {
  const { t } = useTranslation();
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Calculate game statistics
  const calculateStats = () => {
    const teamsArray = Object.values(teams);
    const totalCards = teamsArray.reduce((sum, team) => sum + team.score, 0);
    const totalPlayers = teamsArray.reduce((sum, team) => sum + team.players.length, 0);
    
    // Mock data for demonstration - in real app, this would come from game history
    const gameDuration = 23; // minutes
    const totalRounds = 1; // Mock data - in real app would come from game history
    const fastestTurn = 45; // seconds
    const longestStreak = Math.max(...teamsArray.map(team => team.score));
    const mostActiveTeam = teamsArray.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );

    return {
      duration: gameDuration,
      totalCards,
      totalPlayers,
      totalRounds,
      fastestTurn,
      longestStreak,
      mostActiveTeam: mostActiveTeam.name,
      averageCardsPerRound: Math.round(totalCards / totalRounds)
    };
  };

  const stats = calculateStats();

  const statItems: StatItem[] = [
    {
      icon: '⏱️',
      label: t('gameOver.stats.duration'),
      value: `${stats.duration} ${t('gameOver.stats.minutes')}`,
      color: 'text-blue-600'
    },
    {
      icon: '🎴',
      label: t('gameOver.stats.totalCards'),
      value: stats.totalCards,
      color: 'text-purple-600'
    },
    {
      icon: '🔄',
      label: t('gameOver.stats.totalRounds'),
      value: stats.totalRounds,
      color: 'text-green-600'
    },
    {
      icon: '⚡',
      label: t('gameOver.stats.fastestTurn'),
      value: `${stats.fastestTurn}${t('gameOver.stats.seconds')}`,
      color: 'text-yellow-600'
    },
    {
      icon: '🔥',
      label: t('gameOver.stats.longestStreak'),
      value: `${stats.longestStreak} ${t('gameOver.stats.cards')}`,
      color: 'text-red-600'
    },
    {
      icon: '👥',
      label: t('gameOver.stats.totalPlayers'),
      value: stats.totalPlayers,
      color: 'text-indigo-600'
    },
    {
      icon: '📊',
      label: t('gameOver.stats.avgPerRound'),
      value: `${stats.averageCardsPerRound} ${t('gameOver.stats.cards')}`,
      color: 'text-teal-600'
    },
    {
      icon: '🏆',
      label: t('gameOver.stats.mostActive'),
      value: stats.mostActiveTeam,
      color: 'text-orange-600'
    }
  ];

  // Animate numbers counting up
  useEffect(() => {
    const animateValue = (key: string, endValue: number) => {
      let startValue = 0;
      const duration = 2000; // 2 seconds
      const increment = endValue / (duration / 16); // 60fps

      const timer = setInterval(() => {
        startValue += increment;
        if (startValue >= endValue) {
          startValue = endValue;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, [key]: Math.floor(startValue) }));
      }, 16);

      return timer;
    };

    const timers: ReturnType<typeof setInterval>[] = [];
    
    // Animate numeric values
    timers.push(animateValue('totalCards', stats.totalCards));
    timers.push(animateValue('totalRounds', stats.totalRounds));
    timers.push(animateValue('fastestTurn', stats.fastestTurn));
    timers.push(animateValue('longestStreak', stats.longestStreak));
    timers.push(animateValue('totalPlayers', stats.totalPlayers));
    timers.push(animateValue('averageCardsPerRound', stats.averageCardsPerRound));
    timers.push(animateValue('duration', stats.duration));

    return () => timers.forEach(timer => clearInterval(timer));
  }, [stats]);

  const getAnimatedValue = (key: string, originalValue: string | number): string => {
    if (typeof originalValue === 'number' && animatedValues[key] !== undefined) {
      return animatedValues[key].toString();
    }
    return originalValue.toString();
  };

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
      <motion.h2 
        className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-4xl">📊</span>
        {t('gameOver.gameStatistics')}
        <span className="text-4xl">📊</span>
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{stat.icon}</div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.label.includes('totalCards') ? getAnimatedValue('totalCards', stat.value) :
                   stat.label.includes('totalRounds') ? getAnimatedValue('totalRounds', stat.value) :
                   stat.label.includes('fastestTurn') ? `${getAnimatedValue('fastestTurn', stats.fastestTurn)}${t('gameOver.stats.seconds')}` :
                   stat.label.includes('longestStreak') ? `${getAnimatedValue('longestStreak', stats.longestStreak)} ${t('gameOver.stats.cards')}` :
                   stat.label.includes('totalPlayers') ? getAnimatedValue('totalPlayers', stat.value) :
                   stat.label.includes('avgPerRound') ? `${getAnimatedValue('averageCardsPerRound', stats.averageCardsPerRound)} ${t('gameOver.stats.cards')}` :
                   stat.label.includes('duration') ? `${getAnimatedValue('duration', stats.duration)} ${t('gameOver.stats.minutes')}` :
                   stat.value}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fun Facts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-6 pt-4 border-t border-gray-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          {t('gameOver.funFacts')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <motion.div 
            className="bg-blue-50 text-blue-800 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="font-semibold">{t('gameOver.facts.gameMode')}: </span>
            {t('gameOver.facts.classic')}
          </motion.div>
          
          <motion.div 
            className="bg-green-50 text-green-800 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="font-semibold">{t('gameOver.facts.turnDuration')}: </span>
            {gameSettings.turnDuration || 60}{t('gameOver.stats.seconds')}
          </motion.div>
          
          <motion.div 
            className="bg-purple-50 text-purple-800 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="font-semibold">{t('gameOver.facts.language')}: </span>
            {gameSettings.language === 'he' ? 'עברית' : 'English'}
          </motion.div>
          
          <motion.div 
            className="bg-orange-50 text-orange-800 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="font-semibold">{t('gameOver.facts.difficulty')}: </span>
            {gameSettings.difficulty || t('gameOver.facts.medium')}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameStats;
