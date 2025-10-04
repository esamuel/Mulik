import { useState, useCallback, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { soundService } from '../services/soundService';
import type { TeamColor, Card } from '../types/game.types';

interface GameFlowState {
  currentCard: Card | null;
  cardsWonThisTurn: number;
  cardsPassedThisTurn: number;
  penalties: number;
  timeLeft: number;
  isActive: boolean;
  currentSpeaker: string | null;
}

interface UseGameFlowReturn extends GameFlowState {
  startTurn: (team: TeamColor, speakerId: string) => Promise<void>;
  markCorrect: () => Promise<void>;
  markPassed: () => Promise<void>;
  markSkipped: () => Promise<void>;
  endTurn: () => Promise<void>;
  nextTurn: () => Promise<void>;
  drawNextCard: () => Promise<void>;
  calculateMovement: () => number;
  resetTurnCounters: () => void;
}

export const useGameFlow = (roomCode?: string): UseGameFlowReturn => {
  const { 
    currentCard, 
    drawCard, 
    moveTeam, 
    nextTeam,
    getCurrentTeam,
    getUsedCards,
    settings 
  } = useGameStore();

  const [gameState, setGameState] = useState<GameFlowState>({
    currentCard: null,
    cardsWonThisTurn: 0,
    cardsPassedThisTurn: 0,
    penalties: 0,
    timeLeft: 0,
    isActive: false,
    currentSpeaker: null,
  });

  const turnStartTimeRef = useRef<number | null>(null);

  /**
   * Start a new turn for the specified team
   */
  const startTurn = useCallback(async (team: TeamColor, speakerId: string) => {
    try {
      // Reset turn counters
      setGameState(prev => ({
        ...prev,
        cardsWonThisTurn: 0,
        cardsPassedThisTurn: 0,
        penalties: 0,
        timeLeft: settings.turnDuration,
        isActive: true,
        currentSpeaker: speakerId,
      }));

      // Draw first card
      const card = drawCard();
      setGameState(prev => ({ ...prev, currentCard: card }));

      // Record turn start time
      turnStartTimeRef.current = Date.now();

      // TODO: Sync to Firebase if roomCode provided
      if (roomCode) {
        console.log(`Turn started for ${team} team, speaker: ${speakerId}`);
      }

      console.log(`🎮 Turn started for ${team} team`);
    } catch (error) {
      console.error('Failed to start turn:', error);
      throw error;
    }
  }, [drawCard, settings.turnDuration, roomCode]);

  /**
   * Mark current card as correct
   */
  const markCorrect = useCallback(async () => {
    if (!gameState.isActive || !gameState.currentCard) return;

    try {
      // Play success sound
      soundService.play('correct-answer');

      // Increment cards won
      setGameState(prev => ({
        ...prev,
        cardsWonThisTurn: prev.cardsWonThisTurn + 1,
      }));

      // Draw next card
      await drawNextCard();

      console.log('✅ Card marked as correct');
    } catch (error) {
      console.error('Failed to mark correct:', error);
      throw error;
    }
  }, [gameState.isActive, gameState.currentCard]);

  /**
   * Mark current card as passed
   */
  const markPassed = useCallback(async () => {
    if (!gameState.isActive || !gameState.currentCard) return;

    try {
      // Increment cards passed
      setGameState(prev => ({
        ...prev,
        cardsPassedThisTurn: prev.cardsPassedThisTurn + 1,
      }));

      // Draw next card
      await drawNextCard();

      console.log('⏭️ Card marked as passed');
    } catch (error) {
      console.error('Failed to mark passed:', error);
      throw error;
    }
  }, [gameState.isActive, gameState.currentCard]);

  /**
   * Mark current card as skipped (penalty)
   */
  const markSkipped = useCallback(async () => {
    if (!gameState.isActive || !gameState.currentCard) return;

    try {
      // Play penalty sound
      soundService.play('wrong-answer');

      // Increment penalties
      setGameState(prev => ({
        ...prev,
        penalties: prev.penalties + 1,
      }));

      // Draw next card
      await drawNextCard();

      console.log('❌ Card marked as skipped (penalty)');
    } catch (error) {
      console.error('Failed to mark skipped:', error);
      throw error;
    }
  }, [gameState.isActive, gameState.currentCard]);

  /**
   * Draw the next card
   */
  const drawNextCard = useCallback(async () => {
    try {
      const nextCard = drawCard();
      setGameState(prev => ({ ...prev, currentCard: nextCard }));
    } catch (error) {
      console.error('Failed to draw next card:', error);
      // If no more cards, end turn
      await endTurn();
    }
  }, [drawCard]);

  /**
   * Calculate movement based on turn performance
   */
  const calculateMovement = useCallback((): number => {
    const { cardsWonThisTurn, penalties } = gameState;
    
    // Base movement: 1 space per card won
    let movement = cardsWonThisTurn;
    
    // Penalty: -1 space per skip (minimum 0)
    movement = Math.max(0, movement - penalties);
    
    // Bonus for excellent performance (5+ cards)
    if (cardsWonThisTurn >= 5) {
      movement += 1; // Bonus space
    }
    
    return movement;
  }, [gameState]);

  /**
   * End the current turn
   */
  const endTurn = useCallback(async () => {
    if (!gameState.isActive) return;

    try {
      // Calculate movement
      const movement = calculateMovement();
      const currentTeam = getCurrentTeam();

      if (currentTeam) {
        // Move team pawn
        moveTeam(currentTeam, movement);
        
        // Play movement sound
        soundService.play('move-pawn');
      }

      // Deactivate turn
      setGameState(prev => ({
        ...prev,
        isActive: false,
        timeLeft: 0,
      }));

      // TODO: Sync to Firebase if roomCode provided
      if (roomCode) {
        console.log(`Turn ended for ${currentTeam}, movement: ${movement}`);
      }

      console.log(`🏁 Turn ended, movement: ${movement} spaces`);
    } catch (error) {
      console.error('Failed to end turn:', error);
      throw error;
    }
  }, [gameState.isActive, calculateMovement, getCurrentTeam, moveTeam, roomCode]);

  /**
   * Move to next turn
   */
  const nextTurn = useCallback(async () => {
    try {
      // Reset turn counters
      resetTurnCounters();

      // Move to next team
      nextTeam();

      console.log('➡️ Moving to next turn');
    } catch (error) {
      console.error('Failed to move to next turn:', error);
      throw error;
    }
  }, [nextTeam]);

  /**
   * Reset turn counters
   */
  const resetTurnCounters = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      cardsWonThisTurn: 0,
      cardsPassedThisTurn: 0,
      penalties: 0,
      currentCard: null,
      currentSpeaker: null,
    }));
    turnStartTimeRef.current = null;
  }, []);

  return {
    ...gameState,
    startTurn,
    markCorrect,
    markPassed,
    markSkipped,
    endTurn,
    nextTurn,
    drawNextCard,
    calculateMovement,
    resetTurnCounters,
  };
};
