#!/usr/bin/env tsx

/**
 * Firebase Card Data Upload Script
 * 
 * This script uploads the card data from local JSON files to Firebase Firestore.
 * Run this script to populate your Firebase database with game cards.
 * 
 * Usage:
 *   npm run upload-cards
 *   or
 *   npx tsx scripts/uploadCards.ts
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';

// Load environment variables from .env file
config();
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
};

interface Card {
  id: string;
  category: string;
  difficulty: string;
  clues: string[];
}

interface CardData {
  cards: Card[];
}

async function uploadCards() {
  console.log('🚀 Starting Firebase card data upload...\n');

  // Validate Firebase configuration
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Firebase configuration missing!');
    console.error('Please set up your .env file with Firebase credentials.');
    console.error('Copy .env.example to .env and fill in your Firebase config.');
    process.exit(1);
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');

    // Load English cards
    console.log('📖 Loading English cards...');
    const enCardsPath = join(process.cwd(), 'src/data/cards-en.json');
    const enCardsData: CardData = JSON.parse(readFileSync(enCardsPath, 'utf-8'));
    console.log(`   Found ${enCardsData.cards.length} English cards`);

    // Load Hebrew cards
    console.log('📖 Loading Hebrew cards...');
    const heCardsPath = join(process.cwd(), 'src/data/cards-he.json');
    const heCardsData: CardData = JSON.parse(readFileSync(heCardsPath, 'utf-8'));
    console.log(`   Found ${heCardsData.cards.length} Hebrew cards`);

    // Upload English cards
    console.log('\n🔄 Uploading English cards to Firebase...');
    const enBatch = writeBatch(db);
    const enCollection = collection(db, 'cards-en');
    
    enCardsData.cards.forEach((card) => {
      const docRef = doc(enCollection, card.id);
      enBatch.set(docRef, {
        ...card,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await enBatch.commit();
    console.log(`✅ Uploaded ${enCardsData.cards.length} English cards`);

    // Upload Hebrew cards
    console.log('🔄 Uploading Hebrew cards to Firebase...');
    const heBatch = writeBatch(db);
    const heCollection = collection(db, 'cards-he');
    
    heCardsData.cards.forEach((card) => {
      const docRef = doc(heCollection, card.id);
      heBatch.set(docRef, {
        ...card,
        language: 'he',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await heBatch.commit();
    console.log(`✅ Uploaded ${heCardsData.cards.length} Hebrew cards`);

    // Create metadata document
    console.log('🔄 Creating metadata document...');
    const metadataRef = doc(db, 'metadata', 'cards');
    await setDoc(metadataRef, {
      totalCards: {
        en: enCardsData.cards.length,
        he: heCardsData.cards.length,
        total: enCardsData.cards.length + heCardsData.cards.length
      },
      categories: {
        en: [...new Set(enCardsData.cards.map(card => card.category))],
        he: [...new Set(heCardsData.cards.map(card => card.category))]
      },
      difficulties: {
        en: [...new Set(enCardsData.cards.map(card => card.difficulty))],
        he: [...new Set(heCardsData.cards.map(card => card.difficulty))]
      },
      lastUpdated: new Date(),
      version: '1.0.0'
    });
    console.log('✅ Metadata document created');

    // Summary
    console.log('\n🎉 Upload completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • English cards: ${enCardsData.cards.length}`);
    console.log(`   • Hebrew cards: ${heCardsData.cards.length}`);
    console.log(`   • Total cards: ${enCardsData.cards.length + heCardsData.cards.length}`);
    console.log(`   • Firebase project: ${firebaseConfig.projectId}`);
    
    console.log('\n🔗 Next steps:');
    console.log('   1. Check your Firebase Console to verify the data');
    console.log('   2. Update your app to use Firebase cards (optional)');
    console.log('   3. Set up Firestore security rules for card access');
    
    console.log('\n✨ Your MULIK game now has card data in Firebase!');

  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        console.error('\n🔒 Permission denied. Please check:');
        console.error('   • Your Firebase security rules allow writes');
        console.error('   • Your API key has the correct permissions');
        console.error('   • Your project ID is correct');
      } else if (error.message.includes('not-found')) {
        console.error('\n🔍 Project not found. Please check:');
        console.error('   • Your Firebase project ID is correct');
        console.error('   • The project exists in your Firebase console');
      }
    }
    
    process.exit(1);
  }
}

// Run the upload
uploadCards().catch(console.error);
