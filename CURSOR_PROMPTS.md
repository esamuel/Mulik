# 🤖 Cursor/Windsurf Development Prompts for MULIK

Use these prompts in Cursor/Windsurf Agent mode to build MULIK step by step.

**How to use:**
1. Open Cursor/Windsurf
2. Press `Cmd+L` (Mac) or `Ctrl+L` (Windows) to open AI chat
3. Copy and paste each prompt below
4. Let AI build the components
5. Test after each prompt

---

## 🎯 PROMPT 1: Home Page & Navigation

Create a beautiful home page for MULIK game with the following:

File: src/pages/HomePage.tsx

Hero section with MULIK title (large, bold, gradient text)
Subtitle: "The Fast-Talk Challenge" in Hebrew and English
Three main buttons with icons:

🎯 "Create Game" (primary button)
🔗 "Join Game" (secondary button)
📱 "Local Play" (secondary button)


Language toggle (🇮🇱 עברית / 🇺🇸 English) in top-right corner
Settings icon (⚙️) in top-right corner
Use Tailwind CSS with purple gradient background
Fully responsive design for mobile/tablet/desktop
Use translations from src/locales/he.json and en.json with react-i18next
Add Framer Motion animations:

Fade in on load
Buttons scale on hover
Smooth tap animation


Add emoji icons: 🎮, 🎯, 🔗, 📱


Create folder: src/pages/
Update src/App.tsx:

Import HomePage
Replace the placeholder div with proper route to HomePage
Keep the Router setup


Style requirements:

Modern, clean design
Purple/pink gradient background (use existing mulik-primary colors)
White cards with shadow-2xl
Rounded corners (rounded-xl)
Smooth transitions
RTL support for Hebrew (text alignment, padding)
Mobile-first responsive design


Typography:

Title: text-6xl on desktop, text-4xl on mobile
Subtitle: text-2xl on desktop, text-xl on mobile
Buttons: py-4 px-8 with text-lg



Use the existing types from src/types/game.types.ts
Follow the design from src/index.css theme classes
Use useTranslation hook for all text
Ensure proper TypeScript types

## 🎯 PROMPT 2: Settings Page
Create a comprehensive settings page for MULIK:

File: src/pages/SettingsPage.tsx
Features:

Page title "Settings" / "הגדרות" from translations
Back button (← arrow) to home in top-left
Settings sections with cards:
a) Language Section:

Label: "Language" / "שפה"
Toggle: Hebrew 🇮🇱 ←→ 🇺🇸 English
Changes i18next language and document direction

b) Theme Section:

Label: "Theme" / "עיצוב"
Toggle: Modern ←→ Cartoon
Show small preview of each theme

c) Timer Section:

Label: "Timer Duration" / "משך טיימר"
Slider: 30s, 60s, 90s, 120s with value display
Visual marks at each interval

d) Turn Mode Section:

Label: "Turn Mode" / "מצב תור"
Toggle: Auto ←→ Manual
Info icon with tooltip explaining each mode

e) Sound Section:

Label: "Sound Effects" / "צלילים"
Toggle: On ←→ Off
Show volume icon that changes based on state


Save button at bottom (sticky on mobile)
Success message animation when saved


File: src/hooks/useSettings.ts
Create custom hook:

interface Settings based on GameSettings type
Load from localStorage on mount (key: 'mulik-settings')
Provide default settings:

language: 'he'
theme: 'modern'
timerDuration: 60
turnMode: 'auto'
soundEnabled: true


updateSettings function
saveSettings function (persists to localStorage)
Return: { settings, updateSettings, saveSettings }


File: src/components/Settings/LanguageSwitch.tsx

Toggle switch component
Shows flags: 🇮🇱 and 🇺🇸
onClick updates i18next language
Updates document.dir to 'rtl' or 'ltr'
Updates document.documentElement.lang
Smooth slide animation
Props: value, onChange


File: src/components/Settings/ThemeToggle.tsx

Toggle switch component
Shows icons: ✨ (modern) and 🎨 (cartoon)
Applies theme classes to document.body
Preview boxes showing color scheme
Props: value, onChange


File: src/components/UI/Toggle.tsx
Reusable toggle component:

Props: checked, onChange, leftLabel, rightLabel, leftIcon, rightIcon
Animated switch with Framer Motion
Accessible (keyboard support)
Different sizes: small, medium, large



Design:

Use card backgrounds for each section
Spacing: mb-6 between sections
Icons from emoji or lucide-react
Smooth animations with Framer Motion
Mobile responsive (full width cards on mobile)
RTL support

Update src/App.tsx:

Add route: /settings → SettingsPage

## 🎯 PROMPT 3: Game State Management with Zustand
Create the core game state management system using Zustand:

File: src/stores/gameStore.ts
Create a comprehensive Zustand store with TypeScript:
State:

roomCode: string | null
gameState: GameState ('lobby' | 'playing' | 'paused' | 'finished')
teams: Record<TeamColor, Team>
players: Record<string, Player>
currentTurn: CurrentTurn | null
settings: GameSettings
usedCardIds: string[]
currentCard: Card | null
boardSize: number (default 50)

Actions:

initializeRoom(roomCode: string, hostId: string)
addPlayer(player: Player)
removePlayer(playerId: string)
updatePlayer(playerId: string, updates: Partial<Player>)
assignPlayerToTeam(playerId: string, team: TeamColor)
togglePlayerReady(playerId: string)
updateSettings(settings: Partial<GameSettings>)
startGame()
pauseGame()
resumeGame()
endGame(winningTeam: TeamColor)
startTurn(team: TeamColor, speakerId: string)
endTurn()
nextTurn()
drawCard(): Card
markCardCorrect()
markCardPassed()
updateTimer(timeRemaining: number)
moveTeam(team: TeamColor, spaces: number)
resetGame()

