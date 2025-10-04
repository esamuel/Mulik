import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateRoomCode, formatRoomCode } from '../utils/roomCode';
import { useGameStore } from '../stores/gameStore';
import { createRoom } from '../services/roomService';
import { isFirebaseAvailable } from '../services/firebase';
import QRCodeDisplay from '../components/UI/QRCodeDisplay';
import CopyButton from '../components/UI/CopyButton';
import { useToast } from '../components/UI/Toast';
import { createJoinUrl, isMobileAccessible } from '../utils/networkUtils';

const CreateRoomPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { initializeRoom } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showQR, setShowQR] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isRTL = i18n.language === 'he';

  // Generate room code on mount
  useEffect(() => {
    const code = generateRoomCode();
    setRoomCode(code);
  }, []);

  // Create shareable link (mobile-friendly)
  const shareLink = createJoinUrl(roomCode);

  // Validate player name
  const validateName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
      return t('rooms.nameRequired');
    }
    if (name.trim().length < 2) {
      return t('rooms.nameTooShort');
    }
    if (name.trim().length > 20) {
      return t('rooms.nameTooLong');
    }
    return undefined;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setPlayerName(name);
    
    // Clear error when user starts typing
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  const handleContinue = async () => {
    // Validate name
    const nameError = validateName(playerName);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate player ID
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Check if Firebase is available
      if (!isFirebaseAvailable()) {
        showToast('Firebase not configured. Running in offline mode.', 'error');
        // Initialize room in local store only (offline mode)
        initializeRoom(roomCode, playerId);
        setTimeout(() => {
          navigate(`/lobby/${roomCode}`);
        }, 500);
        return;
      }

      // Get current settings from store
      const { settings } = useGameStore.getState();

      // Create room in Firebase
      const createdRoomCode = await createRoom(playerId, playerName.trim(), settings);
      
      // Initialize room in local store
      initializeRoom(createdRoomCode, playerId);

      // Store player info in localStorage for persistence
      localStorage.setItem('mulik_player_id', playerId);
      localStorage.setItem('mulik_player_name', playerName.trim());
      localStorage.setItem('mulik_current_room', createdRoomCode);

      // Show success message
      showToast(t('rooms.generatingRoom'), 'success');

      // Navigate to lobby (increased delay to ensure Firebase sync)
      setTimeout(() => {
        navigate(`/lobby/${createdRoomCode}`);
      }, 1500);

    } catch (error) {
      console.error('Failed to create room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      showToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const isValidName = !validateName(playerName);

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
          <span>{t('rooms.back')}</span>
        </motion.button>

        <motion.h1
          className="text-white text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t('rooms.createGame')}
        </motion.h1>

        <div></div> {/* Spacer */}
      </motion.header>

      {/* Main Content */}
      <main className="px-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Player Name Input */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              {t('rooms.playerName')}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder={t('rooms.playerNamePlaceholder')}
              maxLength={20}
              className={`
                w-full px-4 py-3 text-lg rounded-lg border-2 
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-mulik-primary-500
                ${errors.name 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 bg-white'
                }
              `}
              aria-label={t('rooms.playerName')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <motion.p
                id="name-error"
                className="text-red-500 text-sm mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.name}
              </motion.p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              {playerName.length}/20 characters
            </p>
          </motion.div>

          {/* Room Code Display */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('rooms.roomCode')}
            </h3>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-mulik-primary-600 tracking-wider mb-4">
                {formatRoomCode(roomCode)}
              </div>
              <CopyButton
                text={roomCode}
                className="mulik-button-primary"
              >
                {t('rooms.copy')} {t('rooms.roomCode')}
              </CopyButton>
            </div>
          </motion.div>

          {/* Share Options */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('rooms.shareOptions')}
            </h3>
            
            <div className="space-y-4">
              {/* QR Code Section */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center justify-between w-full mb-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <span className="font-semibold text-gray-800">
                      {t('rooms.qrCode')}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {showQR ? '▼' : '▶'}
                  </span>
                </button>
                
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <QRCodeDisplay
                      value={shareLink}
                      size={220}
                      showDownload={true}
                      title={`Join MULIK Game - ${roomCode}`}
                    />
                    
                    {/* Mobile Access Notice */}
                    {!isMobileAccessible() && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 text-lg">⚠️</span>
                          <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">For mobile access:</p>
                            <p>Make sure your phone is on the same WiFi network, then use your computer's IP address instead of localhost.</p>
                            <p className="mt-1 text-xs">Check your terminal for the "Network:" URL when running npm run dev</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Share Link Section */}
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔗</span>
                  <span className="font-semibold text-gray-800">
                    {t('rooms.shareLink')}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-3 break-all text-sm text-gray-600">
                  {shareLink}
                </div>
                <CopyButton
                  text={shareLink}
                  className="mulik-button-secondary w-full"
                >
                  {t('rooms.copy')} {t('rooms.shareLink')}
                </CopyButton>
              </div>
            </div>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={handleContinue}
              disabled={!isValidName || isGenerating}
              className={`
                w-full py-4 px-8 text-lg font-semibold rounded-xl shadow-lg
                transition-all duration-200
                ${isValidName && !isGenerating
                  ? 'mulik-button-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              whileHover={isValidName && !isGenerating ? { scale: 1.02 } : {}}
              whileTap={isValidName && !isGenerating ? { scale: 0.98 } : {}}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  {t('rooms.loading')}
                </span>
              ) : (
                t('rooms.continueToLobby')
              )}
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateRoomPage;
