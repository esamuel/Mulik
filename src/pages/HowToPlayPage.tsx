import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const HowToPlayPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            ← {t('common.back', 'Back')}
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            {t('howToPlay.title', 'How to Play')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('common.tagline', 'The Fast-Talk Challenge')}
          </p>
        </motion.div>

        {/* Setup Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
            📋 {t('howToPlay.setup.title', 'Game Setup')}
          </h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">1</span>
              <span className="text-gray-700">{t('howToPlay.setup.step1', 'Create a room or join an existing one')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">2</span>
              <span className="text-gray-700">{t('howToPlay.setup.step2', 'Choose a team (Red, Blue, Green, Yellow)')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">3</span>
              <span className="text-gray-700">{t('howToPlay.setup.step3', 'Wait for all players to be ready')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">4</span>
              <span className="text-gray-700">{t('howToPlay.setup.step4', 'Host starts the game')}</span>
            </li>
          </ol>
        </motion.section>

        {/* Gameplay Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
            🎯 {t('howToPlay.gameplay.title', 'Gameplay')}
          </h2>
          <p className="font-semibold text-gray-800 mb-3">{t('howToPlay.gameplay.turn', 'On your turn:')}</p>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</span>
              <span className="text-gray-700">{t('howToPlay.gameplay.step1', 'Timer starts (30/60/90 seconds)')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
              <span className="text-gray-700">{t('howToPlay.gameplay.step2', 'Card appears with a clue word')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</span>
              <span className="text-gray-700">{t('howToPlay.gameplay.step3', 'Speaker gives hints to the team')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</span>
              <span className="text-gray-700">{t('howToPlay.gameplay.step4', 'Team guesses the word')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">5</span>
              <span className="text-gray-700">{t('howToPlay.gameplay.step5', 'Click \'Got It!\' when guessed correctly')}</span>
            </li>
          </ol>
        </motion.section>

        {/* The Card Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
            🎴 {t('howToPlay.card.title', 'The Card')}
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🏷️</span>
              <div>
                <p className="font-semibold text-gray-800">{t('howToPlay.card.category', 'Category badge (top) - Word to guess')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-semibold text-gray-800">{t('howToPlay.card.clue', 'Clue word (center) - Hint for speaker')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">●●●○○○○○</span>
              <div>
                <p className="font-semibold text-gray-800">{t('howToPlay.card.progress', 'Progress dots (top) - 8 clues per card')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🔢</span>
              <div>
                <p className="font-semibold text-gray-800">{t('howToPlay.card.number', 'Clue number (bottom) - Which clue you\'re on')}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Buttons Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
            🎮 {t('howToPlay.buttons.title', 'The Buttons')}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-green-600">{t('howToPlay.buttons.correct', 'Got It! - Guessed correctly, +1 point')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">⏭️</span>
              <div>
                <p className="font-semibold text-yellow-600">{t('howToPlay.buttons.pass', 'Pass - Skip to next clue, no points')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">⏩</span>
              <div>
                <p className="font-semibold text-orange-600">{t('howToPlay.buttons.skip', 'Skip - Skip entire card, -1 penalty')}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🏁</span>
              <div>
                <p className="font-semibold text-red-600">{t('howToPlay.buttons.endTurn', 'End Turn - End turn early')}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Board Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
            🎲 {t('howToPlay.board.title', 'Game Board')}
          </h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              📍 {t('howToPlay.board.description', 'Spiral path from START to FINISH')}
            </p>
            <p className="text-gray-700">
              📏 {t('howToPlay.board.spaces', '50 spaces total')}
            </p>
            <p className="text-gray-700 font-semibold">
              🧮 {t('howToPlay.board.movement', 'Movement = Cards guessed - Penalties')}
            </p>
            <p className="text-gray-700 font-bold text-lg text-green-600">
              🏆 {t('howToPlay.board.winning', 'First team to reach FINISH wins!')}
            </p>
          </div>
        </motion.section>

        {/* Tips Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            💡 {t('howToPlay.tips.title', 'Tips')}
          </h2>
          <div className="space-y-3">
            <p className="text-gray-800">
              🎤 {t('howToPlay.tips.speaker', 'For speaker: Give clear hints, use gestures')}
            </p>
            <p className="text-gray-800">
              👥 {t('howToPlay.tips.team', 'For team: Shout out guesses, don\'t be shy')}
            </p>
            <p className="text-gray-800">
              🎯 {t('howToPlay.tips.strategy', 'Use Pass wisely, avoid Skip')}
            </p>
            <p className="text-gray-800 font-bold text-lg">
              🎉 {t('howToPlay.tips.fun', 'Have fun! It\'s a game!')}
            </p>
          </div>
        </motion.section>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {t('common.back', 'Back to Home')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToPlayPage;
