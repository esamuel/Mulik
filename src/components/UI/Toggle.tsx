import React from 'react';
import { motion } from 'framer-motion';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  leftLabel,
  rightLabel,
  leftIcon,
  rightIcon,
  size = 'medium',
  disabled = false,
}) => {
  const sizeClasses = {
    small: {
      container: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translateX: 20, // 5 * 4px (Tailwind's spacing unit)
    },
    medium: {
      container: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translateX: 24, // 6 * 4px
    },
    large: {
      container: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translateX: 28, // 7 * 4px
    },
  };

  const currentSize = sizeClasses[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Left Label/Icon */}
      {(leftLabel || leftIcon) && (
        <div className={`flex items-center gap-2 ${checked ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
          {leftIcon && <span className="text-lg">{leftIcon}</span>}
          {leftLabel && <span className="text-sm font-medium text-gray-700">{leftLabel}</span>}
        </div>
      )}

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex ${currentSize.container} rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mulik-primary-500 focus:ring-offset-2
          ${checked ? 'bg-mulik-primary-500' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.span
          className={`
            ${currentSize.thumb} inline-block rounded-full bg-white shadow-lg ring-0
          `}
          animate={{
            x: checked ? currentSize.translateX : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>

      {/* Right Label/Icon */}
      {(rightLabel || rightIcon) && (
        <div className={`flex items-center gap-2 ${checked ? 'opacity-100' : 'opacity-50'} transition-opacity duration-200`}>
          {rightIcon && <span className="text-lg">{rightIcon}</span>}
          {rightLabel && <span className="text-sm font-medium text-gray-700">{rightLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default Toggle;
