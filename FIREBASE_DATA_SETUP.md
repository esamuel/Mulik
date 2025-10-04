# 🔥 Firebase Data Setup for MULIK Game

This guide will help you set up Firebase with real card data for the MULIK multiplayer game.

## 📋 Prerequisites

- Node.js installed
- Firebase project created (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
- Environment variables configured in `.env` file

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
# Install tsx for running TypeScript scripts
npm install --save-dev tsx
```

### Step 2: Set Up Firebase Configuration

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Firebase credentials in `.env`:**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   ```

### Step 3: Test Firebase Connection

```bash
npm run setup-firebase
```

This will:
- ✅ Validate your Firebase configuration
- ✅ Test Firestore connection
- ✅ Test Realtime Database connection
- ✅ Create initial app configuration
- ✅ Check for existing card data

### Step 4: Upload Card Data

```bash
npm run upload-cards
```

This will:
- 📖 Load cards from `src/data/cards-en.json` and `src/data/cards-he.json`
- 🔄 Upload all cards to Firebase Firestore
- 📊 Create metadata document with statistics
- ✅ Verify upload completion

## 📊 What Gets Uploaded

### Card Collections

**`/cards-en`** - English cards
```typescript
{
  id: "001",
  category: "general",
  difficulty: "easy", 
  clues: ["Phone", "Laptop", "Book"],
  language: "en",
  createdAt: Date,
  updatedAt: Date
}
```

**`/cards-he`** - Hebrew cards
```typescript
{
  id: "001",
  category: "general",
  difficulty: "easy",
  clues: ["טלפון", "מחשב נייד", "ספר"],
  language: "he", 
  createdAt: Date,
  updatedAt: Date
}
```

### Metadata Document

**`/metadata/cards`**
```typescript
{
  totalCards: {
    en: 100,
    he: 100,
    total: 200
  },
  categories: {
    en: ["general", "movies", "places", "food", "animals", "technology"],
    he: ["כללי", "סרטים", "מקומות", "אוכל", "חיות", "טכנולוgiה"]
  },
  difficulties: {
    en: ["easy", "medium", "hard"],
    he: ["קל", "בינוני", "קשה"]
  },
  lastUpdated: Date,
  version: "1.0.0"
}
```

### App Configuration

**`/config/app`**
```typescript
{
  name: "MULIK",
  version: "1.0.0",
  supportedLanguages: ["en", "he"],
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
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Using Firebase Cards in Your App

### Option 1: Hybrid Approach (Recommended)

The app will try Firebase first, fall back to local files:

```typescript
import { loadCardsHybrid } from '../services/firebaseCardDatabase';

// This will use Firebase if available, local files as fallback
const cards = await loadCardsHybrid('en');
```

### Option 2: Firebase Only

```typescript
import { loadCardsFromFirebase } from '../services/firebaseCardDatabase';

const cards = await loadCardsFromFirebase('en');
```

### Option 3: Keep Using Local Files

No changes needed - the app will continue using local JSON files.

## 🛡️ Security Rules

Add these Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Card collections - read only for all users
    match /cards-{language}/{cardId} {
      allow read: if true;
      allow write: if false; // Only admins can modify cards
    }
    
    // Metadata - read only
    match /metadata/{document} {
      allow read: if true;
      allow write: if false;
    }
    
    // App config - read only
    match /config/{document} {
      allow read: if true;
      allow write: if false;
    }
    
    // Room documents (existing rules)
    match /rooms/{roomCode} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## 📱 Testing Your Setup

### 1. Verify Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Check for collections:
   - `cards-en` (should have ~100+ documents)
   - `cards-he` (should have ~100+ documents)
   - `metadata` (should have `cards` document)
   - `config` (should have `app` document)

### 2. Test in Your App

```bash
npm run dev
```

Visit `http://localhost:5173/comprehensive` and run the browser compatibility tests.

### 3. Check Console Logs

Look for these messages in browser console:
```
✅ Firebase app initialized
✅ Firestore initialized
Loading cards from Firebase collection: cards-en
Loaded 100 cards from Firebase
```

## 🔄 Updating Card Data

### Adding New Cards

1. **Edit local JSON files:**
   - `src/data/cards-en.json`
   - `src/data/cards-he.json`

2. **Re-upload to Firebase:**
   ```bash
   npm run upload-cards
   ```

### Bulk Updates

The upload script will overwrite existing cards with the same ID, so you can:
1. Modify your local JSON files
2. Run the upload script again
3. New cards will be added, existing cards will be updated

## 🚨 Troubleshooting

### "Permission denied" errors

1. **Check your Firebase configuration:**
   ```bash
   npm run setup-firebase
   ```

2. **Verify your `.env` file has correct values**

3. **Check Firestore security rules** - make sure they allow reads/writes

### "Project not found" errors

1. **Verify your project ID** in `.env` file
2. **Check that the project exists** in Firebase Console
3. **Ensure the project is active** (not deleted)

### "Network error" or timeout

1. **Check your internet connection**
2. **Try again** - Firebase sometimes has temporary issues
3. **Check Firebase status** at [status.firebase.google.com](https://status.firebase.google.com)

### Cards not loading in app

1. **Check browser console** for error messages
2. **Verify Firebase initialization** in app
3. **Test with local files** to isolate the issue
4. **Check Firestore security rules** allow reads

## 📊 Current Card Data

The MULIK game includes:

### English Cards (`cards-en.json`)
- **Categories**: general, movies, places, food, animals, technology
- **Difficulties**: easy, medium, hard
- **Total**: ~100+ cards with 3 clues each

### Hebrew Cards (`cards-he.json`)
- **Categories**: כללי, סרטים, מקומות, אוכל, חיות, טכנולוגיה
- **Difficulties**: קל, בינוני, קשה
- **Total**: ~100+ cards with 3 clues each

## 🎯 Next Steps

1. **✅ Set up Firebase** - `npm run setup-firebase`
2. **✅ Upload cards** - `npm run upload-cards`
3. **🔒 Configure security rules** in Firebase Console
4. **🧪 Test your app** - `npm run dev`
5. **🚀 Deploy to production** - See [DEPLOYMENT.md](DEPLOYMENT.md)

## 💡 Pro Tips

- **Backup your data** before making changes
- **Test locally first** before uploading to production
- **Monitor Firebase usage** in the console
- **Set up billing alerts** to avoid unexpected charges
- **Use Firebase emulators** for local development

---

**Your MULIK game now has professional Firebase data management! 🎮🔥**
