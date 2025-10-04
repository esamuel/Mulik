import React from 'react';
import { motion } from 'framer-motion';
import Toggle from '../UI/Toggle';

interface ThemeToggleProps {
  value: 'modern' | 'cartoon';
  onChange: (theme: 'modern' | 'cartoon') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange }) => {
  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'cartoon' : 'modern';
    
    // Apply theme classes to document body
    document.body.classList.remove('theme-modern', 'theme-cartoon');
    document.body.classList.add(`theme-${newTheme}`);
    
    onChange(newTheme);
  };

  return (
    <div className="space-y-4">
      <Toggle
        checked={value === 'cartoon'}
        onChange={handleThemeChange}
        leftIcon="✨"
        rightIcon="🎨"
        leftLabel="Modern"
        rightLabel="Cartoon"
        size="medium"
      />
      
      {/* Theme Preview */}
      <div className="flex gap-4 mt-4">
        {/* Modern Preview */}
        <motion.div
          className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
            value === 'modern' 
              ? 'border-mulik-primary-500 bg-mulik-primary-50' 
              : 'border-gray-200 bg-gray-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-xs font-medium text-gray-600 mb-2">Modern</div>
          <div className="space-y-1">
            <div className="h-2 bg-gradient-to-r from-mulik-primary-500 to-mulik-primary-600 rounded"></div>
            <div className="h-1 bg-gray-300 rounded w-3/4"></div>
            <div className="h-1 bg-gray-200 rounded w-1/2"></div>
          </div>
        </motion.div>

        {/* Cartoon Preview */}
        <motion.div
          className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
            value === 'cartoon' 
              ? 'border-mulik-primary-500 bg-mulik-primary-50' 
              : 'border-gray-200 bg-gray-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-xs font-medium text-gray-600 mb-2">Cartoon</div>
          <div className="space-y-1">
            <div className="h-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-full"></div>
            <div className="h-1 bg-blue-300 rounded-full w-3/4"></div>
            <div className="h-1 bg-green-300 rounded-full w-1/2"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemeToggle;