Use immer for immutable updates
Add proper TypeScript types for all actions
Include comments explaining each function
File: src/services/gameLogic.ts
Pure helper functions:

calculateMovement(cardsWon: number, cardsPassed: number, penalties: number): number
Formula: cardsWon - cardsPassed - penalties
getNextSpeaker(currentTeam: TeamColor, players: Record<string, Player>, currentSpeakerId: string): string
Returns next player ID in the team (circular rotation)
getNextTeam(currentTeam: TeamColor, teams: Record<TeamColor, Team>): TeamColor
Returns next team with players (circular rotation)
checkWinCondition(position: number, boardSize: number): boolean
Returns true if position >= boardSize
isSpecialSpace(position: number): SpaceConfig | null
Checks if position is special (Bonus, Lightning, Switch, Steal)
Returns space configuration or null
getSpecialSpaceType(position: number): string
Returns: 'bonus' (every 8), 'lightning' (15,30,45), 'switch', 'steal'
validateTeams(teams: Record<TeamColor, Team>): { valid: boolean, message: string }
Checks if at least 2 teams have players
Checks if teams are relatively balanced

All functions with JSDoc comments
Pure functions (no side effects)
100% TypeScript coverage
File: src/utils/roomCode.ts

generateRoomCode(): string
Generates 6-character uppercase alphanumeric code
Excludes confusing characters (0, O, 1, I)
Uses nanoid or custom implementation
validateRoomCode(code: string): boolean
Checks if code is 6 characters
Checks if alphanumeric
Returns true/false
formatRoomCode(code: string): string
Formats as XXX-XXX for display
Example: ABC123 → ABC-123


File: src/utils/animations.ts
Framer Motion animation variants:

fadeIn: opacity 0→1
slideUp: y 20→0
slideDown: y -20→0
scaleIn: scale 0.8→1
bounce: custom bounce animation
shake: shake animation for errors

Export as reusable variants object

Include proper error handling
Add TypeScript strict mode
Write clean, documented code

---

## 🎯 PROMPT 4: Card Database System
Create the card management system:

File: src/data/cards-he.json
Create 20 sample Hebrew cards with this structure:
{
"cards": [
{
"id": "001",
"category": "general",
"difficulty": "easy",
"clues": [
"טלפון",
"מחשב נייד",
"ספר",
"כדור",
"גיטרה",
"שעון"
]
},
{
"id": "002",
"category": "movies",
"difficulty": "medium",
"clues": [
"טיטאניק",
"הארי פוטר",
"שר הטבעות",
"מלך האריות",
"אווטאר",
"גלדיאטור"
]
}
// ... 18 more cards
]
}
Categories to include:

general (5 cards)
movies (3 cards)
places (3 cards)
food (3 cards)
animals (3 cards)
technology (3 cards)

Mix of difficulties: 40% easy, 40% medium, 20% hard
File: src/data/cards-en.json
Same structure with English translations:
{
"cards": [
{
"id": "001",
"category": "general",
"difficulty": "easy",
"clues": [
"Phone",
"Laptop",
"Book",
"Ball",
"Guitar",
"Watch"
]
}
// ... exact same IDs as Hebrew version
]
}
File: src/services/cardDatabase.ts
Functions:

loadCards(language: Language): Promise<Card[]>
Dynamically imports cards-he.json or cards-en.json
Returns parsed Card array
Handles errors gracefully
getRandomCard(usedIds: string[], allCards: Card[]): Card | null
Returns random unused card
Returns null if all cards used
getCardById(id: string, cards: Card[]): Card | undefined
Returns specific card by ID
filterByCategory(cards: Card[], category: string): Card[]
Returns cards matching category
filterByDifficulty(cards: Card[], difficulty: string): Card[]
Returns cards matching difficulty
shuffleCards(cards: Card[]): Card[]
Returns shuffled copy of cards array
resetDeck(allCards: Card[]): string[]
Returns empty usedIds array for fresh start


File: src/hooks/useCards.ts
Custom hook:

State:

cards: Card[]
loading: boolean
error: Error | null
usedCardIds: string[]


Effects:

Load cards when language changes
Reset used cards when deck empty


Functions:

getNextCard(): Card | null
markCardUsed(cardId: string): void
resetDeck(): void
getCardsRemaining(): number


Returns: { cards, loading, error, getNextCard, resetDeck, cardsRemaining }


File: src/types/game.types.ts
Add if missing:

Category type: union of category strings
Difficulty type: 'easy' | 'medium' | 'hard'



Use async/await for file loading
Handle loading states
Error boundaries friendly
TypeScript strict types

---

## 🎯 PROMPT 5: Create & Join Room Pages
Create the room creation and joining user interface:

File: src/pages/CreateRoomPage.tsx
Features:

Page title: "Create Game" / "צור משחק"
Player name input (required, 2-20 characters)
Generate room code automatically (show as XXX-XXX format)
Display QR code (large, centered)
Show shareable link with copy button
Three sharing options cards:

📱 QR Code (show/hide toggle)
🔢 Room Code (with copy button)
🔗 Share Link (with copy button)


"Continue to Lobby" button (creates room in Firebase)
Back to home button

Validation:

Name must be 2-20 characters
Show error messages below input
Disable continue button until valid

