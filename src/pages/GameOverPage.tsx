import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import VictoryAnimation from '../components/Game/VictoryAnimation';
import FinalScoreCard from '../components/Game/FinalScoreCard';
import GameStats from '../components/Game/GameStats';
import ShareResults from '../components/Game/ShareResults';
import { soundService } from '../services/soundService';
import { TeamColor } from '../types/game.types';

const GameOverPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { 
    teams, 
    winner, 
    gameSettings, 
    currentTurn,
    resetGame,
    isGameComplete 
  } = useGameStore();

  const [showCelebration, setShowCelebration] = useState(true);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Redirect if game is not complete
    if (!isGameComplete || !winner) {
      navigate(`/game/${roomCode}`);
      return;
    }

    // Play victory sound
    soundService.playVictory();

    // Show celebration for 5 seconds, then show results
    const timer = setTimeout(() => {
      setShowCelebration(false);
      setShowResults(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isGameComplete, winner, roomCode, navigate]);

  const handlePlayAgain = () => {
    resetGame();
    navigate(`/lobby/${roomCode}`);
  };

  const handleNewGame = () => {
    navigate('/create');
  };

  const handleExitToHome = () => {
    navigate('/');
  };

  if (!winner || !isGameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('gameOver.loading')}</p>
        </div>
      </div>
    );
  }

  const winningTeam = teams[winner];
  const sortedTeams = Object.entries(teams)
    .map(([color, team]) => ({ ...team, color: color as TeamColor }))
    .sort((a, b) => b.position - a.position);

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Dynamic Background based on winning team */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ${
          winner === 'red' ? 'from-red-400 via-red-500 to-red-600' :
          winner === 'blue' ? 'from-blue-400 via-blue-500 to-blue-600' :
          winner === 'green' ? 'from-green-400 via-green-500 to-green-600' :
          'from-yellow-400 via-yellow-500 to-yellow-600'
        }`}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      <AnimatePresence mode="wait">
        {showCelebration && (
          <VictoryAnimation 
            key="celebration"
            winningTeam={winner}
            teamName={winningTeam.name}
            confetti={true}
          />
        )}

        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 min-h-screen p-4 overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center text-white mb-8"
              >
                <h1 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-lg">
                  {t('gameOver.gameComplete')}
                </h1>
                <div className="flex items-center justify-center gap-4 text-2xl md:text-4xl">
                  <span className="text-4xl md:text-6xl">🏆</span>
                  <span className="font-semibold drop-shadow-md">
                    {t('gameOver.winner', { team: winningTeam.name })}
                  </span>
                  <span className="text-4xl md:text-6xl">🏆</span>
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Final Scores */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <FinalScoreCard 
                    teams={sortedTeams}
                    winner={winner}
                  />
                </motion.div>

                {/* Game Statistics */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <GameStats 
                    teams={teams}
                    gameSettings={gameSettings}
                    currentTurn={currentTurn}
                  />
                </motion.div>
              </div>

              {/* Share Results */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex justify-center"
              >
                <ShareResults 
                  winner={winner}
                  winnerName={winningTeam.name}
                  teams={sortedTeams}
                  roomCode={roomCode || ''}
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-4 pb-8"
              >
                <button
                  onClick={handlePlayAgain}
                  className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-2xl">🔄</span>
                  {t('gameOver.playAgain')}
                </button>

                <button
                  onClick={handleNewGame}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-2xl">🎮</span>
                  {t('gameOver.newGame')}
                </button>

                <button
                  onClick={handleExitToHome}
                  className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-2xl">🏠</span>
                  {t('gameOver.exitToHome')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameOverPage;
