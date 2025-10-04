#!/usr/bin/env tsx

/**
 * Firebase Setup Script
 * 
 * This script helps you set up Firebase for the MULIK game.
 * It validates your configuration and sets up initial data structures.
 * 
 * Usage:
 *   npm run setup-firebase
 *   or
 *   npx tsx scripts/setupFirebase.ts
 */

import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';

// Load environment variables from .env file
config();
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, set } from 'firebase/database';

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

async function setupFirebase() {
  console.log('🔥 MULIK Firebase Setup\n');

  // Validate configuration
  const missingVars = [];
  if (!firebaseConfig.apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missingVars.push('VITE_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missingVars.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missingVars.push('VITE_FIREBASE_APP_ID');

  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase configuration variables:');
    missingVars.forEach(varName => console.error(`   • ${varName}`));
    console.error('\n📝 Please:');
    console.error('   1. Copy .env.example to .env');
    console.error('   2. Fill in your Firebase project credentials');
    console.error('   3. Run this script again');
    process.exit(1);
  }

  try {
    // Initialize Firebase
    console.log('🔄 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const rtdb = getDatabase(app);
    console.log('✅ Firebase initialized successfully');

    // Test Firestore connection
    console.log('🔄 Testing Firestore connection...');
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, {
      message: 'MULIK Firebase setup test',
      timestamp: new Date(),
      version: '1.0.0'
    });
    console.log('✅ Firestore connection successful');

    // Test Realtime Database connection (if URL provided)
    if (firebaseConfig.databaseURL) {
      console.log('🔄 Testing Realtime Database connection...');
      const testRef = ref(rtdb, 'test/connection');
      await set(testRef, {
        message: 'MULIK Firebase setup test',
        timestamp: Date.now(),
        version: '1.0.0'
      });
      console.log('✅ Realtime Database connection successful');
    } else {
      console.log('⚠️  Realtime Database URL not provided - skipping test');
    }

    // Check if cards already exist
    console.log('🔄 Checking existing card data...');
    const enCardsSnapshot = await getDocs(collection(db, 'cards-en'));
    const heCardsSnapshot = await getDocs(collection(db, 'cards-he'));
    
    const enCardCount = enCardsSnapshot.size;
    const heCardCount = heCardsSnapshot.size;

    if (enCardCount > 0 || heCardCount > 0) {
      console.log('📊 Existing card data found:');
      console.log(`   • English cards: ${enCardCount}`);
      console.log(`   • Hebrew cards: ${heCardCount}`);
    } else {
      console.log('📝 No card data found in Firebase');
    }

    // Create initial app configuration
    console.log('🔄 Setting up app configuration...');
    const configDoc = doc(db, 'config', 'app');
    await setDoc(configDoc, {
      name: 'MULIK',
      version: '1.0.0',
      supportedLanguages: ['en', 'he'],
      maxPlayersPerRoom: 12,
      defaultTurnDuration: 60,
      roomCodeLength: 6,
      features: {
        multiplayer: true,
        realTimeSync: true,
        soundEffects: true,
        animations: true,
        accessibility: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ App configuration created');

    // Summary
    console.log('\n🎉 Firebase setup completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Project ID: ${firebaseConfig.projectId}`);
    console.log(`   • Firestore: ✅ Connected`);
    console.log(`   • Realtime DB: ${firebaseConfig.databaseURL ? '✅ Connected' : '⚠️  Not configured'}`);
    console.log(`   • Card data: ${enCardCount + heCardCount > 0 ? '✅ Available' : '📝 Not uploaded'}`);

    console.log('\n🔗 Next steps:');
    if (enCardCount + heCardCount === 0) {
      console.log('   1. Run: npm run upload-cards (to upload card data)');
    }
    console.log('   2. Set up Firestore security rules in Firebase Console');
    console.log('   3. Configure Realtime Database rules in Firebase Console');
    console.log('   4. Test your app: npm run dev');

    console.log('\n🌐 Firebase Console:');
    console.log(`   https://console.firebase.google.com/project/${firebaseConfig.projectId}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        console.error('\n🔒 Permission denied. Please check:');
        console.error('   • Your Firebase project exists');
        console.error('   • Your API key is correct');
        console.error('   • Firestore is enabled in your project');
      } else if (error.message.includes('not-found')) {
        console.error('\n🔍 Project not found. Please check:');
        console.error('   • Your project ID is correct');
        console.error('   • The project exists in Firebase Console');
      } else if (error.message.includes('network')) {
        console.error('\n🌐 Network error. Please check:');
        console.error('   • Your internet connection');
        console.error('   • Firebase service status');
      }
    }
    
    process.exit(1);
  }
}

// Run the setup
setupFirebase().catch(console.error);
