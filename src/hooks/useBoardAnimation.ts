import { useCallback, useRef } from 'react';
import { soundService } from '../services/soundService';
import type { TeamColor } from '../types/game.types';

interface UseBoardAnimationReturn {
  animateMove: (team: TeamColor, fromPos: number, toPos: number) => Promise<void>;
  highlightSpace: (position: number) => void;
  showSpecialEffect: (type: string, position: number) => void;
  celebrateWin: (team: TeamColor) => void;
  isAnimating: boolean;
}

export const useBoardAnimation = (): UseBoardAnimationReturn => {
  const animationRef = useRef<boolean>(false);
  const highlightedSpaceRef = useRef<number | null>(null);

  /**
   * Animate pawn movement from one position to another
   */
  const animateMove = useCallback(async (
    team: TeamColor,
    fromPos: number,
    toPos: number
  ): Promise<void> => {
    if (animationRef.current) {
      console.warn('Animation already in progress');
      return;
    }

    animationRef.current = true;

    try {
      // Play movement sound
      soundService.play('move-pawn');

      // Calculate animation duration based on distance
      const distance = Math.abs(toPos - fromPos);
      const baseDuration = 500; // Base 500ms
      const durationPerSpace = 100; // 100ms per space
      const totalDuration = Math.min(baseDuration + (distance * durationPerSpace), 2000);

      // Animate the pawn movement
      // Note: The actual animation is handled by Framer Motion in the Pawn component
      // This function manages the timing and sound effects

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, totalDuration));

      // Play landing sound
      soundService.play('correct-answer');

    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      animationRef.current = false;
    }
  }, []);

  /**
   * Highlight a specific space on the board
   */
  const highlightSpace = useCallback((position: number) => {
    highlightedSpaceRef.current = position;
    
    // Auto-remove highlight after 3 seconds
    setTimeout(() => {
      if (highlightedSpaceRef.current === position) {
        highlightedSpaceRef.current = null;
      }
    }, 3000);
  }, []);

  /**
   * Show special effect for different space types
   */
  const showSpecialEffect = useCallback((type: string, position: number) => {
    switch (type) {
      case 'bonus':
        soundService.play('correct-answer');
        break;
      case 'lightning':
        soundService.play('timer-warning');
        break;
      case 'switch':
        soundService.play('move-pawn');
        break;
      case 'steal':
        soundService.play('wrong-answer');
        break;
      default:
        break;
    }

    // Highlight the space
    highlightSpace(position);
  }, [highlightSpace]);

  /**
   * Celebrate team victory
   */
  const celebrateWin = useCallback((team: TeamColor) => {
    // Play victory sound
    soundService.play('correct-answer');

    // Create confetti effect (would be implemented with a library like react-confetti)
    console.log(`🎉 ${team} team wins! 🎉`);

    // Could trigger additional animations here
    // - Confetti
    // - Screen shake
    // - Victory music
    // - Fireworks
  }, []);

  return {
    animateMove,
    highlightSpace,
    showSpecialEffect,
    celebrateWin,
    isAnimating: animationRef.current,
  };
};
