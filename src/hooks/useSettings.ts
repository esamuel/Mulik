import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types/game.types';

const DEFAULT_SETTINGS: Settings = {
  language: 'he',
  theme: 'modern',
  timerDuration: 60,
  turnMode: 'auto',
  soundEnabled: true,
};

const STORAGE_KEY = 'mulik-settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Update specific setting
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      return false;
    }
  }, [settings]);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, []);

  return {
    settings,
    updateSettings,
    saveSettings,
    resetSettings,
  };
};
