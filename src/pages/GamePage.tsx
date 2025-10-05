import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';
import { useRoom } from '../hooks/useRoom';
import { useCards } from '../hooks/useCards';
// TODO: Re-enable these hooks when they're fully implemented
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

import type { Language, Card } from '../types/game.types';

const GamePage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  // const { showToast } = useToast(); // TODO: Re-enable when needed

  // Store and hooks
  const { 
    teams: localTeams, 
    currentTurn: localCurrentTurn,
    settings: gameSettings,
    players: localPlayers,
  } = useGameStore();
  
  // Get Firebase room data for real-time sync
  const {
    room,
    loading: roomLoading,
  } = useRoom(roomCode || null);
  
  // Use Firebase data if available, otherwise fall back to local
  const teams = room?.teams || localTeams;
  const players = room?.players || localPlayers;
  const currentTurn = room?.currentTurn || localCurrentTurn;
  
  // Load actual cards from database
  const {
    currentCard: cardFromHook,
    getNextCard,
    loading: cardsLoading,
  } = useCards({
    language: i18n.language as Language,
  });
  
  // Use card from hook or local state
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  // Derived values
  const currentTeam = currentTurn?.team;
  const turnNumber = 1; // TODO: Add turn tracking to store
  const roundNumber = 1; // TODO: Add round tracking to store

  // Simplified implementation without full hooks for now
  const { markCardCorrect, markCardPassed, endTurn: storeEndTurn } = useGameStore();
  
  // Custom drawCard function that uses real cards
  const drawCard = () => {
    const nextCard = getNextCard();
    if (nextCard) {
      setCurrentCard(nextCard);
      console.log('🎴 Drew new card:', nextCard.id, nextCard.category);
      return nextCard;
    } else {
      console.warn('⚠️ No more cards available');
      return null;
    }
  };
  
  // Local state
  const [isPaused, setIsPaused] = useState(false);
  const [turnSummary, setTurnSummary] = useState<any>(null);
  const [gameFlowLoading] = useState(false); // TODO: Implement loading states
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [clueNumber, setClueNumber] = useState(1); // Still track for UI, but use boardBasedClueNumber for actual clue
  const [showBoard, setShowBoard] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false); // Track if timer has ended

  const language = i18n.language as Language;
  const currentTeamData = currentTeam ? teams[currentTeam] : undefined;
  const currentPlayer = currentTurn ? players[currentTurn.speakerId] : undefined;
  const isCurrentPlayerTurn = currentPlayer?.team === currentTeam;

  // Calculate clue number based on team's board position
  // Clue number = (position % 8) + 1, so position 0-7 = clue 1-8, position 8-15 = clue 1-8, etc.
  const calculateClueNumber = (position: number): number => {
    if (position === 0) return 1; // Start position
    return ((position - 1) % 8) + 1;
  };

  // Get the clue number for current team based on their board position
  const boardBasedClueNumber = currentTeamData ? calculateClueNumber(currentTeamData.position) : 1;

  // Initialize game on mount
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
      return;
    }

    // Start the first turn if no card is drawn and cards are loaded
    if (!currentCard && !cardsLoading) {
      console.log('🎮 Initializing first card...');
      drawCard();
    }
  }, [roomCode, currentCard, cardsLoading]);

  // Handle card reveal - runs when card ID changes
  useEffect(() => {
    if (currentCard) {
      console.log('🎴 Card loaded, revealing...', currentCard);
      console.log('📝 Card words:', currentCard.words);
      console.log(`🎯 Word number based on board position: ${boardBasedClueNumber}`);
      console.log(`📍 Word to explain: ${currentCard.words?.[boardBasedClueNumber - 1]}`);
      
      // Reset state first
      setIsCardRevealed(false);
      // DON'T reset clue number - it's based on board position!
      
      // Then reveal after delay
      const timer = setTimeout(() => {
        setIsCardRevealed(true);
        console.log('✨ Card revealed! Buttons should be enabled now.');
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [currentCard?.id, boardBasedClueNumber]);

  const handleCorrect = async () => {
    console.log('✅ Correct button clicked!', { 
      boardBasedClueNumber, 
      teamPosition: currentTeamData?.position,
      currentCard 
    });
    
    // Update local store
    markCardCorrect();
    
    // Update Firebase if we have a room and current turn
    if (roomCode && currentTurn) {
      try {
        const { updateTeamScore } = await import('../services/roomService');
        await updateTeamScore(roomCode, currentTurn.team, 1);
        console.log(`💰 Score updated for team ${currentTurn.team}`);
      } catch (error) {
        console.error('Failed to update score:', error);
      }
    }
    
    // NEW RULE: Always draw a new card when guessed correctly
    // The clue number stays the same (based on board position)
    console.log(`📦 Word guessed! Drawing new card with same clue number (${boardBasedClueNumber})...`);
    const newCard = drawCard();
    console.log('🆕 New card drawn:', newCard?.id);
  };

  const handlePassAction = async () => {
    console.log('⏭️ Pass button clicked!', { boardBasedClueNumber, currentCard });
    markCardPassed();
    // NEW RULE: Pass also draws a new card (same clue number based on position)
    console.log(`📦 Passed! Drawing new card with same clue number (${boardBasedClueNumber})...`);
    drawCard();
  };

  const handleSkipAction = async () => {
    console.log('⏩ Skip button clicked!', { currentCard });
    markCardPassed();
    drawCard(); // Skip to new card
  };

  const handleMistake = async () => {
    console.log('⚠️ Mistake button clicked! Explainer said part of the word', { currentCard });
    // Mark as mistake (will count as -1 in movement calculation)
    markCardPassed(); // Use same tracking for now, will separate later
    drawCard(); // Draw new card
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
    setIsTimeUp(false); // Reset timer flag for next turn
    drawCard(); // Start new turn with new card
  };

  const handleTimerComplete = () => {
    console.log('⏰ Time is up! Disabling buttons...');
    setIsTimeUp(true);
    // Automatically end turn when time runs out
    setTimeout(() => {
      endTurn();
    }, 1000); // Give 1 second to see "TIME UP" message
  };

  const endTurn = async () => {
    if (!roomCode || !currentTurn) {
      console.error('Cannot end turn: missing roomCode or currentTurn');
      return;
    }

    const cardsWon = currentTurn.cardsWon || 0;
    const cardsPassed = currentTurn.cardsPassed || 0;
    const penalties = currentTurn.penalties || 0;
    const movement = Math.max(0, cardsWon - penalties);

    // Show turn summary
    setTurnSummary({
      cardsWon,
      cardsPassed,
      penalties,
      movement,
    });

    // Update Firebase
    try {
      const { endTurn: endTurnInFirebase } = await import('../services/roomService');
      await endTurnInFirebase(roomCode, cardsWon, cardsPassed, penalties);
      console.log(`🏁 Turn ended. Cards won: ${cardsWon}, Movement: ${movement}`);
      
      // Update local store
      storeEndTurn();
    } catch (error) {
      console.error('Failed to end turn:', error);
    }
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
              players={players}
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
            {/* YOUR TURN Banner */}
            {currentTeam && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  bg-gradient-to-r ${
                    currentTeam === 'red' ? 'from-red-500 to-red-600' :
                    currentTeam === 'blue' ? 'from-blue-500 to-blue-600' :
                    currentTeam === 'green' ? 'from-green-500 to-green-600' :
                    'from-yellow-500 to-yellow-600'
                  }
                  text-white font-bold text-2xl py-4 px-6 rounded-xl shadow-lg text-center
                `}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">
                    {currentTeam === 'red' ? '🔴' :
                     currentTeam === 'blue' ? '🔵' :
                     currentTeam === 'green' ? '🟢' : '🟡'}
                  </span>
                  <span>
                    {currentTeamData?.name || t(`teams.${currentTeam}`, currentTeam.toUpperCase())} - {t('game.yourTurn', 'YOUR TURN!')}
                  </span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⏰
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Timer */}
            <div className="flex justify-center">
              <Timer
                duration={gameSettings.turnDuration}
                onComplete={handleTimerComplete}
                size="large"
              />
            </div>

            {/* Game Card */}
            <GameCard
              card={currentCard || undefined}
              clueNumber={boardBasedClueNumber}
              language={language}
              isRevealed={isCardRevealed}
              isFlipping={gameFlowLoading}
            />

            {/* Action Buttons */}
            <ActionButtons
              onCorrect={() => {
                console.log('🔘 Correct button clicked! isCardRevealed:', isCardRevealed, 'disabled:', !isCardRevealed || gameFlowLoading || isTimeUp);
                handleCorrect();
              }}
              onSkip={() => {
                console.log('🔘 Skip button clicked! isCardRevealed:', isCardRevealed, 'disabled:', !isCardRevealed || gameFlowLoading || isTimeUp);
                handleSkipAction();
              }}
              onMistake={() => {
                console.log('🔘 Mistake button clicked! isCardRevealed:', isCardRevealed, 'disabled:', !isCardRevealed || gameFlowLoading || isTimeUp);
                handleMistake();
              }}
              onEndTurn={endTurn}
              disabled={!isCardRevealed || gameFlowLoading || isTimeUp}
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
              players={players}
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
