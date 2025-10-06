import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTimer } from '../../hooks/useTimer';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  onWarning?: () => void;
  autoStart?: boolean;
  syncKey?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  styleVariant?: 'ring' | 'sandglass';
}

const Timer: React.FC<TimerProps> = ({
  duration,
  onComplete,
  onWarning,
  autoStart = false,
  syncKey,
  className = '',
  size = 'large',
  styleVariant = 'ring',
}) => {
  const {
    timeLeft,
    isRunning,
    isPaused,
    progress,
    start,
    pause,
    resume,
    reset,
  } = useTimer({
    initialDuration: duration,
    syncKey,
    onComplete,
    onWarning,
    autoStart,
  });

  // Size configurations
  const sizeConfig = {
    small: { diameter: 100, strokeWidth: 8, fontSize: 'text-lg' },
    medium: { diameter: 150, strokeWidth: 10, fontSize: 'text-2xl' },
    large: { diameter: 200, strokeWidth: 12, fontSize: 'text-3xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color based on time remaining
  const getTimerColor = useMemo(() => {
    if (timeLeft > 30) return '#10B981'; // green
    if (timeLeft > 10) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  }, [timeLeft]);

  // Calculate stroke dash offset for progress
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Animation variants
  const timerVariants = {
    running: {
      scale: 1,
      opacity: 1,
    },
    paused: {
      scale: 0.95,
      opacity: 0.7,
    },
    warning: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
    completed: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: 'reverse' as const,
      },
    },
  };

  const getAnimationState = () => {
    if (timeLeft <= 0) return 'completed';
    if (timeLeft <= 10 && isRunning) return 'warning';
    if (isPaused) return 'paused';
    return 'running';
  };

  const handleToggle = () => {
    if (isRunning) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Timer Visualization */}
      {styleVariant === 'ring' ? (
        <motion.div
          className="relative"
          variants={timerVariants}
          animate={getAnimationState()}
          style={{ width: config.diameter, height: config.diameter }}
        >
          {/* SVG Timer */}
          <svg
            width={config.diameter}
            height={config.diameter}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={config.diameter / 2}
              cy={config.diameter / 2}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={config.strokeWidth}
              fill="transparent"
            />
            
            {/* Progress circle */}
            <motion.circle
              cx={config.diameter / 2}
              cy={config.diameter / 2}
              r={radius}
              stroke={getTimerColor}
              strokeWidth={config.strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className={`font-bold font-mono ${config.fontSize}`}
              style={{ color: getTimerColor }}
              animate={{
                scale: timeLeft <= 10 && isRunning ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: timeLeft <= 10 && isRunning ? Infinity : 0,
              }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            
            {/* Status indicator */}
            <div className="text-xs text-gray-500 mt-1">
              {timeLeft <= 0 ? 'TIME UP!' : 
               isPaused ? 'PAUSED' : 
               isRunning ? 'RUNNING' : 'READY'}
            </div>
          </div>

          {/* Pulse overlay for warning */}
          {timeLeft <= 10 && timeLeft > 0 && isRunning && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-400"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.div>
      ) : (
        // Sandglass style
        <motion.div
          className="relative flex items-center justify-center"
          variants={timerVariants}
          animate={getAnimationState()}
          style={{ width: config.diameter, height: config.diameter }}
        >
          <div className="relative w-24 h-32">
            {/* Glass outline */}
            <div className="absolute inset-0 border-4 border-gray-300 rounded-t-xl rounded-b-xl" />
            {/* Neck */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-6 h-1 bg-gray-300" />
            {/* Sand top */}
            <motion.div
              className="absolute top-3 left-3 right-3 bg-yellow-300 rounded-t-md"
              style={{ height: `${Math.max(0, (timeLeft / duration) * 40)}%` }}
            />
            {/* Sand falling */}
            {isRunning && timeLeft > 0 && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 top-1/2 w-1 bg-yellow-400"
                initial={{ height: 0 }}
                animate={{ height: 12 }}
                transition={{ duration: 0.3, repeat: Infinity, repeatType: 'mirror' }}
              />
            )}
            {/* Sand bottom */}
            <motion.div
              className="absolute bottom-3 left-3 right-3 bg-yellow-400 rounded-b-md"
              style={{ height: `${Math.min(40, (1 - timeLeft / duration) * 40)}%` }}
            />
          </div>
          {/* Time text */}
          <div className="absolute -bottom-8 font-mono font-bold text-gray-700">
            {formatTime(timeLeft)}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <motion.button
          onClick={handleToggle}
          disabled={timeLeft <= 0}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            text-white font-bold text-lg shadow-lg
            transition-all duration-200
            ${timeLeft <= 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }
          `}
          whileHover={timeLeft > 0 ? { scale: 1.05 } : {}}
          whileTap={timeLeft > 0 ? { scale: 0.95 } : {}}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? '⏸️' : '▶️'}
        </motion.button>

        {/* Reset Button */}
        <motion.button
          onClick={reset}
          className="
            w-12 h-12 rounded-full flex items-center justify-center
            bg-gray-500 hover:bg-gray-600 text-white font-bold text-lg
            shadow-lg transition-all duration-200 active:scale-95
          "
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Reset timer"
        >
          🔄
        </motion.button>
      </div>

      {/* Screen reader announcements */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {timeLeft <= 0 ? 'Timer completed' :
         timeLeft <= 10 ? `Warning: ${Math.ceil(timeLeft)} seconds remaining` :
         `${Math.ceil(timeLeft)} seconds remaining`}
      </div>
    </div>
  );
};

export default Timer;
