import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { formatRoomCode } from '../utils/roomCode';
import { useRoom } from '../hooks/useRoom';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { leaveRoom } from '../services/roomService';
import { useToast } from '../components/UI/Toast';
import CopyButton from '../components/UI/CopyButton';
import TeamAssignment from '../components/Lobby/TeamAssignment';
import ReadyCheck from '../components/Lobby/ReadyCheck';
import StartGameButton from '../components/Lobby/StartGameButton';
import type { Player } from '../types/game.types';

const LobbyPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();

  const [currentPlayerId] = useState(() => {
    // Get or generate current player ID
    const stored = localStorage.getItem('mulik-player-id');
    if (stored) return stored;
    
    const newId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('mulik-player-id', newId);
    return newId;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isRTL = i18n.language === 'he';

  // Room and multiplayer hooks
  const {
    room,
    loading: roomLoading,
    error: roomError,
    assignTeam,
    toggleReady,
    startGame,
  } = useRoom(roomCode || null);

  const {
    isOnline,
    presenceData,
  } = useMultiplayer({
    roomCode: roomCode || null,
    playerId: currentPlayerId,
    enabled: !!roomCode,
  });

  // Get current player
  const currentPlayer = room?.players[currentPlayerId];
  const isHost = currentPlayer?.isHost || false;

  // Get all players as array
  const players = room ? Object.values(room.players) : [];
  const teams = room ? Object.values(room.teams) : [];

  // Share link
  const shareLink = roomCode ? `${window.location.origin}/join?code=${roomCode}` : '';

  // Handle player ready toggle
  const handleReadyToggle = async () => {
    if (!currentPlayer) return;
    
    try {
      await toggleReady(currentPlayerId);
    } catch (error) {
      console.error('Failed to toggle ready:', error);
      showToast('Failed to update ready status', 'error');
    }
  };

  // Handle team assignment
  const handleAssignPlayer = async (playerId: string, teamColor: any) => {
    try {
      await assignTeam(playerId, teamColor);
      showToast('Player assigned to team', 'success');
    } catch (error) {
      console.error('Failed to assign player:', error);
      showToast('Failed to assign player to team', 'error');
    }
  };

  // Handle player removal (host only)
  const handleRemovePlayer = async (playerId: string) => {
    if (!isHost || !roomCode) return;
    
    try {
      // This would need to be implemented in roomService
      showToast('Player removal not yet implemented', 'info');
    } catch (error) {
      console.error('Failed to remove player:', error);
      showToast('Failed to remove player', 'error');
    }
  };

  // Handle start game
  const handleStartGame = async () => {
    try {
      await startGame();
      // Navigation will happen when room state changes to 'playing'
    } catch (error) {
      console.error('Failed to start game:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
      showToast(errorMessage, 'error');
    }
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    if (!roomCode || isLeaving) return;
    
    setIsLeaving(true);
    
    try {
      await leaveRoom(roomCode, currentPlayerId);
      showToast('Left room', 'success');
      navigate('/');
    } catch (error) {
      console.error('Failed to leave room:', error);
      showToast('Failed to leave room', 'error');
    } finally {
      setIsLeaving(false);
    }
  };

  // Handle share room
  const handleShareRoom = () => {
    if (navigator.share && shareLink) {
      navigator.share({
        title: 'Join my MULIK game!',
        text: `Join my MULIK game with room code: ${formatRoomCode(roomCode || '')}`,
        url: shareLink,
      }).catch(() => {
        // Fallback to copy
        navigator.clipboard.writeText(shareLink);
        showToast('Share link copied to clipboard', 'success');
      });
    } else if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      showToast('Share link copied to clipboard', 'success');
    }
  };

  // Navigate to game when it starts
  useEffect(() => {
    if (room?.gameState === 'playing') {
      navigate(`/game/${roomCode}`);
    }
  }, [room?.gameState, roomCode, navigate]);

  // Handle loading and error states
  if (roomLoading) {
    return (
      <div className="min-h-screen mulik-gradient flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl">{t('rooms.loading')}</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen mulik-gradient flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Room Not Found</h2>
          <p className="mb-4">{roomError?.message || 'This room does not exist or has been deleted.'}</p>
          <button
            onClick={() => navigate('/')}
            className="mulik-button-primary"
          >
            {t('rooms.back')}
          </button>
        </div>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen mulik-gradient flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold mb-2">Not in Room</h2>
          <p className="mb-4">You are not a member of this room.</p>
          <button
            onClick={() => navigate('/')}
            className="mulik-button-primary"
          >
            {t('rooms.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen mulik-gradient ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <motion.header 
        className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Room Code */}
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {formatRoomCode(roomCode || '')}
              </h1>
              <p className="text-sm opacity-75">
                {t('lobby.roomCode')}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <CopyButton
                text={roomCode || ''}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {t('lobby.copyRoomCode')}
              </CopyButton>
              
              <button
                onClick={handleShareRoom}
                className="flex items-center gap-2 bg-white/20 text-white border border-white/30 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
              >
                📤 {t('lobby.shareRoom')}
              </button>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Settings (Host Only) */}
            {isHost && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                title={t('lobby.settings')}
              >
                ⚙️
              </button>
            )}

            {/* Leave Room */}
            <button
              onClick={handleLeaveRoom}
              disabled={isLeaving}
              className="flex items-center gap-2 bg-red-500/80 text-white px-3 py-2 rounded-lg hover:bg-red-600/80 transition-colors disabled:opacity-50"
            >
              {isLeaving ? '⏳' : '🚪'} {t('lobby.leaveRoom')}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        
        {/* Players Count & Status */}
        <motion.div
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t('lobby.playersInLobby')} ({players.length}/{room.settings.maxPlayers})
            </h2>
            
            <div className="flex items-center space-x-4 text-sm">
              <span>
                {t('lobby.readyCount', { 
                  ready: players.filter(p => p.isReady).length,
                  total: players.length 
                })}
              </span>
              
              {!isOnline && (
                <span className="text-red-300">
                  🔴 {t('lobby.offlineIndicator')}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Assignment */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TeamAssignment
              players={players}
              teams={teams}
              currentPlayerId={currentPlayerId}
              isHost={isHost}
              onAssignPlayer={handleAssignPlayer}
              onRemovePlayer={isHost ? handleRemovePlayer : undefined}
            />
          </motion.div>

          {/* Ready Check & Game Controls */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Ready Check */}
            <div className="bg-white rounded-lg p-6">
              <ReadyCheck
                isReady={currentPlayer.isReady}
                onToggle={handleReadyToggle}
                disabled={room.gameState !== 'lobby'}
              />
            </div>

            {/* Start Game */}
            <div className="bg-white rounded-lg p-6">
              <StartGameButton
                players={players}
                teams={teams}
                onStartGame={handleStartGame}
                isHost={isHost}
                disabled={room.gameState !== 'lobby'}
              />
            </div>

            {/* Game Settings Preview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-3 flex items-center">
                ⚙️ {t('lobby.gameSettings')}
                {isHost && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                    {t('lobby.hostOnly')}
                  </span>
                )}
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Max Players:</span>
                  <span>{room.settings.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Turn Duration:</span>
                  <span>{room.settings.turnDuration}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="capitalize">{room.settings.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Language:</span>
                  <span>{room.settings.language === 'he' ? 'עברית' : 'English'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default LobbyPage;
