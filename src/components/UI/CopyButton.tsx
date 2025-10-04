import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from './Toast';

interface CopyButtonProps {
  text: string;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
  errorMessage?: string;
  disabled?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  children,
  className = '',
  successMessage = 'Copied to clipboard!',
  errorMessage = 'Failed to copy',
  disabled = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy failed');
        }
      }

      setIsCopied(true);
      showToast(successMessage, 'success', 2000);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to copy text:', error);
      showToast(errorMessage, 'error', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCopy();
    }
  };

  const baseClasses = `
    inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-mulik-primary-500 focus:ring-offset-2
    ${disabled || isLoading 
      ? 'opacity-50 cursor-not-allowed' 
      : 'cursor-pointer hover:scale-105 active:scale-95'
    }
  `;

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${className}`}
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
      aria-label={`Copy ${text} to clipboard`}
      role="button"
      tabIndex={0}
    >
      {/* Icon */}
      <motion.span
        className="text-lg"
        animate={{
          scale: isCopied ? [1, 1.2, 1] : 1,
          rotate: isCopied ? [0, 10, -10, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⏳
          </motion.span>
        ) : isCopied ? (
          '✅'
        ) : (
          '📋'
        )}
      </motion.span>

      {/* Label */}
      <span>{children}</span>

      {/* Visual feedback for copied state */}
      {isCopied && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-green-600 font-semibold"
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
};

export default CopyButton;
