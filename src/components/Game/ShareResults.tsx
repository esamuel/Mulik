import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Team, TeamColor } from '../../types/game.types';

interface TeamWithColor extends Team {
  color: TeamColor;
}

interface ShareResultsProps {
  winner: TeamColor;
  winnerName: string;
  teams: TeamWithColor[];
  roomCode: string;
}

const ShareResults: React.FC<ShareResultsProps> = ({ 
  winnerName, 
  teams, 
  roomCode 
}) => {
  const { t } = useTranslation();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateShareText = () => {
    const standings = teams.map((team, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
      return `${medal} ${team.name} - ${team.position} ${t('gameOver.spaces')}`;
    }).join('\n');

    const totalCards = teams.reduce((sum, team) => sum + team.score, 0);
    const totalPlayers = teams.reduce((sum, team) => sum + team.players.length, 0);

    return `🎮 ${t('gameOver.shareTitle')}

🏆 ${t('gameOver.winner', { team: winnerName })}

${t('gameOver.finalStandings')}:
${standings}

📊 ${t('gameOver.gameStats')}:
🎴 ${t('gameOver.stats.totalCards')}: ${totalCards}
👥 ${t('gameOver.stats.totalPlayers')}: ${totalPlayers}
🏠 ${t('gameOver.roomCode')}: ${roomCode}

${t('gameOver.playMulik')} 🎯`;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t('gameOver.shareTitle'),
          text: generateShareText(),
          url: window.location.origin
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      // Fallback to copy
      handleCopyToClipboard();
    }
  };

  const handleDownloadImage = () => {
    // This would require html2canvas or similar library
    // For now, we'll show a placeholder
    alert(t('gameOver.downloadComingSoon'));
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">📤</span>
        {t('gameOver.shareResults')}
      </motion.button>

      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-64 z-50"
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 text-center mb-3">
                {t('gameOver.shareOptions')}
              </h3>

              {/* Copy to Clipboard */}
              <motion.button
                onClick={handleCopyToClipboard}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl">📋</span>
                <div>
                  <div className="font-medium text-gray-800">
                    {copySuccess ? t('gameOver.copied') : t('gameOver.copyText')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('gameOver.copyDescription')}
                  </div>
                </div>
                {copySuccess && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500 text-xl ml-auto"
                  >
                    ✅
                  </motion.span>
                )}
              </motion.button>

              {/* Native Share (Mobile) */}
              {navigator.share && (
                <motion.button
                  onClick={handleNativeShare}
                  className="w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-medium text-gray-800">
                      {t('gameOver.shareNative')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('gameOver.shareNativeDescription')}
                    </div>
                  </div>
                </motion.button>
              )}

              {/* Download as Image */}
              <motion.button
                onClick={handleDownloadImage}
                className="w-full p-3 text-left rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl">🖼️</span>
                <div>
                  <div className="font-medium text-gray-800">
                    {t('gameOver.downloadImage')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('gameOver.downloadImageDescription')}
                  </div>
                </div>
              </motion.button>

              {/* Close button */}
              <motion.button
                onClick={() => setShowShareMenu(false)}
                className="w-full p-2 text-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('gameOver.close')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview of share text */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white rounded-lg p-4 max-w-sm text-sm z-40"
          >
            <h4 className="font-semibold mb-2">{t('gameOver.preview')}:</h4>
            <pre className="whitespace-pre-wrap text-xs leading-relaxed">
              {generateShareText()}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default ShareResults;
