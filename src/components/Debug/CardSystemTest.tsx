import React, { useState } from 'react';
import { useCards } from '../../hooks/useCards';
import type { Language, Category, Difficulty } from '../../types/game.types';

/**
 * Debug component to test card system functionality
 * This component should be removed in production
 */
const CardSystemTest: React.FC = () => {
  const [language, setLanguage] = useState<Language>('he');
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>(undefined);

  const {
    cards,
    loading,
    error,
    currentCard,
    cardsRemaining,
    totalCards,
    getNextCard,
    resetUsedCards,
    stats
  } = useCards({
    language,
    category,
    difficulty,
    autoReset: true
  });

  const handleDrawCard = () => {
    getNextCard();
  };

  const categories: Category[] = ['general', 'movies', 'places', 'food', 'animals', 'technology'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Card System Test</h2>
      
      {/* Controls */}
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        
        {/* Language Selection */}
        <div className="flex items-center gap-4">
          <label className="font-medium">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="he">Hebrew (עברית)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Category Selection */}
        <div className="flex items-center gap-4">
          <label className="font-medium">Category:</label>
          <select
            value={category || ''}
            onChange={(e) => setCategory(e.target.value ? e.target.value as Category : undefined)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Selection */}
        <div className="flex items-center gap-4">
          <label className="font-medium">Difficulty:</label>
          <select
            value={difficulty || ''}
            onChange={(e) => setDifficulty(e.target.value ? e.target.value as Difficulty : undefined)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Status</h3>
        {loading && <p className="text-blue-600">Loading cards...</p>}
        {error && <p className="text-red-600">Error: {error.message}</p>}
        {!loading && !error && (
          <div className="space-y-1">
            <p><strong>Total Cards:</strong> {totalCards}</p>
            <p><strong>Cards Remaining:</strong> {cardsRemaining}</p>
            <p><strong>Language:</strong> {language === 'he' ? 'Hebrew' : 'English'}</p>
            {category && <p><strong>Category:</strong> {category}</p>}
            {difficulty && <p><strong>Difficulty:</strong> {difficulty}</p>}
          </div>
        )}
      </div>

      {/* Statistics */}
      {!loading && !error && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">By Category:</h4>
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <p key={cat} className="text-sm">{cat}: {count}</p>
              ))}
            </div>
            <div>
              <h4 className="font-medium mb-1">By Difficulty:</h4>
              {Object.entries(stats.byDifficulty).map(([diff, count]) => (
                <p key={diff} className="text-sm">{diff}: {count}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mb-6 space-x-2">
        <button
          onClick={handleDrawCard}
          disabled={loading || cardsRemaining === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Draw Card
        </button>
        
        <button
          onClick={resetUsedCards}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Reset Deck
        </button>
      </div>

      {/* Current Card */}
      {currentCard && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="text-lg font-semibold mb-2">Current Card</h3>
          <div className="space-y-2">
            <p><strong>ID:</strong> {currentCard.id}</p>
            <p><strong>Category:</strong> {currentCard.category}</p>
            <p><strong>Difficulty:</strong> {currentCard.difficulty}</p>
            <div>
              <strong>Clues:</strong>
              <div className="mt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                {currentCard.clues.map((clue, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white border rounded text-sm"
                  >
                    {clue}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Cards Preview */}
      {!loading && !error && cards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Available Cards ({cards.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {cards.map(card => (
              <div key={card.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">#{card.id}</span>
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 text-xs rounded ${
                      card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {card.difficulty}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {card.category}
                    </span>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  {card.clues.slice(0, 3).map((clue, index) => (
                    <div key={index} className="text-gray-600">{clue}</div>
                  ))}
                  {card.clues.length > 3 && (
                    <div className="text-gray-400">+{card.clues.length - 3} more...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSystemTest;
