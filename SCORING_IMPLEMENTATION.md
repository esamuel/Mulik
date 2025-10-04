# Scoring and Turn Management Implementation

## Current Status

### ✅ Working
- Card display with all 6 clues
- Button interactions (Correct, Pass, Skip, End Turn)
- Firebase room creation and joining
- Player presence tracking
- Card flip animations

### ❌ Not Working
1. **Team Scores** - Not updating in UI (shows 0)
2. **Team Players** - Shows "0 players" instead of actual count
3. **Turn Switching** - Doesn't automatically switch to next team
4. **Score Sync** - Local scores don't sync to Firebase

## Implementation Plan

### Phase 1: Sync Team Data from Firebase to UI
**File**: `src/pages/GamePage.tsx`
- Use `useRoom` hook to get Firebase room data
- Extract team players from room.teams
- Pass correct team data to ScoreBoard

### Phase 2: Update Scoring Logic
**File**: `src/pages/GamePage.tsx`
- When `markCardCorrect()` is called, update Firebase room
- Sync scores to Firebase in real-time
- Update team positions on board

### Phase 3: Implement Turn Switching
**File**: `src/pages/GamePage.tsx`
- When "End Turn" is clicked:
  1. Calculate final score for turn
  2. Update team score in Firebase
  3. Show turn summary
  4. Switch to next team
  5. Start new turn with timer

### Phase 4: Firebase Sync Functions
**File**: `src/services/roomService.ts`
- Add `updateTeamScore(roomCode, teamColor, score)`
- Add `switchTurn(roomCode, nextTeam, nextSpeaker)`
- Add `endGameTurn(roomCode, turnSummary)`

## Data Flow

```
Player Action (Correct/Pass/Skip)
  ↓
Update Local Store (gameStore)
  ↓
Update Firebase Room
  ↓
Firebase triggers real-time update
  ↓
All players see updated scores
```

## Technical Challenges

1. **State Sync**: Local gameStore vs Firebase room state
2. **Real-time Updates**: Multiple players need to see same state
3. **Turn Management**: Coordinating who's turn it is across devices
4. **Race Conditions**: Multiple players clicking buttons simultaneously

## Recommended Approach

**Use Firebase as Source of Truth**:
- Store game state in Firebase
- Local gameStore is just a cache
- Subscribe to Firebase changes
- Update UI from Firebase data

This ensures all players see the same game state in real-time.