Design:

Card-based layout
Center content
Large, scannable QR code
Clear copy feedback ("Copied!" toast)
Mobile responsive


File: src/pages/JoinRoomPage.tsx
Features:

Page title: "Join Game" / "הצטרף למשחק"
Player name input (required, 2-20 characters)
Three join methods (tabs or sections):
a) Enter Code:

6-character input (auto-uppercase)
Format as XXX-XXX while typing
"Join" button

b) Scan QR:

"Scan QR Code" button
Opens camera (use html5-qrcode library)
Auto-join when valid code scanned

c) Paste Link:

Link input field
Extract room code from URL
"Join" button


Loading state while checking room
Error handling:

Room not found
Room full
Room already started


Success: navigate to lobby

Validation:

Room code format (6 alphanumeric)
Name requirements
Show helpful error messages


File: src/components/UI/QRCodeDisplay.tsx
Props: value (room URL), size

Uses react-qr-code
White background, black foreground
Border and padding
Optional download button
Responsive size (smaller on mobile)


File: src/components/UI/CopyButton.tsx
Props: text (to copy), children (button label)

Clipboard API for copying
Show success feedback (toast or tooltip)
Icon changes: 📋 → ✅
Accessible (keyboard support)
Handle copy errors gracefully


File: src/components/UI/Toast.tsx
Toast notification system:

Position: top-center or bottom-center
Auto-dismiss after 3 seconds
Types: success, error, info
Slide in/out animation
Queue multiple toasts
Use Framer Motion AnimatePresence


Update src/App.tsx routes:

/create → CreateRoomPage
/join → JoinRoomPage



Install if needed:

react-qr-code
html5-qrcode (for QR scanning)

Design must be:

Clean and intuitive
Large touch targets (mobile)
Clear visual hierarchy
Smooth animations
RTL support
Accessible (ARIA labels)


---

## 🎯 PROMPT 6: Firebase Setup & Room Service
Set up Firebase integration for real-time multiplayer:

File: src/services/firebase.ts
Initialize Firebase:

Import Firebase SDK (v9+ modular)
Get config from environment variables (VITE_FIREBASE_*)
Initialize app
Export instances:

db (Firestore)
rtdb (Realtime Database - for active game state)
auth (for future use)



Add connection status listener
Handle initialization errors
File: src/services/roomService.ts
Room management functions:

createRoom(hostId: string, hostName: string, settings: GameSettings): Promise<string>

Generate room code
Create room document in Firestore: /rooms/{roomCode}
Structure:
{
code: string,
hostId: string,
settings: GameSettings,
players: { [playerId]: Player },
teams: { red: Team, blue: Team, green: Team, yellow: Team },
gameState: 'lobby',
currentTurn: null,
usedCardIds: [],
createdAt: timestamp,
lastActivity: timestamp
}
Return room code


joinRoom(roomCode: string, player: Player): Promise<Room>

Check if room exists
Check if room is in 'lobby' state
Check if room not full (max 8 players)
Add player to room.players
Update lastActivity
Return room data


leaveRoom(roomCode: string, playerId: string): Promise<void>

Remove player from room.players
If player was in team, remove from team
If player was host and others remain, transfer host
If room empty, delete room (cleanup)


updateRoom(roomCode: string, updates: Partial<Room>): Promise<void>

Merge updates into room document
Update lastActivity
Validate updates (only host can change settings)


getRoomData(roomCode: string): Promise<Room | null>

Fetch room document
Return room data or null if not found


deleteRoom(roomCode: string): Promise<void>

Delete room document
Used for cleanup


cleanupOldRooms(): Promise<void>

Delete rooms older than 24 hours
Can be called periodically




File: src/hooks/useRoom.ts
Real-time room synchronization hook:
Parameters: roomCode
State:

room: Room | null
loading: boolean
error: Error | null

Effects:

Subscribe to Firestore real-time updates
Sync room changes to local state
Update Zustand store when room changes
Cleanup subscription on unmount

Functions:

updateRoomSettings(settings: Partial<GameSettings>)
assignTeam(playerId: string, team: TeamColor)
toggleReady(playerId: string)
startGame()

Returns: { room, loading, error, updateRoomSettings, assignTeam, toggleReady, startGame }
File: src/hooks/useMultiplayer.ts
Multiplayer coordination hook:

Manage online/offline status
Heartbeat system (update lastSeen every 30s)
Handle disconnections
Reconnection logic
Presence system (show who's online)

Uses Firebase Realtime Database for presence:
/presence/{roomCode}/{playerId} = { online: boolean, lastSeen: timestamp }
Environment Setup:
Ensure .env has placeholders:
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
Add .env.example with same structure

Error Handling:

Network errors
Permission errors
Invalid room codes
Race conditions
Show user-friendly messages

Security Rules (mention in comments):

Only host can start game
Only host can change settings
Players can only update their own data


---

## 🎯 PROMPT 7: Lobby Page with Team Assignment
Create the game lobby where players wait and prepare:

File: src/pages/LobbyPage.tsx
Layout sections:
a) Header:

Room code (large, formatted: XXX-XXX)
Copy room code button
Share button (opens share menu)
Settings icon (only visible to host)
Leave room button (top-right)

b) Players Waiting Area:

Title: "Players in Lobby" / "שחקנים בלובי"
Grid of player cards showing:

Player name
Team color badge (if assigned)
Ready status (✓ or ⏳)
Host badge (👑)
Online indicator (🟢)
Remove button (host only, can't remove self)



c) Team Assignment Area:

