import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/gameStore';
import { useSettings } from '../hooks/useSettings';
import { getNextTeam, getNextSpeaker } from '../services/gameLogic';
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
import InGameSettingsModal from '../components/Game/InGameSettingsModal';
// Spiral board removed in favor of per-team 1..8 track

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
  const { settings: appSettings } = useSettings();
  
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
  // Determine card difficulty from local Settings (mulik-settings)
  const storedSettings = (() => {
    try {
      const raw = localStorage.getItem('mulik-settings');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  })() as any;
  const cardDifficultyPref = storedSettings.cardDifficulty as 'easy'|'mixed'|'hard'|undefined;
  const mappedDifficulty = cardDifficultyPref === 'mixed' || !cardDifficultyPref ? undefined : (cardDifficultyPref as any);

  const {
    currentCard: cardFromHook,
    getNextCard,
    loading: cardsLoading,
  } = useCards({
    language: i18n.language as Language,
    difficulty: mappedDifficulty,
  });
  
  // Use card from hook or local state
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  // Derived values
  const currentTeam = currentTurn?.team;
  const turnNumber = 1; // TODO: Add turn tracking to store
  const roundNumber = 1; // TODO: Add round tracking to store

  // Simplified implementation without full hooks for now
  const { markCardCorrect, markCardPassed, markPenalty, endTurn: storeEndTurn, startTurn: storeStartTurn } = useGameStore();
  
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
  const [hasStartedTurn, setHasStartedTurn] = useState(false);
  const [turnSummary, setTurnSummary] = useState<any>(null);
  const [gameFlowLoading] = useState(false); // TODO: Implement loading states
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [clueNumber, setClueNumber] = useState(1); // Still track for UI, but use boardBasedClueNumber for actual clue
  // Spiral board removed; no toggle needed
  const [isTimeUp, setIsTimeUp] = useState(false); // Track if timer has ended
  const [showSettings, setShowSettings] = useState(false);

  const language = i18n.language as Language;
  const currentTeamData = currentTeam ? teams[currentTeam] : undefined;
  const currentPlayer = currentTurn ? players[currentTurn.speakerId] : undefined;
  const isCurrentPlayerTurn = currentPlayer?.team === currentTeam;

  // Get the clue number for current team based on their per-team 1..8 index
  const legacyMap = (position: number): number => (position === 0 ? 1 : (((position - 1) % 8) + 1));
  const boardBasedClueNumber = currentTeamData 
    ? (currentTeamData.wordIndex ?? legacyMap(currentTeamData.position))
    : 1;

  // Navigation safeguard
  useEffect(() => {
    if (!roomCode) {
      navigate('/');
    }
  }, [roomCode, navigate]);

  // Handler to explicitly start the turn (user-controlled)
  const handleStartTurn = async () => {
    if (!roomCode) return;

    // If there's no currentTurn, create one for the first available team
    if (!currentTurn) {
      const teamOrder: Array<'red'|'blue'|'green'|'yellow'> = ['red','blue','green','yellow'];
      const firstTeam = teamOrder.find((c) => (teams as any)[c]?.players?.length > 0);
      if (firstTeam) {
        const speakerId = (teams as any)[firstTeam].players[0];
        try {
          const { startTurn } = await import('../services/roomService');
          await startTurn(roomCode, firstTeam, speakerId);
        } catch (e) {
          console.warn('Firebase startTurn failed or offline, using local store only', e);
        }
        storeStartTurn(firstTeam, speakerId);
      }
    }

    // Reset overlays/state and draw the first card for this turn
    setIsTimeUp(false);
    setIsFlipping(false);
    drawCard();
    setHasStartedTurn(true);
  };

  // Auto mode: ensure a turn exists and start it, then draw a card and start timer
  useEffect(() => {
    const run = async () => {
      const turnMode = appSettings?.turnMode || 'manual';
      if (turnMode !== 'auto' || hasStartedTurn) return;

      // If there is no active turn, create one
      if (!currentTurn) {
        const teamOrder: Array<'red'|'blue'|'green'|'yellow'> = ['red','blue','green','yellow'];
        const firstTeam = teamOrder.find((c) => (teams as any)[c]?.players?.length > 0);
        if (firstTeam) {
          const speakerId = (teams as any)[firstTeam].players[0];
          try {
            const { startTurn } = await import('../services/roomService');
            await startTurn(roomCode!, firstTeam as any, speakerId);
          } catch (e) {
            console.warn('Firebase startTurn failed or offline, using local store only', e);
          }
          storeStartTurn(firstTeam as any, speakerId);
        }
      }

      // Draw a card if not yet drawn
      if (!currentCard) {
        drawCard();
      }
      setHasStartedTurn(true);
    };
    run();
  }, [appSettings?.turnMode, hasStartedTurn, currentTurn?.team, currentCard?.id, roomCode, teams, storeStartTurn]);

  // Keep local currentCard in sync with hook to avoid race conditions
  useEffect(() => {
    if (cardFromHook && (!currentCard || currentCard.id !== cardFromHook.id)) {
      setCurrentCard(cardFromHook);
    }
  }, [cardFromHook?.id]);

  // Sync global app settings to game store runtime settings (duration, language)
  useEffect(() => {
    // Map timerDuration -> turnDuration for the store
    if (appSettings?.timerDuration && appSettings.timerDuration !== gameSettings.turnDuration) {
      useGameStore.getState().updateSettings({ turnDuration: appSettings.timerDuration as any });
    }
    // Language sync for i18n
    if (appSettings?.language && i18n.language !== appSettings.language) {
      i18n.changeLanguage(appSettings.language);
    }
  }, [appSettings?.timerDuration, appSettings?.language]);

  // Handle card reveal - runs when card ID changes
  useEffect(() => {
    if (currentCard) {
      console.log('🎴 Card loaded, revealing...', currentCard);
      console.log('📝 Card words:', currentCard.words);
      console.log(`🎯 Word number based on board position: ${boardBasedClueNumber}`);
      console.log(`📍 Word to explain: ${currentCard.words?.[boardBasedClueNumber - 1]}`);
      
      // Reset state first
      setIsFlipping(true);
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
    console.log('⏩ Skip card clicked! Counts as penalty (move back 1).', { currentCard });
    // Skip entire card is a penalty per rules
    markPenalty();
    drawCard(); // Skip to new card
  };

  const handleMistake = async () => {
    console.log('⚠️ Mistake button clicked! Explainer said part of the word', { currentCard });
    // Record penalty (counts as -1 in movement calculation)
    markPenalty();
    drawCard(); // Draw new card per rules
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleLeaveGame = () => {
    // TODO: Implement proper leave game logic
    navigate('/');
  };

  const handleNextTurn = async () => {
    setTurnSummary(null);
    setIsTimeUp(false);
    setHasStartedTurn(false);

    // Determine next team and explainer
    const currentTeamColor = currentTurn?.team || (Object.keys(teams)[0] as any);
    const nextTeam = getNextTeam(currentTeamColor as any, teams as any);
    const currentSpeaker = currentTurn?.speakerId || ((teams as any)[nextTeam]?.players?.[0] || '');
    const nextSpeaker = getNextSpeaker(nextTeam as any, players as any, currentSpeaker);

    try {
      const { startTurn } = await import('../services/roomService');
      await startTurn(roomCode!, nextTeam as any, nextSpeaker);
    } catch (e) {
      console.warn('Firebase startTurn failed or offline, using local store only', e);
    }
    storeStartTurn(nextTeam as any, nextSpeaker);

    // New card for the new turn
    drawCard();
  };

  const handleTimerComplete = () => {
    console.log('⏰ Time is up! Disabling buttons...');
    setIsTimeUp(true);
    // End the turn now; user will press "Next Turn" in the summary to continue
    endTurn();
  };

  const endTurn = async () => {
    if (!roomCode || !currentTurn) {
      console.error('Cannot end turn: missing roomCode or currentTurn');
      return;
    }

    const cardsWon = currentTurn.cardsWon || 0;
    const cardsPassed = currentTurn.cardsPassed || 0; // informational only
    const penalties = currentTurn.penalties || 0;
    // Movement according to rules: cardsWon - penalties (Pass gives 0; Skip is a penalty)
    const movement = cardsWon - penalties;

    // Show turn summary
    setTurnSummary({
      cardsWon,
      cardsPassed,
      penalties,
      movement,
    });
    setHasStartedTurn(false);

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
        onShowSettings={() => setShowSettings(true)}
        onLeaveGame={handleLeaveGame}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Score */}
          <div className="space-y-4">
            <ScoreBoard
              teams={Object.values(teams)}
              currentTeam={currentTeam}
              players={players}
              isCompact={false}
              showProgress={true}
              maxScore={appSettings?.targetScore || 100}
            />
          </div>
          {/* Center Column - Game Card & Actions */}
          <div className="space-y-6">
            {/* YOUR TURN Banner */}
            {currentTurn && (
              <motion.div
                className="text-center p-4 rounded-2xl bg-white shadow"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-lg font-extrabold text-purple-700">
                  {t('game.yourTurn', 'YOUR TURN!')}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {currentTeamData?.name} · {t('game.explainer', 'Explainer')}: {currentPlayer?.name || '-'}
                </div>
              </motion.div>
            )}

            {/* Timer */}
            {/* Start Turn gate and Timer */}
            {!hasStartedTurn && (
              <div className="text-center">
                <button
                  onClick={handleStartTurn}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow hover:bg-green-700"
                >
                  Start Turn
                </button>
              </div>
            )}

            <Timer
              duration={gameSettings.turnDuration}
              onComplete={handleTimerComplete}
              autoStart={appSettings?.turnMode === 'auto' && hasStartedTurn}
              syncKey={`${roomCode || 'local'}-${currentTurn?.team || 'none'}`}
              size="large"
              styleVariant={appSettings?.timerStyle === 'sandglass' ? 'sandglass' : 'ring'}
            />

            {/* Game Card */}
            <GameCard
              card={currentCard || undefined}
              clueNumber={boardBasedClueNumber}
              language={language}
              isRevealed={isCardRevealed}
              isFlipping={isFlipping}
              onFlipComplete={() => setIsFlipping(false)}
            />

            {/* Action Buttons */}
            <ActionButtons
              onCorrect={handleCorrect}
              onSkip={handlePassAction}
              onMistake={handleMistake}
              onEndTurn={async () => { await endTurn(); }}
              disabled={isTimeUp || !currentCard || !isCardRevealed}
              turnMode={"auto"}
              isCurrentPlayerTurn={true}
              currentTeamName={currentTeamData?.name}
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
              maxScore={appSettings?.targetScore || 100}
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
                  <span className="font-semibold">{boardBasedClueNumber}/8</span>
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
                  onClick={() => console.log('Show settings')}
                  className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Board UI removed; scoreboard shows the 1..8 index per team */}
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
      <InGameSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
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
