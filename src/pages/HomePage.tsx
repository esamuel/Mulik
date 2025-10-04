import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Language } from '../types/game.types';

interface HomePageProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const HomePage: React.FC<HomePageProps> = ({ currentLanguage, onLanguageChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreateGame = () => {
    navigate('/create');
  };

  const handleJoinGame = () => {
    navigate('/join');
  };

  const handleLocalPlay = () => {
    // TODO: Navigate to local play page
    console.log('Local Play clicked');
  };

  const handleSettings = () => {
    // Navigate to settings page
    navigate('/settings');
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en';
    onLanguageChange(newLanguage);
  };

  const isRTL = currentLanguage === 'he';

  return (
    <div 
      className={`min-h-screen mulik-gradient flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header with Language Toggle and Settings */}
      <motion.header 
        className="flex justify-between items-center p-4 md:p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div></div> {/* Spacer */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <motion.button
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{currentLanguage === 'en' ? '🇮🇱' : '🇺🇸'}</span>
            <span>{currentLanguage === 'en' ? 'עברית' : 'English'}</span>
          </motion.button>

          {/* Settings Button */}
          <motion.button
            onClick={handleSettings}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">⚙️</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1
              className="mulik-text-gradient font-bold text-4xl md:text-6xl mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t('home.title')}
            </motion.h1>
            <motion.p
              className="text-white/90 text-xl md:text-2xl font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {t('home.subtitle')}
            </motion.p>
          </div>

          {/* Game Options Card */}
          <motion.div
            className="mulik-card space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Create Game Button */}
            <motion.button
              onClick={handleCreateGame}
              className="w-full mulik-button-primary flex items-center justify-center gap-3 text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">🎯</span>
              <span>{t('home.createGame')}</span>
            </motion.button>

            {/* Join Game Button */}
            <motion.button
              onClick={handleJoinGame}
              className="w-full mulik-button-secondary flex items-center justify-center gap-3 text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">🔗</span>
              <span>{t('home.joinGame')}</span>
            </motion.button>

            {/* Local Play Button */}
            <motion.button
              onClick={handleLocalPlay}
              className="w-full mulik-button-secondary flex items-center justify-center gap-3 text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">📱</span>
              <span>{t('home.localPlay')}</span>
            </motion.button>
          </motion.div>

          {/* Game Icon */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <span className="text-6xl">🎮</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
