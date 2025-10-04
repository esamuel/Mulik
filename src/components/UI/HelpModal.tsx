import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { motion } from 'framer-motion';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'howToPlay' | 'specialSpaces' | 'scoring' | 'tips';

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('howToPlay');

  const tabs = [
    { id: 'howToPlay', label: t('help.howToPlay', 'How to Play'), icon: '🎮' },
    { id: 'specialSpaces', label: t('help.specialSpaces', 'Special Spaces'), icon: '⭐' },
    { id: 'scoring', label: t('help.scoring', 'Scoring'), icon: '🏆' },
    { id: 'tips', label: t('help.tips', 'Tips & Tricks'), icon: '💡' }
  ] as const;

  const renderHowToPlay = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('help.objective', 'Objective')}
        </h3>
        <p className="text-gray-600">
          {t('help.objectiveDesc', 'Be the first team to reach the end of the spiral board by guessing cards correctly!')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">👥</div>
          <h4 className="font-semibold text-blue-800 mb-1">
            {t('help.teams', 'Teams')}
          </h4>
          <p className="text-sm text-blue-700">
            {t('help.teamsDesc', '2-4 teams with 1-6 players each. Take turns explaining cards to your team.')}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">⏱️</div>
          <h4 className="font-semibold text-green-800 mb-1">
            {t('help.timer', 'Timer')}
          </h4>
          <p className="text-sm text-green-700">
            {t('help.timerDesc', 'Each turn lasts 60 seconds. Explain as many cards as possible!')}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">🎴</div>
          <h4 className="font-semibold text-purple-800 mb-1">
            {t('help.cards', 'Cards')}
          </h4>
          <p className="text-sm text-purple-700">
            {t('help.cardsDesc', 'Each card has 3 clues. Start with clue 1, reveal more if needed.')}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="font-semibold text-orange-800 mb-1">
            {t('help.actions', 'Actions')}
          </h4>
          <p className="text-sm text-orange-700">
            {t('help.actionsDesc', 'Got It = move forward, Pass = no penalty, Skip = lose movement')}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSpecialSpaces = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('help.specialSpacesTitle', 'Special Board Spaces')}
        </h3>
        <p className="text-gray-600">
          {t('help.specialSpacesDesc', 'Land on these spaces for special effects!')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-3xl mr-4">⚡</div>
          <div>
            <h4 className="font-semibold text-yellow-800">
              {t('help.lightning', 'Lightning Space')}
            </h4>
            <p className="text-sm text-yellow-700">
              {t('help.lightningDesc', 'Get an extra 30 seconds on your next turn!')}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl mr-4">🎁</div>
          <div>
            <h4 className="font-semibold text-green-800">
              {t('help.bonus', 'Bonus Space')}
            </h4>
            <p className="text-sm text-green-700">
              {t('help.bonusDesc', 'Move forward 2 extra spaces!')}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl mr-4">🔄</div>
          <div>
            <h4 className="font-semibold text-blue-800">
              {t('help.switch', 'Switch Space')}
            </h4>
            <p className="text-sm text-blue-700">
              {t('help.switchDesc', 'Swap positions with another team!')}
            </p>
          </div>
        </div>

        <div className="flex items-center p-4 bg-red-50 rounded-lg">
          <div className="text-3xl mr-4">🎯</div>
          <div>
            <h4 className="font-semibold text-red-800">
              {t('help.steal', 'Steal Space')}
            </h4>
            <p className="text-sm text-red-700">
              {t('help.stealDesc', 'Steal points from the leading team!')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScoring = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('help.scoringSystem', 'Scoring System')}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3">✅</span>
            <h4 className="font-semibold text-green-800">
              {t('help.gotIt', 'Got It!')}
            </h4>
          </div>
          <p className="text-sm text-green-700 mb-2">
            {t('help.gotItDesc', 'Your team guessed correctly!')}
          </p>
          <div className="text-xs text-green-600">
            <div>• {t('help.gotItPoints', '+1 card point')}</div>
            <div>• {t('help.gotItMovement', 'Move forward 1-3 spaces based on clue used')}</div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3">⏭️</span>
            <h4 className="font-semibold text-yellow-800">
              {t('help.pass', 'Pass')}
            </h4>
          </div>
          <p className="text-sm text-yellow-700 mb-2">
            {t('help.passDesc', 'Skip this card with no penalty')}
          </p>
          <div className="text-xs text-yellow-600">
            <div>• {t('help.passPoints', 'No points gained or lost')}</div>
            <div>• {t('help.passMovement', 'No movement penalty')}</div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-3">❌</span>
            <h4 className="font-semibold text-red-800">
              {t('help.skip', 'Skip')}
            </h4>
          </div>
          <p className="text-sm text-red-700 mb-2">
            {t('help.skipDesc', 'Give up on this card')}
          </p>
          <div className="text-xs text-red-600">
            <div>• {t('help.skipPoints', 'No points gained')}</div>
            <div>• {t('help.skipMovement', 'Lose 1 space of movement')}</div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-800 mb-2">
          {t('help.clueSystem', 'Clue System')}
        </h4>
        <div className="text-sm text-purple-700 space-y-1">
          <div>• {t('help.clue1', 'Clue 1: Hardest clue = 3 spaces if correct')}</div>
          <div>• {t('help.clue2', 'Clue 2: Medium clue = 2 spaces if correct')}</div>
          <div>• {t('help.clue3', 'Clue 3: Easiest clue = 1 space if correct')}</div>
        </div>
      </div>
    </div>
  );

  const renderTips = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">💡</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {t('help.tipsTitle', 'Tips & Tricks')}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">🎯</span>
            {t('help.strategyTitle', 'Strategy Tips')}
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• {t('help.strategy1', 'Try clue 1 first - maximum points!')}</li>
            <li>• {t('help.strategy2', 'Use "Pass" wisely - no penalty')}</li>
            <li>• {t('help.strategy3', 'Save difficult cards for when you have time')}</li>
            <li>• {t('help.strategy4', 'Watch other teams\' positions')}</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2 flex items-center">
            <span className="mr-2">🗣️</span>
            {t('help.communicationTitle', 'Communication Tips')}
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• {t('help.communication1', 'Speak clearly and loudly')}</li>
            <li>• {t('help.communication2', 'Use gestures and expressions')}</li>
            <li>• {t('help.communication3', 'Give context clues')}</li>
            <li>• {t('help.communication4', 'Stay calm under pressure')}</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="mr-2">⚡</span>
            {t('help.speedTitle', 'Speed Tips')}
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• {t('help.speed1', 'Read all clues quickly first')}</li>
            <li>• {t('help.speed2', 'Skip if stuck for more than 10 seconds')}</li>
            <li>• {t('help.speed3', 'Use team signals for common answers')}</li>
            <li>• {t('help.speed4', 'Practice makes perfect!')}</li>
          </ul>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2 flex items-center">
            <span className="mr-2">🎮</span>
            {t('help.controlsTitle', 'Game Controls')}
          </h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• {t('help.controls1', 'Space bar: Pause/resume timer')}</li>
            <li>• {t('help.controls2', 'R key: Toggle ready status (lobby)')}</li>
            <li>• {t('help.controls3', 'Escape: Close modals/go back')}</li>
            <li>• {t('help.controls4', '? key: Show this help')}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'howToPlay':
        return renderHowToPlay();
      case 'specialSpaces':
        return renderSpecialSpaces();
      case 'scoring':
        return renderScoring();
      case 'tips':
        return renderTips();
      default:
        return renderHowToPlay();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('help.title', 'Game Help & Rules')}
      size="large"
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-auto"
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </Modal>
  );
};

export default HelpModal;
