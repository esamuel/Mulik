import { useState, useEffect, useCallback } from 'react';
import type { Card, Language, Category, Difficulty } from '../types/game.types';
import { 
  loadCards, 
  getRandomCard, 
  resetDeck, 
  getFilteredCards,
  getCardStats 
} from '../services/cardDatabase';

interface UseCardsOptions {
  language: Language;
  category?: Category;
  difficulty?: Difficulty;
  autoReset?: boolean; // Automatically reset deck when empty
}

interface UseCardsReturn {
  cards: Card[];
  loading: boolean;
  error: Error | null;
  usedCardIds: string[];
  currentCard: Card | null;
  cardsRemaining: number;
  totalCards: number;
  getNextCard: () => Card | null;
  markCardUsed: (cardId: string) => void;
  resetUsedCards: () => void;
  stats: ReturnType<typeof getCardStats>;
}

/**
 * Custom hook for managing card state and operations
 * @param options - Configuration options for the hook
 * @returns Object with card state and functions
 */
export const useCards = ({
  language,
  category,
  difficulty,
  autoReset = true
}: UseCardsOptions): UseCardsReturn => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [usedCardIds, setUsedCardIds] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  // Load cards when language changes
  useEffect(() => {
    const loadCardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const allCards = await loadCards(language);
        
        if (allCards.length === 0) {
          throw new Error(`No cards found for language: ${language}`);
        }

        // Filter cards based on category and difficulty
        const filteredCards = getFilteredCards(allCards, category, difficulty);
        
        if (filteredCards.length === 0) {
          console.warn('No cards match the specified filters');
        }

        setCards(filteredCards);
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to load cards');
        setError(errorMessage);
        console.error('Error loading cards:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadCardData();
  }, [language, category, difficulty]);

  // Reset used cards when filters change
  useEffect(() => {
    setUsedCardIds([]);
    setCurrentCard(null);
  }, [language, category, difficulty]);

  // Auto-reset deck when empty (if enabled)
  useEffect(() => {
    if (autoReset && cards.length > 0 && usedCardIds.length >= cards.length) {
      console.log('Auto-resetting deck - all cards have been used');
      setUsedCardIds([]);
    }
  }, [usedCardIds, cards.length, autoReset]);

  /**
   * Gets the next random card that hasn't been used
   */
  const getNextCard = useCallback((): Card | null => {
    if (loading || cards.length === 0) {
      return null;
    }

    const nextCard = getRandomCard(usedCardIds, cards);
    
    if (nextCard) {
      setCurrentCard(nextCard);
      // Automatically mark the card as used when drawn
      setUsedCardIds(prev => [...prev, nextCard.id]);
    } else if (autoReset && usedCardIds.length > 0) {
      // If no cards available and auto-reset is enabled, reset and try again
      setUsedCardIds([]);
      const resetCard = getRandomCard([], cards);
      if (resetCard) {
        setCurrentCard(resetCard);
        setUsedCardIds([resetCard.id]);
        return resetCard;
      }
    }

    return nextCard;
  }, [cards, usedCardIds, loading, autoReset]);

  /**
   * Marks a specific card as used
   */
  const markCardUsed = useCallback((cardId: string) => {
    setUsedCardIds(prev => {
      if (!prev.includes(cardId)) {
        return [...prev, cardId];
      }
      return prev;
    });
  }, []);

  /**
   * Resets the used cards array for a fresh start
   */
  const resetUsedCards = useCallback(() => {
    setUsedCardIds(resetDeck(cards));
    setCurrentCard(null);
  }, [cards]);

  // Calculate derived values
  const cardsRemaining = cards.length - usedCardIds.length;
  const totalCards = cards.length;
  const stats = getCardStats(cards);

  return {
    cards,
    loading,
    error,
    usedCardIds,
    currentCard,
    cardsRemaining,
    totalCards,
    getNextCard,
    markCardUsed,
    resetUsedCards,
    stats,
  };
};
