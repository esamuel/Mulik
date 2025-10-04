import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled?: boolean;
  className?: string;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onReset,
  disabled = false,
  className = '',
}) => {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled) return;

      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          if (isRunning) {
            onPause();
          } else {
            onStart();
          }
          break;
        case 'KeyR':
          event.preventDefault();
          onReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, onStart, onPause, onReset, disabled]);

  const handlePlayPause = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-4 ${className}`}>
      {/* Play/Pause Button */}
      <motion.button
        onClick={handlePlayPause}
        disabled={disabled}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          text-white text-2xl shadow-lg transition-all duration-200
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isRunning 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : 'bg-green-500 hover:bg-green-600'
          }
        `}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        title={`${isRunning ? 'Pause' : 'Start'} (Space)`}
        aria-label={`${isRunning ? 'Pause' : 'Start'} timer`}
      >
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isRunning ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          {isRunning ? '⏸️' : '▶️'}
        </motion.div>

        {/* Pulse effect when running */}
        {isRunning && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>

      {/* Reset Button */}
      <motion.button
        onClick={onReset}
        disabled={disabled}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          text-white text-2xl shadow-lg transition-all duration-200
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gray-600 hover:bg-gray-700'
          }
        `}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        title="Reset (R)"
        aria-label="Reset timer"
      >
        <motion.div
          whileHover={!disabled ? { rotate: 180 } : {}}
          transition={{ duration: 0.3 }}
        >
          🔄
        </motion.div>
      </motion.button>

      {/* Status Indicator */}
      <div className="flex flex-col items-center text-sm text-gray-600">
        <div className="font-medium">
          {disabled ? 'Disabled' :
           isRunning ? 'Running' :
           isPaused ? 'Paused' : 'Ready'}
        </div>
        
        {!disabled && (
          <div className="text-xs text-gray-400 mt-1">
            Space: {isRunning ? 'Pause' : 'Start'} • R: Reset
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerControls;
