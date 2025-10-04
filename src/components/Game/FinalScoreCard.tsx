import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Team, TeamColor } from '../../types/game.types';

interface TeamWithColor extends Team {
  color: TeamColor;
}

interface FinalScoreCardProps {
  teams: TeamWithColor[];
  winner: TeamColor;
}

const FinalScoreCard: React.FC<FinalScoreCardProps> = ({ teams, winner }) => {
  const { t } = useTranslation();

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  const getRankText = (index: number) => {
    switch (index) {
      case 0: return t('gameOver.first');
      case 1: return t('gameOver.second');
      case 2: return t('gameOver.third');
      default: return t('gameOver.fourth');
    }
  };

  const getTeamColorClasses = (color: TeamColor, isWinner: boolean) => {
    const baseClasses = {
      red: 'from-red-100 to-red-200 border-red-300 text-red-800',
      blue: 'from-blue-100 to-blue-200 border-blue-300 text-blue-800',
      green: 'from-green-100 to-green-200 border-green-300 text-green-800',
      yellow: 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800'
    };

    const winnerClasses = {
      red: 'from-red-200 to-red-300 border-red-400 text-red-900 shadow-red-200',
      blue: 'from-blue-200 to-blue-300 border-blue-400 text-blue-900 shadow-blue-200',
      green: 'from-green-200 to-green-300 border-green-400 text-green-900 shadow-green-200',
      yellow: 'from-yellow-200 to-yellow-300 border-yellow-400 text-yellow-900 shadow-yellow-200'
    };

    return isWinner ? winnerClasses[color] : baseClasses[color];
  };

  return (
    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
      <motion.h2 
        className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-4xl">🏆</span>
        {t('gameOver.finalStandings')}
        <span className="text-4xl">🏆</span>
      </motion.h2>

      <div className="space-y-4">
        {teams.map((team, index) => {
          const isWinner = team.color === winner;
          const colorClasses = getTeamColorClasses(team.color, isWinner);
          
          return (
            <motion.div
              key={team.color}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                delay: index * 0.2,
                duration: 0.6,
                type: "spring",
                stiffness: 100
              }}
              className={`
                relative p-4 rounded-xl border-2 bg-gradient-to-r transition-all duration-300
                ${colorClasses}
                ${isWinner ? 'shadow-2xl ring-4 ring-yellow-300 ring-opacity-50' : 'shadow-lg'}
              `}
            >
              {/* Winner Glow Effect */}
              {isWinner && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-200 to-yellow-300 opacity-30"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl">{getRankEmoji(index)}</span>
                    <span className="text-sm font-semibold">{getRankText(index)}</span>
                  </div>

                  {/* Team Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{team.name}</h3>
                      {isWinner && (
                        <motion.span 
                          className="text-2xl"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          👑
                        </motion.span>
                      )}
                    </div>
                    
                    {/* Players */}
                    <div className="text-sm opacity-80">
                      {team.players.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {team.players.map((playerId, playerIndex) => (
                            <span 
                              key={playerIndex}
                              className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-xs"
                            >
                              Player {playerIndex + 1}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="italic">{t('gameOver.noPlayers')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-2xl font-bold mb-1">
                    {team.position}
                  </div>
                  <div className="text-sm opacity-80">
                    {t('gameOver.spaces')}
                  </div>
                  
                  <div className="text-lg font-semibold mt-2">
                    {team.score} {t('gameOver.cards')}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 bg-white bg-opacity-50 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-current opacity-60"
                  initial={{ width: 0 }}
                  animate={{ width: `${(team.position / 50) * 100}%` }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: teams.length * 0.2 + 0.5, duration: 0.6 }}
        className="mt-6 pt-4 border-t border-gray-300 text-center text-gray-600"
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">{t('gameOver.totalTeams')}: </span>
            {teams.length}
          </div>
          <div>
            <span className="font-semibold">{t('gameOver.totalPlayers')}: </span>
            {teams.reduce((sum, team) => sum + team.players.length, 0)}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FinalScoreCard;
