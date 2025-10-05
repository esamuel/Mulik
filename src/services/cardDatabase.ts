import type { Card, Language, Category, Difficulty } from '../types/game.types';

/**
 * Loads cards from the appropriate language file
 * @param language - The language to load cards for ('he' or 'en')
 * @returns Promise that resolves to an array of cards
 */
export const loadCards = async (language: Language): Promise<Card[]> => {
  try {
    let cardModule: any;
    
    if (language === 'he') {
      cardModule = await import('../data/cards-he.json');
    } else {
      cardModule = await import('../data/cards-en.json');
    }
    
    // Handle both default export and direct export
    const cardData = cardModule.default || cardModule;
    return cardData.cards || [];
  } catch (error) {
    console.error(`Failed to load cards for language ${language}:`, error);
    return [];
  }
};

/**
 * Returns a random unused card from the available cards
 * @param usedIds - Array of card IDs that have already been used
 * @param allCards - Array of all available cards
 * @returns A random unused card or null if all cards have been used
 */
export const getRandomCard = (usedIds: string[], allCards: Card[]): Card | null => {
  if (!allCards || allCards.length === 0) {
    return null;
  }

  const availableCards = allCards.filter(card => !usedIds.includes(card.id));
  
  if (availableCards.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex];
};

/**
 * Finds a specific card by its ID
 * @param id - The ID of the card to find
 * @param cards - Array of cards to search in
 * @returns The card with the matching ID or undefined if not found
 */
export const getCardById = (id: string, cards: Card[]): Card | undefined => {
  return cards.find(card => card.id === id);
};

/**
 * Filters cards by category
 * @param cards - Array of cards to filter
 * @param category - The category to filter by
 * @returns Array of cards matching the specified category
 */
export const filterByCategory = (cards: Card[], category: Category): Card[] => {
  return cards.filter(card => card.category === category);
};

/**
 * Filters cards by difficulty level
 * @param cards - Array of cards to filter
 * @param difficulty - The difficulty level to filter by
 * @returns Array of cards matching the specified difficulty
 */
export const filterByDifficulty = (cards: Card[], difficulty: Difficulty): Card[] => {
  return cards.filter(card => card.difficulty === difficulty);
};

/**
 * Returns a shuffled copy of the cards array
 * @param cards - Array of cards to shuffle
 * @returns A new shuffled array of cards
 */
export const shuffleCards = (cards: Card[]): Card[] => {
  const shuffled = [...cards];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * Resets the deck by returning an empty array of used card IDs
 * @param allCards - Array of all available cards (for validation)
 * @returns Empty array for fresh start
 */
export const resetDeck = (allCards: Card[]): string[] => {
  // Validate that we have cards available
  if (!allCards || allCards.length === 0) {
    console.warn('No cards available to reset deck');
  }
  
  return [];
};

/**
 * Gets cards filtered by both category and difficulty
 * @param cards - Array of cards to filter
 * @param category - The category to filter by (optional)
 * @param difficulty - The difficulty to filter by (optional)
 * @returns Array of cards matching both filters
 */
export const getFilteredCards = (
  cards: Card[], 
  category?: Category, 
  difficulty?: Difficulty
): Card[] => {
  let filtered = cards;
  
  if (category) {
    filtered = filterByCategory(filtered, category);
  }
  
  if (difficulty) {
    filtered = filterByDifficulty(filtered, difficulty);
  }
  
  return filtered;
};

/**
 * Gets statistics about the card collection
 * @param cards - Array of cards to analyze
 * @returns Object with statistics about the cards
 */
export const getCardStats = (cards: Card[]) => {
  const stats = {
    total: cards.length,
    byCategory: {} as Record<Category, number>,
    byDifficulty: {} as Record<Difficulty, number>,
  };

  cards.forEach(card => {
    // Count by category
    stats.byCategory[card.category] = (stats.byCategory[card.category] || 0) + 1;
    
    // Count by difficulty
    stats.byDifficulty[card.difficulty] = (stats.byDifficulty[card.difficulty] || 0) + 1;
  });

  return stats;
};

/**
 * Validates that a card has the required structure
 * @param card - The card object to validate
 * @returns True if the card is valid, false otherwise
 */
export const validateCard = (card: any): card is Card => {
  return (
    typeof card === 'object' &&
    card !== null &&
    typeof card.id === 'string' &&
    Array.isArray(card.words) &&
    card.words.length === 8 &&
    card.words.every((word: any) => typeof word === 'string')
  );
};