Four team sections (Red, Blue, Green, Yellow)
Each section:

Team color header
Drop zone for players
List of assigned players
Team stats (player count, ready count)


Drag-and-drop OR click to assign
Show balance warning if teams uneven

d) Game Settings Preview (collapsible):

Show current settings
Edit button (host only) → opens settings modal

e) Ready Check Section:

"Ready" / "Not Ready" toggle button for current player
Ready count: "3/4 players ready"
Start game button (host only):

Enabled when all ready + at least 2 teams
Shows requirements if disabled



f) Chat Area (optional):

Simple message list
Input to send message
Real-time updates


File: src/components/Lobby/PlayerCard.tsx
Props: player, isHost, canRemove, onRemove

Card with player info
Avatar (colored circle with initial)
Name (truncate if long)
Team badge (colored pill)
Ready status icon
Host crown icon
Online pulse animation
Remove button (X, only if canRemove)

Responsive and animated
File: src/components/Lobby/TeamSection.tsx
Props: team, players, onDrop (optional), onClick (optional)

Team color border and background tint
Team name header
Drop zone (if drag-drop enabled)
List of assigned players
Empty state: "Drag players here" or "No players yet"
Stats footer: "2 players, 1 ready"

Support both drag-drop and click-to-assign modes
File: src/components/Lobby/TeamAssignment.tsx
Manages team assignment logic:

Two modes: drag-drop OR button-based
Mode toggle (host preference)

Drag-Drop Mode:

Use react-beautiful-dnd or @dnd-kit
Players draggable from waiting area
Teams are drop targets
Smooth animations
Touch support (mobile)

Button Mode:

Click player → shows team selection popup
Select team → assigns player
Simpler for mobile


File: src/components/Lobby/ReadyCheck.tsx

Large toggle button for current player
Shows "Ready" or "Not Ready"
Color changes (green when ready)
Animation when toggled
Disable during game start countdown


File: src/components/Lobby/SettingsModal.tsx
Props: isOpen, onClose, settings, onSave, isHost

Modal overlay
Settings form (reuse SettingsPage components)
Save and Cancel buttons
Only host can save
Others view-only


File: src/components/Lobby/StartGameButton.tsx

Prominent button (large, colorful)
Shows requirements if can't start:

"Need at least 2 teams"
"All players must be ready"


Countdown animation when clicked (3, 2, 1)
Disabled if requirements not met
Only visible to host



Real-time Features:

All updates sync via Firebase
Smooth animations when players join/leave
Live ready status updates
Team assignment updates instantly
Settings changes reflect immediately

Design:

Modern card-based layout
Team colors prominent
Clear visual feedback
Mobile-friendly (stacked on small screens)
RTL support
Accessible (keyboard navigation)

Error Handling:

Handle player disconnections
Host transfer if host leaves
Room cleanup if empty
Network errors


---

## 🎯 PROMPT 8: Timer Component System
Create a professional, synchronized timer system:

File: src/components/Game/Timer.tsx
Props:

duration: number (in seconds)
onComplete: () => void
onWarning?: () => void (called at 10s)
autoStart?: boolean
syncKey?: string (for multiplayer sync)

Features:

Circular progress bar (SVG)
Time display in MM:SS format (center)
Color gradient based on time:



