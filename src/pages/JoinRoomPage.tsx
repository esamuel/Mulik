import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { validateRoomCode, formatRoomCode, cleanRoomCode } from '../utils/roomCode';
import { joinRoom } from '../services/roomService';
import { isFirebaseAvailable } from '../services/firebase';
import { useToast } from '../components/UI/Toast';
import QRCodeScanner from '../components/UI/QRCodeScanner';
import type { Player } from '../types/game.types';

type JoinMethod = 'code' | 'qr' | 'link';

const JoinRoomPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(searchParams.get('code') || '');
  const [link, setLink] = useState('');
  const [activeMethod, setActiveMethod] = useState<JoinMethod>('code');
  const [isJoining, setIsJoining] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; room?: string }>({});
  const [showQRScanner, setShowQRScanner] = useState(false);

  const isRTL = i18n.language === 'he';

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

  // Validate and format room code input
  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Limit to 6 characters
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    
    setRoomCode(value);
    
    // Clear error when user starts typing
    if (errors.room) {
      setErrors({ ...errors, room: undefined });
    }
  };

  // Extract room code from link
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const linkValue = e.target.value;
    setLink(linkValue);
    
    // Try to extract room code from URL
    try {
      const url = new URL(linkValue);
      const codeParam = url.searchParams.get('code');
      if (codeParam && validateRoomCode(codeParam)) {
        setRoomCode(codeParam);
      }
    } catch {
      // Not a valid URL, ignore
    }
    
    // Clear error
    if (errors.room) {
      setErrors({ ...errors, room: undefined });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setPlayerName(name);
    
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  const handleJoin = async () => {
    // Validate name
    const nameError = validateName(playerName);
    if (nameError) {
      setErrors({ ...errors, name: nameError });
      return;
    }

    // Validate room code
    const cleanCode = cleanRoomCode(roomCode);
    if (!validateRoomCode(cleanCode)) {
      setErrors({ ...errors, room: t('rooms.invalidRoomCode') });
      return;
    }

    setIsJoining(true);

    try {
      // Generate player ID
      const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Check if Firebase is available
      if (!isFirebaseAvailable()) {
        showToast('Firebase not configured. Cannot join multiplayer rooms.', 'error');
        setIsJoining(false);
        return;
      }

      // Create player object
      const player: Player = {
        id: playerId,
        name: playerName.trim(),
        isHost: false,
        isConnected: true,
        isReady: false,
        lastSeen: Date.now(),
      };

      // Join room via Firebase
      const roomData = await joinRoom(cleanCode, player);

      // Success - navigate to lobby
      showToast(`Joined room ${formatRoomCode(cleanCode)}!`, 'success');
      setTimeout(() => {
        navigate(`/lobby/${cleanCode}`);
      }, 1000);

    } catch (error) {
      console.error('Failed to join room:', error);
      const errorMessage = error instanceof Error ? error.message : t('rooms.joinError');
      setErrors({ ...errors, room: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      setIsJoining(false);
    }
  };

  // QR Scanner handlers
  const handleScanQR = () => {
    setShowQRScanner(true);
  };

  const handleQRScanResult = (scannedCode: string) => {
    setRoomCode(scannedCode);
    setActiveMethod('code');
    setShowQRScanner(false);
    showToast('QR code scanned successfully!', 'success');
  };

  const handleQRScanError = (error: string) => {
    console.error('QR scan error:', error);
    showToast('Failed to scan QR code', 'error');
  };


  const handleBack = () => {
    navigate('/');
  };

  const isValidName = !validateName(playerName);
  const isValidCode = validateRoomCode(cleanRoomCode(roomCode));

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
          {t('rooms.joinGame')}
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
            />
            {errors.name && (
              <motion.p
                className="text-red-500 text-sm mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>

          {/* Join Methods */}
          <motion.div
            className="mulik-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t('rooms.joinMethods')}
            </h3>

            {/* Method Tabs */}
            <div className="flex gap-2 mb-6">
              {(['code', 'qr', 'link'] as JoinMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setActiveMethod(method)}
                  className={`
                    flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
                    ${activeMethod === method
                      ? 'bg-mulik-primary-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {method === 'code' && '🔢'}
                  {method === 'qr' && '📱'}
                  {method === 'link' && '🔗'}
                  <span className="ml-2">{t(`rooms.${method === 'code' ? 'enterCode' : method === 'qr' ? 'scanQR' : 'pasteLink'}`)}</span>
                </button>
              ))}
            </div>

            {/* Method Content */}
            <div className="space-y-4">
              {/* Enter Code Method */}
              {activeMethod === 'code' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.roomCode')}
                  </label>
                  <input
                    type="text"
                    value={formatRoomCode(roomCode)}
                    onChange={handleRoomCodeChange}
                    placeholder="XXX-XXX"
                    maxLength={7} // 6 characters + 1 hyphen
                    className={`
                      w-full px-4 py-3 text-2xl font-bold text-center tracking-wider rounded-lg border-2 
                      transition-colors duration-200 uppercase
                      focus:outline-none focus:ring-2 focus:ring-mulik-primary-500
                      ${errors.room 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 bg-white'
                      }
                    `}
                  />
                  {errors.room && (
                    <motion.p
                      className="text-red-500 text-sm mt-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.room}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Scan QR Method */}
              {activeMethod === 'qr' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-4"
                >
                  <div className="bg-gray-100 rounded-lg p-8">
                    <span className="text-6xl">📷</span>
                    <p className="text-gray-600 mt-4">
                      Click the button below to open your camera and scan a QR code
                    </p>
                  </div>
                  <motion.button
                    onClick={handleScanQR}
                    className="mulik-button-primary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📱 {t('rooms.scanQR')}
                  </motion.button>
                </motion.div>
              )}

              {/* Paste Link Method */}
              {activeMethod === 'link' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rooms.shareLink')}
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={handleLinkChange}
                    placeholder="https://mulik.game/join?code=ABCD12"
                    className={`
                      w-full px-4 py-3 text-sm rounded-lg border-2 
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-mulik-primary-500
                      ${errors.room 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300 bg-white'
                      }
                    `}
                  />
                  {roomCode && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✅ Room code detected: <strong>{formatRoomCode(roomCode)}</strong>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Join Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={handleJoin}
              disabled={!isValidName || !isValidCode || isJoining}
              className={`
                w-full py-4 px-8 text-lg font-semibold rounded-xl shadow-lg
                transition-all duration-200
                ${isValidName && isValidCode && !isJoining
                  ? 'mulik-button-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              whileHover={isValidName && isValidCode && !isJoining ? { scale: 1.02 } : {}}
              whileTap={isValidName && isValidCode && !isJoining ? { scale: 0.98 } : {}}
            >
              {isJoining ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                  {t('rooms.checkingRoom')}
                </span>
              ) : (
                <>
                  🎮 {t('rooms.join')}
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* QR Code Scanner */}
      <QRCodeScanner
        isOpen={showQRScanner}
        onScan={handleQRScanResult}
        onError={handleQRScanError}
        onClose={() => setShowQRScanner(false)}
      />
    </div>
  );
};

export default JoinRoomPage;
