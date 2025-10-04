import React from 'react';
import { useTranslation } from 'react-i18next';
import Toggle from '../UI/Toggle';
import type { Language } from '../../types/game.types';

interface LanguageSwitchProps {
  value: Language;
  onChange: (language: Language) => void;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ value, onChange }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (checked: boolean) => {
    const newLanguage: Language = checked ? 'en' : 'he';
    
    // Update i18next language
    i18n.changeLanguage(newLanguage);
    
    // Update document direction and language
    document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
    
    // Call the onChange prop
    onChange(newLanguage);
  };

  return (
    <Toggle
      checked={value === 'en'}
      onChange={handleLanguageChange}
      leftIcon="🇮🇱"
      rightIcon="🇺🇸"
      leftLabel="עברית"
      rightLabel="English"
      size="medium"
    />
  );
};

export default LanguageSwitch;