30s: green (#10B981)


10-30s: yellow (#F59E0B)
< 10s: red (#EF4444)


Pulse animation when < 10s
Sound effects:

Tick sound every second (optional)
Warning sound at 10s
Completion sound at 0s


Control buttons:

Start/Pause button
Reset button


Visual states:

Running: animated
Paused: dimmed
Completed: pulsing red



Design:

Large (200px diameter on desktop, 150px mobile)
Smooth 60fps animation
Responsive
Accessible (ARIA live region for screen readers)


File: src/hooks/useTimer.ts
Parameters: initialDuration, syncKey (optional)
State:

timeLeft: number
isRunning: boolean
isPaused: boolean
startTime: number | null

Functions:

start(): void

Begin countdown
Record start time
If syncKey, broadcast to Firebase


pause(): void

Pause countdown
Save elapsed time
Broadcast if multiplayer


resume(): void

Continue from paused time
Broadcast if multiplayer


reset(): void

Reset to initial duration
Stop countdown
Broadcast if multiplayer


sync(serverTime: number): void

Adjust local time to match server
Prevents drift in multiplayer



Effects:

Update timeLeft every 100ms for smooth animation
Call onWarning when reaches 10s
Call onComplete when reaches 0
Sync with Firebase if syncKey provided
Cleanup interval on unmount

Returns: { timeLeft, isRunning, isPaused, start, pause, resume, reset, progress }
progress = (timeLeft / initialDuration) * 100
File: src/services/soundService.ts
Use Howler.js for audio:

Preload sounds:

timer-tick.mp3
timer-warning.mp3
timer-end.mp3
correct-answer.mp3
wrong-answer.mp3
move-pawn.mp3


Functions:

init(): Promise<void> - preload all sounds
play(soundName: string): void
stop(soundName: string): void
setVolume(volume: number): void - 0 to 1
mute(): void
unmute(): void
isMuted(): boolean


Respect settings.soundEnabled
Handle errors if files missing
Support multiple simultaneous sounds


File: public/sounds/placeholder.mp3
Create silent placeholder MP3 files:

timer-tick.mp3 (0.1s silence)
timer-warning.mp3 (0.5s silence)
timer-end.mp3 (1s silence)
correct-answer.mp3 (0.5s silence)
wrong-answer.mp3 (0.5s silence)
move-pawn.mp3 (0.3s silence)

Note: Real sounds to be added later
File: src/components/Game/TimerControls.tsx
Props: isRunning, isPaused, onStart, onPause, onReset

Play/Pause button (▶️/⏸️)
Reset button (🔄)
Disabled states based on timer state
Tooltips on hover
Keyboard shortcuts:

Space: play/pause
R: reset


Icon animations


Multiplayer Timer Sync:
File: src/services/timerSync.ts

Use Firebase Realtime Database
Path: /games/{roomCode}/timer
Store:

startTime: server timestamp
duration: number
pausedAt: number | null
isPaused: boolean


All clients read server time
Calculate local timeLeft based on server
Prevents timer drift
Host controls timer (start/pause/reset)
Clients follow host's timer



Animations:

Use Framer Motion for smooth transitions
SVG circle animation for progress
Pulse effect when < 10s
Shake animation on completion

Performance:

Use requestAnimationFrame for smooth 60fps
Optimize re-renders (React.memo)
Cleanup intervals properly

Accessibility:

ARIA live region announces time
Screen reader friendly
Keyboard controls
High contrast mode support
## 🎯 PROMPT 9: Game Board - Spiral Design
Create the animated spiral game board:

File: src/components/Board/SpiralBoard.tsx
Requirements:

SVG-based spiral with 50 numbered spaces
Responsive (scales to container)
ViewBox
- ViewBox: 0 0 800 800 (maintains aspect ratio)
   - Spiral math:
     * Archimedean spiral formula
     * Start from center, spiral outward
     * Equal spacing between loops
     * Smooth curve
   
   Props:
   - teams: Record<TeamColor, Team>
   - currentPosition?: number (highlight this space)
   - onSpaceClick?: (position: number) => void
   
   Features:
   - 50 spaces arranged in spiral
   - Each space shows:
     * Space number (1-50)
     * Special space icon if applicable
     * Highlight when pawn is on it
   
   Special Spaces:
   - Bonus Circle: positions 8, 16, 24, 32, 40, 48 (⭐)
   - Lightning Round: positions 15, 30, 45 (⚡)
   - Switch Square: positions 10, 20, 35, 44 (🔄)
   - Steal Space: positions 12, 25, 38 (🎯)
   - Finish: position 50 (🏁)
   
   Visual Design:
   - Gradient background
   - Space circles with borders
   - Special spaces with colored backgrounds
   - Glow effect on current space
   - "MULIK" logo in center
   
   Animations:
   - Fade in on load
   - Pulse animation on special spaces
   - Highlight current turn team's color

2. File: src/components/Board/Pawn.tsx
   
   Props:
   - team: TeamColor
   - position: number
   - boardPositions: SpaceConfig[]
   - isCurrentTurn?: boolean
   
   Features:
   - Colored game piece (circle with team color)
   - Team emoji/icon in center
   - Smooth movement animation
   - Bounce on landing
   - Glow effect if current turn
   - Z-index stacking (current turn on top)
   
   Animations (Framer Motion):
   - animate to new position
   - spring transition (bouncy feel)
   - duration: 1 second
   - scale up during move
   - rotate slightly while moving
   
   Design:
   - 40px diameter
   - Team color background
   - White border
   - Drop shadow
   - Emoji: 🔴 (red), 🔵 (blue), 🟢 (green), 🟡 (yellow)

3. File: src/components/Board/SpecialSpace.tsx
   
   Props:
   - type: 'bonus' | 'lightning' | 'switch' | 'steal'
   - position: number
   - active: boolean
   
   Visual per type:
   - Bonus: Gold background, ⭐ icon
   - Lightning: Electric blue, ⚡ icon, animated spark
   - Switch: Purple, 🔄 icon, rotating animation
   - Steal: Red, 🎯 icon, pulse animation
   
   Tooltip on hover:
   - Explain what space does
   - Show in current language
   
   Active state:
   - Glow animation
   - Scale up
   - More intense color

4. File: src/utils/spiralMath.ts
   
   Calculate spiral positions:
   
   - calculateSpiralPositions(numSpaces: number, centerX: number, centerY: number, maxRadius: number): SpaceConfig[]
     
     Returns array of:
     {
       position: number,
       x: number,
       y: number,
       type: 'normal' | 'bonus' | 'lightning' | 'switch' | 'steal'
     }
     
     Algorithm:
     - Start at center (position 0)
     - Use Archimedean spiral: r = a + b * θ
     - Distribute 50 spaces evenly
     - Calculate x = r * cos(θ), y = r * sin(θ)
     - Assign special types based on position rules
   
   - getSpaceType(position: number): string
     Determines if space is special based on position

5. File: src/components/Board/BoardSpace.tsx
   
   Individual space component:
   
   Props: position, type, isOccupied, teams, onClick
   
   - Circle SVG element
   - Space number text
   - Special icon if applicable
   - Visual feedback on hover
   - Click handler (optional)
   
   States:
   - Default
   - Hover (scale up slightly)
   - Occupied (show team colors as small dots)
   - Current (highlighted border)

6. File: src/components/Board/BoardOverlay.tsx
   
   Info overlays on board:
   
   - Center logo: "MULIK" text with gradient
   - Turn indicator: Arrow pointing to current team
   - Space counter: "Space 15/50"
   - Distance to win: "35 spaces to go!"
   
   Positioned absolutely over board
   Non-interactive (pointer-events: none)

7. File: src/hooks/useBoardAnimation.ts
   
   Manage board animations:
   
   - animateMove(team: TeamColor, fromPos: number, toPos: number): Promise<void>
   - highlightSpace(position: number): void
   - showSpecialEffect(type: string): void
   - celebrateWin(team: TeamColor): void
   
   Returns animation controls

Layout Integration:
- Board container with aspect ratio
- Max width: 600px on desktop
- Full width on mobile
- Centered on screen
- Padding around edges

Responsive Behavior:
- Scale down on mobile
- Maintain aspect ratio
- Touch-friendly (larger hit areas)
- Readable text at all sizes

Performance:
- Use React.memo for spaces
- Optimize SVG (no unnecessary elements)
- Hardware-accelerated animations
- Limit re-renders

Accessibility:
- ARIA labels for spaces
- Keyboard navigation
- Screen reader announces moves
- High contrast support
##🎯 PROMPT 10: Main Game Page
Create the main gameplay interface:

1. File: src/pages/GamePage.tsx
   
   Layout (mobile-first):
   
   a) Header Bar:
      - Room code (small, top-left)
      - Settings icon (host only)
      - Volume toggle
      - Exit game button (confirmation modal)
   
   b) Score Section:
      - Team cards side by side
      - Each showing:
        * Team color
        * Team name
        * Current position (X/50)
        * Score (cards won)
        * Players in team
        * Turn indicator (glowing border if active)
   
   c) Game Board Area:
      - SpiralBoard component
      - Pawns positioned on board
      - Centered, max-width
   
   d) Current Card Display:
      - Large card in center (below board on mobile)
      - Category badge
      - Clue number indicator (1-6)
      - The clue word/phrase (large text)
      - Flip animation when card changes
   
   e) Timer Section:
      - Timer component (prominent)
      - Time remaining
      - Progress bar
   
   f) Action Buttons:
      - "Got It!" button (green, large)
      - "Pass" button (yellow, medium)
      - "Skip" button (red, small)
      - "End Turn" button (only for manual mode)
      
      Button states:
      - Enabled only for current speaker's team
      - Disabled for other teams
      - Show whose turn in label
   
   g) Turn Summary (appears at turn end):
      - Cards won this turn
      - Cards passed
      - Movement calculation
      - "Next Turn" button
   
   Desktop Layout:
   - Two column: Board left, Controls right
   - Score at top
   - Better use of space

