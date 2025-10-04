# 🎮 MULIK Game

<div align="center">

**A fast-paced multiplayer card guessing game with Hebrew/English support**

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange.svg)](https://firebase.google.com/)

</div>

## ✨ Features

### 🎯 **Core Gameplay**
- **Real-time Multiplayer** - Up to 12 players across 4 teams
- **Dual Language Support** - Full Hebrew/English with RTL support
- **Card System** - 1000+ cards with progressive clue revelation
- **Spiral Game Board** - Animated board with special spaces
- **Timer System** - Synchronized countdown with sound effects

### 🎨 **User Experience**
- **Modern UI** - Beautiful animations with Framer Motion
- **Responsive Design** - Mobile-first approach
- **Dark/Light Themes** - Multiple visual themes
- **Sound Effects** - Immersive audio feedback
- **Accessibility** - Full ARIA support and keyboard navigation

### 🌐 **Multiplayer Features**
- **Room System** - Create/join rooms with QR codes
- **Team Assignment** - Drag-and-drop team management
- **Real-time Sync** - All players see synchronized state
- **Presence System** - Online/offline player status
- **Turn Management** - Automatic or manual turn progression

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/esamuel/Mulik.git
cd Mulik

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup (Optional - for multiplayer)
1. Create a Firebase project
2. Copy `.env.example` to `.env`
3. Add your Firebase configuration
4. See `FIREBASE_SETUP.md` for detailed instructions

## 🎮 How to Play

1. **Create a Room** - Host creates a game room
2. **Join Players** - Others join via room code or QR code
3. **Form Teams** - Assign players to colored teams
4. **Start Game** - Begin when all players are ready
5. **Guess Cards** - Teams take turns guessing cards from clues
6. **Move Forward** - Correct guesses advance your team
7. **Win the Game** - First team to reach the end wins!

## 🛠 Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

### **State Management**
- **Zustand** - Lightweight state management
- **React Query** - Server state management

### **Animations & UI**
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **i18next** - Internationalization

### **Backend & Real-time**
- **Firebase Firestore** - Real-time database
- **Firebase Auth** - User authentication
- **Firebase Hosting** - Static site hosting

### **Audio & Media**
- **Howler.js** - Audio management
- **QR Code Generator** - Room sharing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Game/           # Game-specific components
│   ├── Lobby/          # Lobby and team management
│   ├── Board/          # Game board components
│   ├── UI/             # Generic UI components
│   └── Debug/          # Development/testing components
├── pages/              # Main application pages
├── hooks/              # Custom React hooks
├── services/           # External service integrations
├── stores/             # State management
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── locales/            # Translation files
└── data/               # Static game data
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Debug Routes

- `/test` - Game store testing
- `/cards` - Card system testing  
- `/timer` - Timer component testing
- `/board` - Game board testing
- `/gametest` - Complete game page testing

### Quick Commit

Use the provided script for easy commits:

```bash
./commit.sh "✨ Add new feature"
```

## 🌍 Internationalization

The game supports both English and Hebrew with:
- **RTL Layout** - Proper right-to-left text flow
- **Localized Content** - All UI text translated
- **Cultural Adaptation** - Appropriate fonts and styling
- **Dynamic Switching** - Change language anytime

## 🎯 Game Components

### **Core Components**
- `GamePage` - Main gameplay interface
- `GameCard` - Card display with flip animations
- `ActionButtons` - Player action controls
- `Timer` - Synchronized countdown timer
- `ScoreBoard` - Team scoring display

### **Board System**
- `SpiralBoard` - Animated spiral game board
- `BoardSpace` - Individual board positions
- `Pawn` - Team game pieces
- `SpecialSpace` - Special board effects

### **Multiplayer**
- `LobbyPage` - Pre-game player management
- `TeamAssignment` - Drag-and-drop team setup
- `PlayerCard` - Individual player display
- `ReadyCheck` - Game start coordination

## 🔧 Configuration

### Game Settings
- Turn duration (30-120 seconds)
- Team count (2-4 teams)
- Player limits (2-12 players)
- Difficulty levels
- Language preferences

### Firebase Configuration
See `FIREBASE_SETUP.md` for complete setup instructions.

## 📱 Mobile Support

MULIK is fully responsive and optimized for:
- **iOS Safari** - Full touch support
- **Android Chrome** - Gesture navigation
- **Mobile Browsers** - Responsive layouts
- **Tablet Devices** - Optimized for larger screens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Firebase** - For real-time infrastructure
- **Framer Motion** - For beautiful animations
- **Tailwind CSS** - For rapid styling
- **Community** - For inspiration and feedback

---

<div align="center">

**Made with ❤️ for the MULIK community**

[🌟 Star this repo](https://github.com/esamuel/Mulik) • [🐛 Report Bug](https://github.com/esamuel/Mulik/issues) • [✨ Request Feature](https://github.com/esamuel/Mulik/issues)

</div>
