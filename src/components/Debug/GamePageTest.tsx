import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Game Components
import GameHeader from '../Game/GameHeader';
import GameCard from '../Game/GameCard';
import ActionButtons from '../Game/ActionButtons';
import TurnSummary from '../Game/TurnSummary';
import ScoreBoard from '../Game/ScoreBoard';
import Timer from '../Game/Timer';

// Mock data
import type { Card, Team, TeamColor, Language } from '../../types/game.types';

const GamePageTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as Language;

  // Mock game state
  const [currentTeam, setCurrentTeam] = useState<TeamColor>('red');
  const [turnNumber, setTurnNumber] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [isCardRevealed, setIsCardRevealed] = useState(true);
  const [clueNumber, setClueNumber] = useState(1);
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [showBoard, setShowBoard] = useState(false);

  // Mock card data
  const mockCard: Card = {
    id: 'test-card-1',
    word: 'ELEPHANT',
    categoryEn: 'Animals',
    categoryHe: 'חיות',
    cluesEn: [
      'Large gray mammal',
      'Has a trunk',
      'Lives in Africa and Asia',
      'Never forgets',
      'Biggest land animal',
      'Has big ears'
    ],
    cluesHe: [
      'יונק אפור גדול',
      'יש לו חדק',
      'חי באפריקה ואסיה',
      'אף פעם לא שוכח',
      'החיה הגדולה ביבשה',
      'יש לו אוזניים גדולות'
    ],
    difficulty: 'medium',
    tags: ['animal', 'mammal', 'large']
  };

  // Mock teams data
  const mockTeams: Team[] = [
    {
      name: 'Red Dragons',
      color: 'red',
      players: [
        { id: '1', name: 'Alice', teamColor: 'red', isReady: true, lastSeen: Date.now() },
        { id: '2', name: 'Bob', teamColor: 'red', isReady: true, lastSeen: Date.now() }
      ],
      score: 45,
      position: 45
    },
    {
      name: 'Blue Sharks',
      color: 'blue',
      players: [
        { id: '3', name: 'Charlie', teamColor: 'blue', isReady: true, lastSeen: Date.now() },
        { id: '4', name: 'Diana', teamColor: 'blue', isReady: true, lastSeen: Date.now() }
      ],
      score: 38,
      position: 38
    },
    {
      name: 'Green Eagles',
      color: 'green',
      players: [
        { id: '5', name: 'Eve', teamColor: 'green', isReady: true, lastSeen: Date.now() },
        { id: '6', name: 'Frank', teamColor: 'green', isReady: true, lastSeen: Date.now() }
      ],
      score: 52,
      position: 52
    }
  ];

  const currentTeamData = mockTeams.find(team => team.color === currentTeam);

  // Mock handlers
  const handleCorrect = async () => {
    console.log('Correct answer!');
    if (clueNumber < 6) {
      setClueNumber(prev => prev + 1);
    } else {
      setClueNumber(1);
    }
  };

  const handlePass = async () => {
    console.log('Pass!');
    if (clueNumber < 6) {
      setClueNumber(prev => prev + 1);
    } else {
      setClueNumber(1);
    }
  };

  const handleSkip = async () => {
    console.log('Skip!');
    setClueNumber(1);
  };

  const handleEndTurn = async () => {
    console.log('End turn!');
    setShowTurnSummary(true);
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleNextTurn = () => {
    setShowTurnSummary(false);
    setTurnNumber(prev => prev + 1);
    
    // Switch to next team
    const teamColors: TeamColor[] = ['red', 'blue', 'green', 'yellow'];
    const currentIndex = teamColors.indexOf(currentTeam);
    const nextIndex = (currentIndex + 1) % teamColors.length;
    setCurrentTeam(teamColors[nextIndex]);
    
    setClueNumber(1);
    setTimeRemaining(60);
  };

  const handleLeaveGame = () => {
    console.log('Leave game!');
  };

  // Timer simulation
  React.useEffect(() => {
    if (!isPaused && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Game Header */}
      <GameHeader
        roomCode="TEST123"
        currentTeam={currentTeam}
        currentTeamName={currentTeamData?.name}
        turnNumber={turnNumber}
        roundNumber={roundNumber}
        timeRemaining={timeRemaining}
        isPaused={isPaused}
        onPauseToggle={handlePauseToggle}
        onShowSettings={() => console.log('Show settings')}
        onLeaveGame={handleLeaveGame}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Test Controls */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Test Controls</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setIsCardRevealed(!isCardRevealed)}
              className="py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {isCardRevealed ? 'Hide Card' : 'Show Card'}
            </button>
            
            <button
              onClick={() => setShowTurnSummary(true)}
              className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Show Summary
            </button>
            
            <button
              onClick={() => setShowBoard(!showBoard)}
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showBoard ? 'Hide Board' : 'Show Board'}
            </button>
            
            <button
              onClick={() => setTimeRemaining(10)}
              className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Low Time
            </button>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-600">Current Team:</span>
            {(['red', 'blue', 'green', 'yellow'] as TeamColor[]).map(color => (
              <button
                key={color}
                onClick={() => setCurrentTeam(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  currentTeam === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color === 'yellow' ? '#F59E0B' : color }}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Score */}
          <div className="space-y-4">
            <ScoreBoard
              teams={mockTeams}
              currentTeam={currentTeam}
              isCompact={false}
              showProgress={true}
              maxScore={100}
            />
          </div>

          {/* Center Column - Game Card & Actions */}
          <div className="space-y-6">
            {/* Timer */}
            <div className="flex justify-center">
              <Timer
                duration={60}
                timeRemaining={timeRemaining}
                isRunning={!isPaused && timeRemaining > 0}
                isPaused={isPaused}
                size={120}
                strokeWidth={8}
              />
            </div>

            {/* Game Card */}
            <GameCard
              card={mockCard}
              clueNumber={clueNumber}
              language={language}
              isRevealed={isCardRevealed}
              isFlipping={false}
            />

            {/* Action Buttons */}
            <ActionButtons
              onCorrect={handleCorrect}
              onPass={handlePass}
              onSkip={handleSkip}
              onEndTurn={handleEndTurn}
              disabled={!isCardRevealed}
              turnMode="manual"
              isCurrentPlayerTurn={true}
              currentTeamName={currentTeamData?.name}
              loading={false}
            />
          </div>

          {/* Right Column - Compact Score (Mobile) */}
          <div className="lg:hidden">
            <ScoreBoard
              teams={mockTeams}
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
                  <span className="font-semibold">60s</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('game.gameMode', 'Game Mode')}:</span>
                  <span className="font-semibold">Manual</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">{t('game.language', 'Language')}:</span>
                  <span className="font-semibold uppercase">{language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board (Collapsible) */}
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
            
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
              <p className="text-gray-500">🎯 Game Board Component Would Go Here</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Turn Summary Modal */}
      <TurnSummary
        isOpen={showTurnSummary}
        cardsWon={3}
        cardsPassed={2}
        penalties={1}
        movement={5}
        team={currentTeam}
        teamName={currentTeamData?.name || ''}
        onNextTurn={handleNextTurn}
        onClose={() => setShowTurnSummary(false)}
      />
    </div>
  );
};

export default GamePageTest;
