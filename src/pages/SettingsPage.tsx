import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useSettings';
import LanguageSwitch from '../components/Settings/LanguageSwitch';
import ThemeToggle from '../components/Settings/ThemeToggle';
import Toggle from '../components/UI/Toggle';
import type { Language } from '../types/game.types';

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { settings, updateSettings, saveSettings } = useSettings();
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const isRTL = i18n.language === 'he';

  const handleLanguageChange = (language: Language) => {
    updateSettings({ language });
  };

  const handleThemeChange = (theme: 'modern' | 'cartoon') => {
    updateSettings({ theme });
  };

  const handleTimerChange = (value: number) => {
    updateSettings({ timerDuration: value as 30 | 60 | 90 | 120 });
  };

  const handleTurnModeChange = (checked: boolean) => {
    updateSettings({ turnMode: checked ? 'manual' : 'auto' });
  };

  const handleSoundChange = (checked: boolean) => {
    updateSettings({ soundEnabled: checked });
  };

  const handleSave = () => {
    const success = saveSettings();
    if (success) {
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div 
      className={`min-h-screen mulik-gradient ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between p-4 md:p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`text-lg ${isRTL ? 'rotate-180' : ''}`}>←</span>
          <span>{t('settings.back')}</span>
        </motion.button>

        <motion.h1
          className="text-white text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('settings.title')}
        </motion.h1>

        <div></div> {/* Spacer */}
      </motion.header>

      {/* Main Content */}
      <main className="px-4 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Language Section */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <h3 className="text-lg font-semibold text-gray-800">{t('settings.language')}</h3>
              </div>
              <LanguageSwitch 
                value={settings.language}
                onChange={handleLanguageChange}
              />
            </div>
          </motion.div>

          {/* Theme Section */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <h3 className="text-lg font-semibold text-gray-800">{t('settings.theme')}</h3>
              </div>
              <ThemeToggle 
                value={settings.theme}
                onChange={handleThemeChange}
              />
            </div>
          </motion.div>

          {/* Timer Duration Section */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <h3 className="text-lg font-semibold text-gray-800">{t('settings.timerDuration')}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">30{t('settings.seconds')}</span>
                  <span className="text-lg font-bold text-mulik-primary-600">{settings.timerDuration}{t('settings.seconds')}</span>
                  <span className="text-sm text-gray-600">120{t('settings.seconds')}</span>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="30"
                    value={settings.timerDuration}
                    onChange={(e) => handleTimerChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>30</span>
                    <span>60</span>
                    <span>90</span>
                    <span>120</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Turn Mode Section */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <h3 className="text-lg font-semibold text-gray-800">{t('settings.turnMode')}</h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="text-sm">ℹ️</span>
                  </button>
                </div>
                <Toggle
                  checked={settings.turnMode === 'manual'}
                  onChange={handleTurnModeChange}
                  leftLabel={t('settings.auto')}
                  rightLabel={t('settings.manual')}
                  size="medium"
                />
              </div>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {settings.turnMode === 'auto' ? t('settings.autoModeInfo') : t('settings.manualModeInfo')}
              </div>
            </div>
          </motion.div>

          {/* Sound Section */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{settings.soundEnabled ? '🔊' : '🔇'}</span>
                <h3 className="text-lg font-semibold text-gray-800">{t('settings.soundEffects')}</h3>
              </div>
              <Toggle
                checked={settings.soundEnabled}
                onChange={handleSoundChange}
                leftLabel={t('settings.off')}
                rightLabel={t('settings.on')}
                size="medium"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Save Button - Sticky at bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={handleSave}
            className="w-full mulik-button-primary text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('settings.save')}
          </motion.button>
        </div>
      </motion.div>

      {/* Success Message */}
      {showSavedMessage && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{t('settings.saved')}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsPage;
