import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Team, TeamColor, Player } from '../../types/game.types';

interface ScoreBoardProps {
  teams: Team[];
  currentTeam?: TeamColor;
  players?: Record<string, Player>; // Add players to count correctly
  isCompact?: boolean;
  showProgress?: boolean;
  maxScore?: number;
  className?: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  teams,
  currentTeam,
  players = {},
  isCompact = false,
  showProgress = true,
  maxScore = 100,
  className = '',
}) => {
  const { t } = useTranslation();

  // Helper function to count actual players in a team
  const getPlayerCount = (team: Team): number => {
    if (!team.players || !Array.isArray(team.players)) return 0;
    // Count how many player IDs in team.players actually exist in players object
    return team.players.filter(playerId => players[playerId]).length;
  };

  const teamConfig = {
    red: { color: '#EF4444', emoji: '🔴', bg: 'from-red-500 to-red-600', light: 'bg-red-50' },
    blue: { color: '#3B82F6', emoji: '🔵', bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50' },
    green: { color: '#10B981', emoji: '🟢', bg: 'from-green-500 to-green-600', light: 'bg-green-50' },
    yellow: { color: '#F59E0B', emoji: '🟡', bg: 'from-yellow-500 to-yellow-600', light: 'bg-yellow-50' },
  };

  // Filter to only show teams with players, then sort by score (highest first)
  // If no active teams found, show all teams (game might be starting)
  const activeTeams = teams.filter(team => getPlayerCount(team) > 0);
  const teamsToShow = activeTeams.length > 0 ? activeTeams : teams;
  const sortedTeams = [...teamsToShow].sort((a, b) => b.score - a.score);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const teamVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  if (isCompact) {
    return (
      <motion.div
        className={`flex flex-wrap gap-2 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {sortedTeams.map((team, index) => {
          const config = teamConfig[team.color];
          const isCurrentTeam = currentTeam === team.color;
          const isLeading = index === 0 && team.score > 0;

          return (
            <motion.div
              key={team.color}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg shadow-sm
                ${isCurrentTeam ? `bg-gradient-to-r ${config.bg} text-white` : config.light}
                ${isLeading ? 'ring-2 ring-yellow-400' : ''}
              `}
              variants={teamVariants}
              whileHover={{ scale: 1.05 }}
              animate={isCurrentTeam ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: isCurrentTeam ? Infinity : 0,
              }}
            >
              <span className="text-lg">{config.emoji}</span>
              <span className={`font-semibold text-sm ${isCurrentTeam ? 'text-white' : 'text-gray-800'}`}>
                {team.name}
              </span>
              <span className={`font-bold ${isCurrentTeam ? 'text-white' : 'text-gray-900'}`}>
                {team.score}
              </span>
              {isLeading && (
                <motion.span
                  className="text-yellow-400"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  👑
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {t('game.scoreboard', 'Scoreboard')}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{t('game.target', 'Target')}: {maxScore}</span>
          <span className="text-lg">🎯</span>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        {sortedTeams.map((team, index) => {
          const config = teamConfig[team.color];
          const isCurrentTeam = currentTeam === team.color;
          const isLeading = index === 0 && team.score > 0;
          const progressPercentage = Math.min((team.score / maxScore) * 100, 100);

          return (
            <motion.div
              key={team.color}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300
                ${isCurrentTeam 
                  ? `border-${team.color}-400 bg-gradient-to-r ${config.bg} text-white shadow-lg` 
                  : `border-gray-200 ${config.light} hover:border-${team.color}-300`
                }
                ${isLeading ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
              `}
              variants={teamVariants}
              whileHover={{ scale: 1.02 }}
              animate={isCurrentTeam ? {
                boxShadow: [
                  '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '0 8px 25px rgba(0, 0, 0, 0.2)',
                  '0 4px 6px rgba(0, 0, 0, 0.1)',
                ],
              } : {}}
              transition={{
                duration: 2,
              }}
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.emoji}</span>
                  <div>
                    <h4 className={`font-bold text-lg ${isCurrentTeam ? 'text-white' : 'text-gray-800'}`}>
                      {team.name}
                    </h4>
                    <p className={`text-sm ${isCurrentTeam ? 'text-white opacity-90' : 'text-gray-500'}`}>
                      {getPlayerCount(team)} {t('game.players', 'players')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <motion.div
                    className={`text-3xl font-bold ${isCurrentTeam ? 'text-white' : 'text-gray-900'}`}
                    animate={team.score > (team as any).previousScore ? {
                      scale: [1, 1.3, 1],
                      color: ['#10B981', '#059669', '#10B981'],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {team.score}
                  </motion.div>
                  <div className={`text-sm ${isCurrentTeam ? 'text-white opacity-90' : 'text-gray-500'}`}>
                    {t('game.points', 'points')}
                  </div>
                </div>
              </div>

              {/* 1..8 Word Index Strip */}
              <div className="mt-2 flex gap-1">
                {[1,2,3,4,5,6,7,8].map((num) => {
                  const fallback = team.position === 0 ? 1 : (((team.position - 1) % 8) + 1);
                  const activeNum = team.wordIndex ?? fallback;
                  const isActive = num === activeNum;
                  return (
                    <span
                      key={num}
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border ${isCurrentTeam ? 'border-white/60' : 'border-gray-300'} ${isActive ? '' : isCurrentTeam ? 'bg-white/20 text-white' : 'bg-white text-gray-700'}`}
                      style={isActive ? { backgroundColor: config.color, color: '#fff' } : undefined}
                      title={t('game.wordNumber', 'Word {{number}}/8', { number: num })}
                    >
                      {num}
                    </span>
                  );
                })}
              </div>

                {/* Leading Crown */}
                {isLeading && (
                  <motion.div
                    className="absolute -top-2 -right-2 text-2xl"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    👑
                  </motion.div>
                )}


              {/* Progress Bar */}
              {showProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isCurrentTeam ? 'text-white opacity-90' : 'text-gray-600'}>
                      {t('game.progress', 'Progress')}
                    </span>
                    <span className={isCurrentTeam ? 'text-white opacity-90' : 'text-gray-600'}>
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className={`w-full h-3 rounded-full overflow-hidden ${
                    isCurrentTeam ? 'bg-white bg-opacity-30' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      className={`h-full rounded-full ${
                        isCurrentTeam 
                          ? 'bg-white' 
                          : `bg-gradient-to-r ${config.bg}`
                      }`}
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ 
                        duration: 1,
                        ease: 'easeOut',
                        delay: index * 0.2,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Player List (resolve IDs to names) */}
              <div className="mt-3 flex flex-wrap gap-1">
                {team.players.map((playerId) => {
                  const p = players[playerId];
                  if (!p) return null;
                  return (
                    <span
                      key={playerId}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${isCurrentTeam ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      {p.name}
                    </span>
                  );
                })}
              </div>

              {/* Last Turn Result */}
              {typeof team.lastMovement !== 'undefined' && (
                <div className={`mt-3 p-3 rounded-lg ${isCurrentTeam ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{t('game.lastTurn', 'Last turn')}</span>
                    <span className={`font-bold ${team.lastMovement! >= 0 ? 'text-green-600' : 'text-red-600'} ${isCurrentTeam ? 'text-white' : ''}`}>
                      {team.lastMovement! >= 0 ? '+' : ''}{team.lastMovement} {t('game.spaces', 'spaces')}
                    </span>
                  </div>
                  <div className={`mt-1 text-xs ${isCurrentTeam ? 'text-white/90' : 'text-gray-600'}`}>
                    {t('game.cardsWon', 'Cards Won')}: {team.lastCardsWon || 0} · {t('game.cardsPassed', 'Cards Passed')}: {team.lastPassed || 0} · {t('game.penalties', 'Penalties')}: {team.lastPenalties || 0}
                  </div>
                </div>
              )}

              {/* Current Turn Indicator */}
              {isCurrentTeam && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-white border-opacity-50 pointer-events-none"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Game Status */}
      <motion.div
        className="mt-6 p-4 bg-gray-50 rounded-xl text-center"
        variants={teamVariants}
      >
        {sortedTeams[0]?.score >= maxScore ? (
          <div className="space-y-2">
            <div className="text-2xl">🎉</div>
            <div className="font-bold text-lg text-gray-800">
              {t('game.gameComplete', 'Game Complete!')}
            </div>
            <div className="text-sm text-gray-600">
              {t('game.winner', '{{team}} wins!', { team: sortedTeams[0].name })}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              {t('game.nextToWin', 'Next to win')}
            </div>
            <div className="font-semibold text-gray-800">
              {maxScore - sortedTeams[0]?.score || maxScore} {t('game.pointsNeeded', 'points needed')}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ScoreBoard;
