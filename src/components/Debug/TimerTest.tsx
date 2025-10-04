import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Timer from '../Game/Timer';
import TimerControls from '../Game/TimerControls';
import { useTimer } from '../../hooks/useTimer';
import { soundService } from '../../services/soundService';

const TimerTest: React.FC = () => {
  const [duration, setDuration] = useState(60);
  const [showControls, setShowControls] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(false);

  // Initialize sound service
  useEffect(() => {
    soundService.init().then(() => {
      console.log('Sound service initialized');
    });
  }, []);

  // Separate timer for controls demo
  const {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset,
  } = useTimer({
    initialDuration: duration,
    onComplete: () => {
      console.log('Timer completed!');
    },
    onWarning: () => {
      console.log('Timer warning at 10 seconds!');
    },
  });

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    reset();
  };

  const handleSoundToggle = () => {
    if (soundsEnabled) {
      soundService.mute();
    } else {
      soundService.unmute();
    }
    setSoundsEnabled(!soundsEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🕐 Timer Component System Test
          </h1>
          <p className="text-white/80 text-lg">
            Test the professional timer system with different configurations
          </p>
        </motion.div>

        {/* Controls Panel */}
        <motion.div
          className="bg-white rounded-lg p-6 mb-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Duration Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timer Duration
              </label>
              <select
                value={duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={10}>10 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={90}>1.5 minutes</option>
                <option value={120}>2 minutes</option>
                <option value={300}>5 minutes</option>
              </select>
            </div>

            {/* Sound Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sound Effects
              </label>
              <button
                onClick={handleSoundToggle}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  soundsEnabled
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {soundsEnabled ? '🔊 Enabled' : '🔇 Disabled'}
              </button>
            </div>

            {/* Controls Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show Controls
              </label>
              <button
                onClick={() => setShowControls(!showControls)}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  showControls
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {showControls ? '👁️ Visible' : '🙈 Hidden'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Timer Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Integrated Timer Component */}
          <motion.div
            className="bg-white rounded-lg p-8 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Integrated Timer Component
            </h3>
            
            <div className="flex justify-center">
              <Timer
                duration={duration}
                onComplete={() => alert('Timer completed!')}
                onWarning={() => console.log('Warning: 10 seconds left!')}
                size="large"
              />
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>• Built-in controls</p>
              <p>• Auto sound effects</p>
              <p>• Responsive design</p>
            </div>
          </motion.div>

          {/* Separate Timer + Controls */}
          <motion.div
            className="bg-white rounded-lg p-8 shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Custom Timer + Controls
            </h3>
            
            {/* Timer Display */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="200" height="200" className="transform -rotate-90">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke={timeLeft > 30 ? '#10B981' : timeLeft > 10 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="12"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={565.48}
                    strokeDashoffset={565.48 - ((timeLeft / duration) * 565.48)}
                    transition={{ duration: 0.1 }}
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold font-mono">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                    {Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {timeLeft <= 0 ? 'DONE' : 
                     isPaused ? 'PAUSED' : 
                     isRunning ? 'RUNNING' : 'READY'}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Controls */}
            {showControls && (
              <TimerControls
                isRunning={isRunning}
                isPaused={isPaused}
                onStart={start}
                onPause={pause}
                onReset={reset}
              />
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>• Separate components</p>
              <p>• Custom styling</p>
              <p>• Keyboard shortcuts</p>
            </div>
          </motion.div>
        </div>

        {/* Size Variations */}
        <motion.div
          className="bg-white rounded-lg p-8 shadow-xl mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            Size Variations
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-center">
              <Timer duration={30} onComplete={() => {}} size="small" />
              <p className="text-sm text-gray-600 mt-2">Small (100px)</p>
            </div>
            
            <div className="text-center">
              <Timer duration={60} onComplete={() => {}} size="medium" />
              <p className="text-sm text-gray-600 mt-2">Medium (150px)</p>
            </div>
            
            <div className="text-center">
              <Timer duration={90} onComplete={() => {}} size="large" />
              <p className="text-sm text-gray-600 mt-2">Large (200px)</p>
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          className="bg-white rounded-lg p-8 shadow-xl mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            ✨ Timer System Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Circular progress animation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Color-coded time warnings</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Sound effects (Howler.js)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Keyboard shortcuts</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Responsive design</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Accessibility support</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Multiplayer sync ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Smooth 60fps animation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span>Multiple size options</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TimerTest;
