import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ReadyCheckProps {
  isReady: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const ReadyCheck: React.FC<ReadyCheckProps> = ({
  isReady,
  onToggle,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async () => {
    if (disabled || loading || isAnimating) return;

    setIsAnimating(true);
    
    try {
      await onToggle();
    } catch (error) {
      console.error('Failed to toggle ready status:', error);
    } finally {
      // Add a small delay to show the animation
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  const buttonVariants = {
    ready: {
      backgroundColor: '#10b981', // green-500
      scale: 1,
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    },
    notReady: {
      backgroundColor: '#6b7280', // gray-500
      scale: 1,
      boxShadow: '0 4px 15px rgba(107, 114, 128, 0.2)',
    },
    hover: {
      scale: 1.05,
      boxShadow: isReady 
        ? '0 15px 30px rgba(16, 185, 129, 0.4)'
        : '0 8px 20px rgba(107, 114, 128, 0.3)',
    },
    tap: {
      scale: 0.95,
    },
    disabled: {
      backgroundColor: '#d1d5db', // gray-300
      scale: 1,
      boxShadow: 'none',
    },
  };

  const iconVariants = {
    ready: {
      rotate: 0,
      scale: 1,
    },
    notReady: {
      rotate: 0,
      scale: 1,
    },
    loading: {
      rotate: 360,
      scale: 1,
    },
    toggle: {
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
    },
  };

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      {/* Ready Status Text */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {t('lobby.readyStatus')}
        </h3>
        <p className="text-sm text-gray-600">
          {isReady 
            ? t('lobby.youAreReady') 
            : t('lobby.clickWhenReady')
          }
        </p>
      </div>

      {/* Ready Toggle Button */}
      <motion.button
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`
          relative w-32 h-32 rounded-full text-white font-bold text-lg
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${isReady ? 'focus:ring-green-300' : 'focus:ring-gray-300'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          transition-all duration-200
        `}
        variants={buttonVariants}
        initial={disabled ? 'disabled' : (isReady ? 'ready' : 'notReady')}
        animate={
          disabled ? 'disabled' : 
          loading || isAnimating ? 'loading' :
          isReady ? 'ready' : 'notReady'
        }
        whileHover={!disabled && !loading ? 'hover' : undefined}
        whileTap={!disabled && !loading ? 'tap' : undefined}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Button Content */}
        <div className="flex flex-col items-center justify-center h-full">
          {/* Icon */}
          <motion.div
            className="text-3xl mb-1"
            variants={iconVariants}
            animate={
              loading || isAnimating ? 'loading' :
              isReady ? 'ready' : 'notReady'
            }
            transition={{
              duration: loading || isAnimating ? 1 : 0.3,
              repeat: loading || isAnimating ? Infinity : 0,
              ease: 'linear',
            }}
          >
            {loading || isAnimating ? '⏳' : isReady ? '✅' : '⏱️'}
          </motion.div>
          
          {/* Text */}
          <motion.span
            className="text-sm font-semibold"
            animate={{
              opacity: loading || isAnimating ? 0.7 : 1,
            }}
          >
            {loading || isAnimating 
              ? t('lobby.updating')
              : isReady 
                ? t('lobby.ready') 
                : t('lobby.notReady')
            }
          </motion.span>
        </div>

        {/* Pulse Effect for Ready State */}
        {isReady && !disabled && !loading && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-400"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Loading Spinner Overlay */}
        {(loading || isAnimating) && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Helper Text */}
      <div className="text-center max-w-xs">
        <p className="text-xs text-gray-500">
          {disabled 
            ? t('lobby.readyDisabled')
            : isReady 
              ? t('lobby.readyHelpReady')
              : t('lobby.readyHelpNotReady')
          }
        </p>
      </div>
    </div>
  );
};

export default ReadyCheck;