2. File: src/components/Game/GameCard.tsx
   
   Props: card, clueNumber, language, isRevealed
   
   Features:
   - Card-flip animation (3D)
   - Front: MULIK logo
   - Back: Clue display
   - Category badge (top)
   - Clue number (1-6) indicator
   - Large, readable text
   - Gradient background
   - Shadow and depth
   
   Animations:
   - Flip when revealed
   - Slide in new card
   - Shake on skip
   - Glow on correct

3. File: src/components/Game/ActionButtons.tsx
   
   Props: onCorrect, onPass, onSkip, onEndTurn, disabled, turnMode
   
   Buttons:
   - "Got It!" 
     * Green (#10B981)
     * Confetti animation on click
     * Sound: correct-answer.mp3
     * Records card as won
   
   - "Pass"
     * Yellow (#F59E0B)
     * Neutral animation
     * Records card as passed
     * Goes to next card
   
   - "Skip"
     * Red (#EF4444)
     * Penalty warning
     * Records as penalty
     * Deducts from movement
   
   - "End Turn" (manual mode only)
     * Blue
     * Shows turn summary
     * Calculates final movement
   
   All buttons:
   - Large touch targets (60px min height)
   - Clear icons
   - Disabled state styling
   - Loading state during action
   - Haptic feedback (mobile)

4. File: src/components/Game/TurnSummary.tsx
   
   Props: cardsWon, cardsPassed, penalties, movement, team
   
   Modal that shows:
   - "Turn Complete!" header
   - Summary:
     * ✅ Cards Won: X
     * ⏭️ Cards Passed: X
     * ❌ Penalties: X
     * 📊 Total Movement: +X spaces
   - Visual: team pawn moving animation
   - "Next Turn" button
   - Celebration if big win (5+ cards)

5. File: src/components/Game/ScoreBoard.tsx
   
   Props: teams, currentTeam
   
   Display for each team:
   - Team color stripe
   - Team name
   - Position: "15/50"
   - Cards won: "7 cards"
   - Players (small avatars)
   - Progress bar to finish
   - Highlight if current turn
   
   Compact on mobile (stacked)
   Side-by-side on desktop

6. File: src/components/Game/GameHeader.tsx
   
   Top bar with:
   - Room code (click to copy)
   - Turn indicator: "Red Team's Turn"
   - Speaker name: "David is explaining"
   - Settings (host only)
   - Volume toggle
   - Menu (pause, exit, rules)

7. File: src/hooks/useGameFlow.ts
   
   Manage game turn flow:
   
   State:
   - currentCard: Card | null
   - cardsWonThisTurn: number
   - cardsPassedThisTurn: number
   - penalties: number
   - timeLeft: number
   
   Functions:
   - startTurn(team: TeamColor, speakerId: string)
     * Draw card
     * Start timer
     * Update game state
     * Sync to Firebase
   
   - markCorrect()
     * Increment cardsWonThisTurn
     * Draw next card
     * Play sound
     * Continue timer
   
   - markPassed()
     * Increment cardsPassedThisTurn
     * Draw next card
     * Continue timer
   
   - markSkipped()
     * Increment penalties
     * Draw next card
     * Show warning
   
   - endTurn()
     * Stop timer
     * Calculate movement
     * Show summary
     * Move pawn
     * Prepare next turn
   
   - nextTurn()
     * Rotate to next team
     * Select next speaker
     * Reset counters
     * Start new turn

8. Special Space Handlers:
   
   File: src/components/Game/SpecialSpaceModal.tsx
   
   Modals for each special space:
   
   - Bonus Circle:
     * "Bonus Round!"
     * 2 cards, same time limit
     * Success = 3 spaces forward
   
   - Lightning Round:
     * "Lightning Round!"
     * Both teams compete
     * Same card
     * First to guess wins 2 spaces
   
   - Switch Square:
     * "Team Switch!"
     * Trade one player with other team
     * Host chooses players
   
   - Steal Space:
     * "Steal Opportunity!"
     * Other team can guess too
     * First correct steals card

Game States:
- lobby: Waiting to start
- playing: Active gameplay
- paused: Game paused
- special: Special space active
- turnSummary: Between turns
- finished: Game over

Real-time Sync:
- All actions sync via Firebase
- All players see same state
- Timer synchronized
- Card reveals synchronized
- Movements synchronized

Error Handling:
- Network disconnection
- Timer desync (resync)
- Invalid actions
- Player leaving mid-turn

Animations:
- Card flip
- Button feedback
- Pawn movement
- Score updates
- Turn transitions

 ##🎯 PROMPT 11: Game Over & Victory Screen
 
Create the game completion experience:

1. File: src/pages/GameOverPage.tsx
   
   Layout:
   - Full screen celebration
   - Winning team color background (animated gradient)
   - Confetti animation (falling particles)
   - Trophy emoji 🏆
   
   Sections:
   
   a) Victory Header:
      - "GAME OVER!" in large text
      - Winner announcement: "[Team Name] Wins!" 
      - Team color highlight
      - Fireworks animation
   
   b) Final Scores Card:
      - All teams listed
      - Final positions
      - Total cards won
      - Ranked 1st, 2nd, 3rd, 4th
      - Medal emojis: 🥇 🥈 🥉
   
   c) Game Statistics:
      - Total rounds played
      - Total time elapsed
      - Fastest turn
      - Most cards in one turn
      - MVP player (most cards explained)
   
   d) Actions:
      - "Play Again" button (resets game, same room)
      - "New Game" button (new room, new players)
      - "Share Results" button (screenshot or text)
      - "Exit to Home" button

