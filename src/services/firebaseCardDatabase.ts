import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';
import type { Card, Language, Category, Difficulty } from '../types/game.types';

/**
 * Firebase-based card database service
 * This service loads cards from Firebase Firestore instead of local JSON files
 */

/**
 * Loads cards from Firebase Firestore
 * @param language - The language to load cards for ('he' or 'en')
 * @returns Promise that resolves to an array of cards
 */
export const loadCardsFromFirebase = async (language: Language): Promise<Card[]> => {
  try {
    const db = getFirestoreInstance();
    const collectionName = `cards-${language}`;
    const cardsCollection = collection(db, collectionName);
    
    console.log(`Loading cards from Firebase collection: ${collectionName}`);
    
    const snapshot = await getDocs(cardsCollection);
    const cards: Card[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      cards.push({
        id: data.id || doc.id,
        category: data.category,
        difficulty: data.difficulty,
        clues: data.clues
      });
    });
    
    console.log(`Loaded ${cards.length} cards from Firebase`);
    return cards;
    
  } catch (error) {
    console.error(`Failed to load cards from Firebase for language ${language}:`, error);
    
    // Fallback to local JSON files
    console.log('Falling back to local JSON files...');
    const { loadCards } = await import('./cardDatabase');
    return loadCards(language);
  }
};

/**
 * Loads cards with specific filters from Firebase
 * @param language - The language to load cards for
 * @param category - Optional category filter
 * @param difficulty - Optional difficulty filter
 * @param maxCards - Maximum number of cards to load
 * @returns Promise that resolves to an array of filtered cards
 */
export const loadFilteredCardsFromFirebase = async (
  language: Language,
  category?: Category,
  difficulty?: Difficulty,
  maxCards?: number
): Promise<Card[]> => {
  try {
    const db = getFirestoreInstance();
    const collectionName = `cards-${language}`;
    let cardsQuery = query(collection(db, collectionName));
    
    // Apply filters
    if (category) {
      cardsQuery = query(cardsQuery, where('category', '==', category));
    }
    
    if (difficulty) {
      cardsQuery = query(cardsQuery, where('difficulty', '==', difficulty));
    }
    
    // Add ordering and limit
    cardsQuery = query(cardsQuery, orderBy('id'));
    
    if (maxCards) {
      cardsQuery = query(cardsQuery, limit(maxCards));
    }
    
    const snapshot = await getDocs(cardsQuery);
    const cards: Card[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      cards.push({
        id: data.id || doc.id,
        category: data.category,
        difficulty: data.difficulty,
        clues: data.clues
      });
    });
    
    console.log(`Loaded ${cards.length} filtered cards from Firebase`);
    return cards;
    
  } catch (error) {
    console.error('Failed to load filtered cards from Firebase:', error);
    
    // Fallback to local filtering
    const allCards = await loadCardsFromFirebase(language);
    let filtered = allCards;
    
    if (category) {
      filtered = filtered.filter(card => card.category === category);
    }
    
    if (difficulty) {
      filtered = filtered.filter(card => card.difficulty === difficulty);
    }
    
    if (maxCards) {
      filtered = filtered.slice(0, maxCards);
    }
    
    return filtered;
  }
};

/**
 * Gets card statistics from Firebase
 * @param language - The language to get stats for
 * @returns Promise that resolves to card statistics
 */
export const getCardStatsFromFirebase = async (language: Language) => {
  try {
    const cards = await loadCardsFromFirebase(language);
    
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
    
  } catch (error) {
    console.error('Failed to get card stats from Firebase:', error);
    return {
      total: 0,
      byCategory: {} as Record<Category, number>,
      byDifficulty: {} as Record<Difficulty, number>,
    };
  }
};

/**
 * Hybrid card loader - tries Firebase first, falls back to local files
 * @param language - The language to load cards for
 * @returns Promise that resolves to an array of cards
 */
export const loadCardsHybrid = async (language: Language): Promise<Card[]> => {
  try {
    // Try Firebase first
    return await loadCardsFromFirebase(language);
  } catch (error) {
    console.warn('Firebase card loading failed, using local files:', error);
    
    // Fallback to local JSON files
    const { loadCards } = await import('./cardDatabase');
    return loadCards(language);
  }
};

// Re-export utility functions from the original card database
export {
  getRandomCard,
  getCardById,
  filterByCategory,
  filterByDifficulty,
  shuffleCards,
  resetDeck,
  getFilteredCards,
  validateCard
} from './cardDatabase';
