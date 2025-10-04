import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';
// TODO: Re-enable these hooks when they're fully implemented
// import { useRoom } from '../hooks/useRoom';
// import { useGameFlow } from '../hooks/useGameFlow';
// import { useTimer } from '../hooks/useTimer';

// Game Components
import GameHeader from '../components/Game/GameHeader';
import GameCard from '../components/Game/GameCard';
import ActionButtons from '../components/Game/ActionButtons';
import TurnSummary from '../components/Game/TurnSummary';
import ScoreBoard from '../components/Game/ScoreBoard';
import Timer from '../components/Game/Timer';
import SpiralBoard from '../components/Board/SpiralBoard';

// UI Components
// import { useToast } from '../components/UI/Toast'; // TODO: Re-enable when needed

import type { Language } from '../types/game.types';

const GamePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  // const { showToast } = useToast(); // TODO: Re-enable when needed

  // Store and hooks
  const { 
    currentCard, 
    teams, 
    currentTurn,
    settings: gameSettings,
    players,
  } = useGameStore();
  // Derived values
  const currentTeam = currentTurn?.team;
  const turnNumber = 1; // TODO: Add turn tracking to store
  const roundNumber = 1; // TODO: Add round tracking to store

  // Simplified implementation without full hooks for now
  const { drawCard, markCardCorrect, markCardPassed, endTurn: storeEndTurn } = useGameStore();
  
  // Local state
  const [isPaused, setIsPaused] = useState(false);
  const [turnSummary, setTurnSummary] = useState<any>(null);
  const [gameFlowLoading] = useState(false); // TODO: Implement loading states
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [clueNumber, setClueNumber] = useState(1);
  const [showBoard, setShowBoard] = useState(false);

  const language = i18n.language as Language;
  const currentTeamData = currentTeam ? teams[currentTeam] : undefined;
  const currentPlayer = currentTurn ? players[currentTurn.speakerId] : undefined;
  const isCurrentPlayerTurn = currentPlayer?.team === currentTeam;

  // Initialize game on mount
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Start the first turn if no card is drawn
    if (!currentCard && isCurrentPlayerTurn) {
      drawCard();
    }
  }, [roomCode, currentCard, isCurrentPlayerTurn, navigate, drawCard]);

  // Handle card reveal
  useEffect(() => {
    if (currentCard && !isCardRevealed) {
      const timer = setTimeout(() => {
        setIsCardRevealed(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentCard, isCardRevealed]);

  // Reset card state when new card is drawn
  useEffect(() => {
    if (currentCard) {
      setIsCardRevealed(false);
      setClueNumber(1);
    }
  }, [currentCard?.id]);

  const handleCorrect = async () => {
    markCardCorrect();
    // Move to next clue or draw new card
    if (clueNumber < 6) {
      setClueNumber(prev => prev + 1);
    } else {
      drawCard();
    }
  };

  const handlePassAction = async () => {
    markCardPassed();
    // Move to next clue
    if (clueNumber < 6) {
      setClueNumber(prev => prev + 1);
    } else {
      drawCard();
    }
  };

  const handleSkipAction = async () => {
    markCardPassed();
    drawCard(); // Skip to new card
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleLeaveGame = () => {
    // TODO: Implement proper leave game logic
    navigate('/');
  };

  const handleNextTurn = () => {
    setTurnSummary(null);
    drawCard(); // Start new turn with new card
  };

  const endTurn = async () => {
    storeEndTurn();
    setTurnSummary({
      cardsWon: currentTurn?.cardsWon || 0,
      cardsPassed: currentTurn?.cardsPassed || 0,
      penalties: currentTurn?.penalties || 0,
      movement: (currentTurn?.cardsWon || 0) - (currentTurn?.penalties || 0),
    });
  };

  // Skip connection check for now - simplified implementation

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Game Header */}
      <GameHeader
        roomCode={roomCode || ''}
        currentTeam={currentTeam}
        currentTeamName={currentTeamData?.name}
        turnNumber={turnNumber}
        roundNumber={roundNumber}
        timeRemaining={currentTurn?.timeRemaining || 0}
        isPaused={isPaused}
        onPauseToggle={handlePauseToggle}
        onShowSettings={() => console.log('Show settings')}
        onLeaveGame={handleLeaveGame}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Score & Board Toggle */}
          <div className="space-y-4">
            <ScoreBoard
              teams={Object.values(teams)}
              currentTeam={currentTeam}
              isCompact={false}
              showProgress={true}
              maxScore={100}
            />

            <motion.button
              onClick={() => setShowBoard(!showBoard)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">🎯</span>
                <span>{showBoard ? t('game.hideBoard', 'Hide Board') : t('game.showBoard', 'Show Board')}</span>
              </div>
            </motion.button>
          </div>
          {/* Center Column - Game Card & Actions */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="flex justify-center">
              <Timer
                duration={gameSettings.turnDuration}
                onComplete={() => endTurn()}
                size="large"
              />
            </div>

            {/* Game Card */}
            <GameCard
              card={currentCard || undefined}
              clueNumber={clueNumber}
              language={language}
              isRevealed={isCardRevealed}
              isFlipping={gameFlowLoading}
            />

            {/* Action Buttons */}
            <ActionButtons
              onCorrect={handleCorrect}
              onPass={handlePassAction}
              onSkip={handleSkipAction}
              onEndTurn={endTurn}
              disabled={!isCardRevealed || gameFlowLoading}
              turnMode="manual"
              isCurrentPlayerTurn={isCurrentPlayerTurn}
              currentTeamName={currentTeamData?.name}
              loading={gameFlowLoading}
            />
          </div>

          {/* Right Column - Compact Score (Mobile) or Additional Info */}
          <div className="lg:hidden">
            <ScoreBoard
              teams={Object.values(teams)}
              currentTeam={currentTeam}
              isCompact={true}
              showProgress={false}
            />
          </div>

          {/* Right Column - Game Info (Desktop) */}
          <div className="hidden lg:block space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t('game.gameInfo', 'Game Info')}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('game.currentClue', 'Current Clue')}:</span>
                  <span className="font-semibold">{clueNumber}/6</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('game.turnDuration', 'Turn Duration')}:</span>
                  <span className="font-semibold">{gameSettings.turnDuration}s</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('game.gameMode', 'Game Mode')}:</span>
                  <span className="font-semibold capitalize">manual</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">{t('game.language', 'Language')}:</span>
                  <span className="font-semibold uppercase">{language}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t('game.quickActions', 'Quick Actions')}
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setShowBoard(!showBoard)}
                  className="w-full py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  {showBoard ? '🎯 Hide Board' : '🎯 Show Board'}
                </button>
                
                <button
                  onClick={() => console.log('Show settings')}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board (Collapsible) */}
        <AnimatePresence>
          {showBoard && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {t('game.gameBoard', 'Game Board')}
                </h3>
                <button
                  onClick={() => setShowBoard(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <SpiralBoard
                teams={teams}
                currentTeam={currentTeam}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Turn Summary Modal */}
      <TurnSummary
        isOpen={!!turnSummary}
        cardsWon={turnSummary?.cardsWon || 0}
        cardsPassed={turnSummary?.cardsPassed || 0}
        penalties={turnSummary?.penalties || 0}
        movement={turnSummary?.movement || 0}
        team={currentTeam || 'red'}
        teamName={currentTeamData?.name || ''}
        onNextTurn={handleNextTurn}
        onClose={() => setTurnSummary(null)}
      />

      {/* Settings Modal */}
      {/* TODO: Implement SettingsModal component */}
      
      {/* Loading Overlay */}
      {gameFlowLoading && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GamePage;