2. File: src/components/Game/VictoryAnimation.tsx
   
   Props: winningTeam, confetti
   
   - Confetti canvas (use react-confetti)
   - Team color confetti
   - Trophy animation (scale, rotate, glow)
   - Sound: victory fanfare
   - Celebration messages cycling
   - Duration: 5 seconds, then show scores

3. File: src/components/Game/FinalScoreCard.tsx
   
   Props: teams, winner
   
   - Sorted by final position
   - Each team card:
     * Rank badge
     * Team name and color
     * Position reached
     * Total cards
     * Players list
   - Winner highlighted with glow
   - Smooth entrance animation (stagger)

4. File: src/components/Game/GameStats.tsx
   
   Props: gameData
   
   Display interesting statistics:
   - Game duration: "23 minutes"
   - Total cards played: "47 cards"
   - Longest turn: "12 cards (Red Team)"
   - Shortest turn: "2 cards (Blue Team)"
   - Most improved: Team that gained most positions
   - Fun facts: "5 penalties!", "3 steals!"
   
   Design:
   - Grid layout
   - Icon for each stat
   - Animated numbers (count up)
   - Colorful and engaging

5. File: src/hooks/useGameStats.ts
   
   Calculate statistics:
   
   - Duration: createdAt to finishedAt
   - Track per turn: cards, time, speaker
   - Aggregate for game
   - Calculate MVPs
   - Return formatted stats object

6. File: src/components/Game/ShareResults.tsx
   
   Share game results:
   
   Methods:
   - Copy to clipboard (text format)
   - Share via native share API (mobile)
   - Download as image (html2canvas)
   
   Format:
   🎮 MULIK Game Results
🏆 Winner: Red Team
Final Standings:
🥇 Red Team - 50 spaces
🥈 Blue Team - 42 spaces
Game Stats:
⏱️ Duration: 23 min
🎴 Cards Played: 47

7. File: src/services/gameHistory.ts
   
   Save game history:
   
   - saveGameResult(roomCode, gameData): Promise<void>
     * Save to Firestore: /gameHistory/{gameId}
     * Store: winner, scores, players, date, duration
   
   - getUserGameHistory(userId): Promise<Game[]>
     * Retrieve user's past games
     * For future stats/leaderboard
   
   Optional for now, prepare for future

Animations:
- Confetti falling
- Trophy bouncing
- Teams sliding in
- Numbers counting up
- Sparkle effects
- Smooth transitions

Sound Effects:
- Victory fanfare (long)
- Clapping/cheers
- Celebratory music (optional)

Mobile Responsive:
- Stack vertically on mobile
- Smaller confetti particles
- Touch-friendly buttons
- Readable text sizes

Accessibility:
- Announce winner to screen readers
- Keyboard navigation
- High contrast mode
- Reduced motion option (disable confetti)

##🎯 PROMPT 12: Final Integration & Polish

Connect all components and add final touches:

