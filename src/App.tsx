import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import GameOverPage from './pages/GameOverPage';
import GameStoreTest from './components/Debug/GameStoreTest';
import CardSystemTest from './components/Debug/CardSystemTest';
import TimerTest from './components/Debug/TimerTest';
import BoardTest from './components/Debug/BoardTest';
import GamePageTest from './components/Debug/GamePageTest';
import GameOverTest from './components/Debug/GameOverTest';
import { ToastProvider } from './components/UI/Toast';
import ErrorBoundary from './components/UI/ErrorBoundary';
import type { Language } from './types/game.types';
import './i18n';

function App() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    // Set initial language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('mulik-language') as Language;
    const browserLanguage = navigator.language.startsWith('he') ? 'he' : 'en';
    const initialLanguage = savedLanguage || browserLanguage;
    
    setCurrentLanguage(initialLanguage);
    i18n.changeLanguage(initialLanguage);
  }, [i18n]);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem('mulik-language', language);
    
    // Update document direction for RTL support
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  return (
    <ErrorBoundary>
      <ToastProvider position="top-center">
        <Router>
          <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={<SettingsPage />} 
            />
            <Route 
              path="/create" 
              element={<CreateRoomPage />} 
            />
            <Route 
              path="/join" 
              element={<JoinRoomPage />} 
            />
            <Route 
              path="/lobby/:roomCode" 
              element={<LobbyPage />} 
            />
            <Route 
              path="/game/:roomCode" 
              element={<GamePage />} 
            />
            <Route 
              path="/game-over/:roomCode" 
              element={<GameOverPage />} 
            />
            <Route 
              path="/test" 
              element={<GameStoreTest />} 
            />
            <Route 
              path="/cards" 
              element={<CardSystemTest />} 
            />
            <Route 
              path="/timer" 
              element={<TimerTest />} 
            />
            <Route 
              path="/board" 
              element={<BoardTest />} 
            />
            <Route 
              path="/gametest" 
              element={<GamePageTest />} 
            />
            <Route 
              path="/gameovertest" 
              element={<GameOverTest />} 
            />
            {/* Catch all route - redirect to home */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
