import { initializeApp, FirebaseError } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, Database, connectDatabaseEmulator } from 'firebase/database';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import type { Auth } from 'firebase/auth';

/**
 * Firebase configuration from environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

/**
 * Check if Firebase is configured
 */
const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
};

// Firebase instances
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let auth: Auth | null = null;
let connectionStatus = {
  initialized: false,
  error: null as Error | null,
};

/**
 * Initialize Firebase services
 */
const initializeFirebase = (): void => {
  if (connectionStatus.initialized) {
    console.log('Firebase already initialized');
    return;
  }

  try {
    // Check if configuration exists
    if (!isFirebaseConfigured()) {
      const error = new Error(
        'Firebase configuration is missing. Please set environment variables in .env file.'
      );
      connectionStatus.error = error;
      console.warn(error.message);
      console.warn('Running in offline mode. Firebase features will not be available.');
      return;
    }

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');

    // Initialize Firestore
    db = getFirestore(app);
    console.log('✅ Firestore initialized');

    // Initialize Realtime Database
    rtdb = getDatabase(app);
    console.log('✅ Realtime Database initialized');

    // Initialize Auth
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized');

    // Connect to emulators in development if specified
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        if (db) connectFirestoreEmulator(db, 'localhost', 8080);
        if (rtdb) connectDatabaseEmulator(rtdb, 'localhost', 9000);
        if (auth) connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('🔧 Connected to Firebase emulators');
      } catch (error) {
        console.warn('Firebase emulators already connected or not available');
      }
    }

    connectionStatus.initialized = true;
    connectionStatus.error = null;

  } catch (error) {
    const firebaseError = error as FirebaseError;
    connectionStatus.error = firebaseError;
    console.error('❌ Firebase initialization failed:', firebaseError.message);
    console.error('Full error:', firebaseError);
    
    // Provide helpful error messages
    if (firebaseError.code === 'auth/invalid-api-key') {
      console.error('Invalid API key. Check your VITE_FIREBASE_API_KEY environment variable.');
    } else if (firebaseError.code === 'app/invalid-credential') {
      console.error('Invalid Firebase credentials. Check your environment variables.');
    }
  }
};

/**
 * Get Firestore instance
 */
export const getFirestoreInstance = (): Firestore => {
  if (!connectionStatus.initialized) {
    initializeFirebase();
  }
  
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }
  
  return db;
};

/**
 * Get Realtime Database instance
 */
export const getRealtimeDatabaseInstance = (): Database => {
  if (!connectionStatus.initialized) {
    initializeFirebase();
  }
  
  if (!rtdb) {
    throw new Error('Realtime Database is not initialized. Check Firebase configuration.');
  }
  
  return rtdb;
};

/**
 * Get Auth instance
 */
export const getAuthInstance = (): Auth => {
  if (!connectionStatus.initialized) {
    initializeFirebase();
  }
  
  if (!auth) {
    throw new Error('Auth is not initialized. Check Firebase configuration.');
  }
  
  return auth;
};

/**
 * Get connection status
 */
export const getConnectionStatus = () => {
  return { ...connectionStatus };
};

/**
 * Check if Firebase is available
 */
export const isFirebaseAvailable = (): boolean => {
  return connectionStatus.initialized && !connectionStatus.error;
};

// Auto-initialize on import
initializeFirebase();

// Export instances for convenience (may be null if not configured)
export { db, rtdb, auth };

export default {
  getFirestoreInstance,
  getRealtimeDatabaseInstance,
  getAuthInstance,
  getConnectionStatus,
  isFirebaseAvailable,
};