1. Update src/App.tsx with all routes:
```typescript
   <Routes>
     <Route path="/" element={<HomePage />} />
     <Route path="/settings" element={<SettingsPage />} />
     <Route path="/create" element={<CreateRoomPage />} />
     <Route path="/join" element={<JoinRoomPage />} />
     <Route path="/lobby/:roomCode" element={<LobbyPage />} />
     <Route path="/game/:roomCode" element={<GamePage />} />
     <Route path="/game-over/:roomCode" element={<GameOverPage />} />
     <Route path="*" element={<Navigate to="/" />} />
   </Routes>
   Add route guards:

Redirect to home if room doesn't exist
Redirect to lobby if game not started
Redirect to game if already in progress


File: src/components/UI/LoadingScreen.tsx
Full screen loading:

MULIK logo
Spinning animation
"Loading..." text
Progress bar (if applicable)
Use while connecting to Firebase
Use while loading game state


File: src/components/UI/ErrorBoundary.tsx
React Error Boundary:

Catch JavaScript errors
Show friendly error message
"Something went wrong" page
"Reload" button
"Go Home" button
Log errors (console for now)


File: src/components/UI/Modal.tsx
Reusable modal component:
Props: isOpen, onClose, title, children, size
Features:

Overlay backdrop
Centered content
Close on overlay click
Close on ESC key
Smooth fade in/out
Portal rendering (outside root)
Trap focus inside modal
Scroll lock on body

Sizes: small, medium, large, full
File: src/components/UI/Tooltip.tsx
Hover tooltips:
Props: content, children, position

Show on hover
Delay: 500ms
Positions: top, bottom, left, right
Auto position if near edge
Smooth fade
Accessible (ARIA)


File: src/hooks/useKeyboardShortcuts.ts
Global keyboard shortcuts:

ESC: Close modal/go back
SPACE: Play/pause timer (in game)
R: Ready toggle (in lobby)
Enter: Confirm actions
?: Show help/rules

Disable when typing in inputs
File: src/components/UI/HelpModal.tsx
Game rules and help:

Tabbed interface:

How to Play
Special Spaces
Scoring
Tips & Tricks


Illustrations/diagrams
Examples
Quick reference
Accessible from any screen


Add loading states everywhere:

Buttons: show spinner when loading
Pages: skeleton screens
Lists: loading placeholders
Images: lazy loading
Async operations: visual feedback


Add error handling everywhere:

Network errors: retry button
Invalid input: field errors
Permission denied: helpful message
Room full: suggest creating new
Generic errors: friendly message


Performance Optimizations:

React.memo on expensive components
useMemo for calculations
useCallback for event handlers
Lazy load pages (React.lazy)
Code splitting by route
Optimize images
Minimize re-renders


File: src/utils/analytics.ts
Basic analytics (optional):

Track: game started, game completed
Track: room created, player joined
Track: errors
Use Firebase Analytics
Privacy-friendly


File: .env.example
Document all environment variables:

    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
    VITE_FIREBASE_APP_ID=1:123456789:web:abc123
    
    # App Configuration
    VITE_APP_NAME=MULIK
    VITE_APP_URL=https://mulik.app
Testing Checklist:

 All routes work
 Language switching works
 Theme switching works
 Settings persist
 Room creation works
 Room joining works
 Multiplayer sync works
 Timer works
 Game flow works
 Scoring works
 Special spaces work
 Game over works
 Mobile responsive
 RTL works
 Sounds play
 Animations smooth
 No console errors
 Works offline (gracefully)
 ---

## 📱 PWA BONUS PROMPT (Optional)
Convert MULIK to a Progressive Web App:

File: public/manifest.json
{
     "name": "MULIK - The Fast-Talk Challenge",
     "short_name": "MULIK",
     "description": "Real-time multiplayer word game",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#8B5CF6",
     "theme_color": "#8B5CF6",
     "orientation": "portrait",
     "icons": [
       {
         "src": "/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   File: public/sw.js (Service Worker)
Basic caching strategy:

Cache static assets
Cache API responses
Offline fallback
Background sync


Update index.html:
Add to <head>:

html   <link rel="manifest" href="/manifest.json">
   <meta name="theme-color" content="#8B5CF6">
   <link rel="apple-touch-icon" href="/icon-192.png">

File: src/utils/pwa.ts

Register service worker
Check if installable
Show install prompt
Handle updates



Makes app installable on mobile devices!

---

## 🎨 THEME CUSTOMIZATION PROMPT
Enhance theme system with full customization:

File: src/styles/themes/modern.css
Modern theme variables:

css   .theme-modern {
     --primary: #8B5CF6;
     --secondary: #EC4899;
     --background: #FFFFFF;
     --surface: #F9FAFB;
     --text: #1F2937;
     --text-secondary: #6B7280;
     --border: #E5E7EB;
     --success: #10B981;
     --warning: #F59E0B;
     --error: #EF4444;
     --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
   }

File: src/styles/themes/cartoon.css
Cartoon theme variables:

css   .theme-cartoon {
     --primary: #FF6B6B;
     --secondary: #4ECDC4;
     --background: #FFE66D;
     --surface: #FFFFFF;
     --text: #2C3E50;
     --text-secondary: #5A6C7D;
     --border: #2C3E50;
     --success: #51CF66;
     --warning: #FFD43B;
     --error: #FF6B6B;
     --shadow: 5px 5px 0 rgba(0, 0, 0, 0.2);
     
     /* Cartoon specific */
     font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive;
     border-radius: 20px !important;
   }

Apply CSS variables throughout app
Replace hard-coded colors with var(--primary), etc.
Add more themes:

Dark mode
High contrast
Colorblind friendly




---

## END OF PROMPTS
