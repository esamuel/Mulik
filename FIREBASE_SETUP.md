# Firebase Setup Guide for MULIK

This guide will help you set up Firebase for the MULIK multiplayer game.

## Prerequisites

- Node.js installed
- A Google account
- Basic understanding of Firebase

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `mulik-game` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Your Web App

1. In your Firebase project, click the web icon (`</>`) to add a web app
2. Register app with nickname: `MULIK Web App`
3. **Don't** check "Firebase Hosting" (unless you plan to use it)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need these values)

## Step 3: Enable Firestore Database

1. In the Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (we'll add security rules later)
4. Select your preferred region (choose closest to your users)
5. Click "Enable"

## Step 4: Enable Realtime Database

1. In the Firebase Console, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose "Start in test mode" for development
4. Select your preferred region
5. Click "Enable"

## Step 5: Configure Environment Variables

1. Copy `.env.example` to `.env` in your project root:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values from your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   ```

3. **Important**: Never commit your `.env` file to version control!

## Step 6: Set Up Security Rules

### Firestore Security Rules

Go to Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Room documents
    match /rooms/{roomCode} {
      // Anyone can read rooms (to join)
      allow read: if true;
      
      // Only authenticated users can create rooms
      allow create: if request.auth != null;
      
      // Only host can update room settings
      allow update: if request.auth != null && (
        // Players can update their own player data
        request.resource.data.players[request.auth.uid] != null ||
        // Host can update anything
        resource.data.hostId == request.auth.uid
      );
      
      // Only host can delete
      allow delete: if request.auth != null && 
                       resource.data.hostId == request.auth.uid;
    }
  }
}
```

### Realtime Database Security Rules

Go to Realtime Database → Rules and add:

```json
{
  "rules": {
    "presence": {
      "$roomCode": {
        "$playerId": {
          ".read": true,
          ".write": true
        }
      }
    }
  }
}
```

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the browser console and check for Firebase initialization messages:
   ```
   ✅ Firebase app initialized
   ✅ Firestore initialized
   ✅ Realtime Database initialized
   ✅ Firebase Auth initialized
   ```

3. Try creating a room from the app - it should save to Firestore

## Optional: Firebase Emulators (for Development)

For local development without using cloud Firebase:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select: Firestore, Realtime Database, Emulators
   - Use existing project
   - Accept defaults

4. Start emulators:
   ```bash
   firebase emulators:start
   ```

5. Update `.env`:
   ```env
   VITE_USE_FIREBASE_EMULATOR=true
   ```

## Data Structure

### Firestore: `/rooms/{roomCode}`

```typescript
{
  code: string,
  hostId: string,
  settings: {
    maxPlayers: number,
    turnDuration: number,
    difficulty: 'easy' | 'medium' | 'hard',
    language: 'en' | 'he',
    boardSize: number,
    teamsCount: number
  },
  players: {
    [playerId]: {
      id: string,
      name: string,
      isHost: boolean,
      isConnected: boolean,
      isReady: boolean,
      team?: 'red' | 'blue' | 'green' | 'yellow',
      lastSeen: number
    }
  },
  teams: {
    red: { color, name, players[], position, score },
    blue: { color, name, players[], position, score },
    green: { color, name, players[], position, score },
    yellow: { color, name, players[], position, score }
  },
  gameState: 'lobby' | 'playing' | 'paused' | 'finished',
  currentTurn: { team, speakerId, timeRemaining, cardsWon, cardsPassed, penalties } | null,
  usedCardIds: string[],
  createdAt: number,
  lastActivity: number
}
```

### Realtime Database: `/presence/{roomCode}/{playerId}`

```typescript
{
  online: boolean,
  lastSeen: number
}
```

## Troubleshooting

### "Firebase not configured" error
- Check that all environment variables are set in `.env`
- Restart your dev server after changing `.env`

### Permission denied errors
- Update your Security Rules as shown above
- For development, you can temporarily use test mode

### Connection errors
- Check your internet connection
- Verify your Firebase project is active
- Check Firebase console for any service outages

## Production Considerations

1. **Security Rules**: Update to stricter rules before production
2. **Indexes**: Firestore will suggest indexes as needed
3. **Quotas**: Monitor usage in Firebase Console
4. **Cleanup**: Implement automated room cleanup (Cloud Function)
5. **Error Handling**: Add comprehensive error handling
6. **Rate Limiting**: Implement rate limiting for room creation

## Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your `.env` configuration
3. Check Firebase Console → Functions logs
4. Review Security Rules

---

**Note**: This is a development setup. For production, implement proper authentication, stricter security rules, and monitoring.
