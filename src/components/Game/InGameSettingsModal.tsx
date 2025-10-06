import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';
import { useGameStore } from '../../stores/gameStore';
import { soundService } from '../../services/soundService';

interface InGameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InGameSettingsModal: React.FC<InGameSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const { currentTurn } = useGameStore();
  const lockDuringTurn = !!currentTurn; // disable some controls while a turn is active

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6"
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {t('settings.title', 'Settings')}
              </h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">✖️</button>
            </div>

            {/* Theme */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.theme', 'Theme')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'modern' })}
                  className={`py-2 rounded-lg font-medium ${settings.theme === 'modern' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.modern', 'Modern')}
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'cartoon' })}
                  className={`py-2 rounded-lg font-medium ${settings.theme === 'cartoon' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.cartoon', 'Cartoon')}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.language', 'Language')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { i18n.changeLanguage('he'); updateSettings({ language: 'he' as any }); }}
                  className={`py-2 rounded-lg font-medium ${i18n.language === 'he' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  עברית
                </button>
                <button
                  onClick={() => { i18n.changeLanguage('en'); updateSettings({ language: 'en' as any }); }}
                  className={`py-2 rounded-lg font-medium ${i18n.language === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Timer Duration */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.turnDuration', 'Turn duration')}</div>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => !lockDuringTurn && updateSettings({ timerDuration: sec as any })}
                    disabled={lockDuringTurn}
                    className={`py-2 rounded-lg font-medium ${settings.timerDuration === sec ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${lockDuringTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Style */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.timerStyle', 'Timer style')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ timerStyle: 'ring' as any })}
                  className={`py-2 rounded-lg font-medium ${settings.timerStyle !== 'sandglass' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.ring', 'Time Ring')}
                </button>
                <button
                  onClick={() => updateSettings({ timerStyle: 'sandglass' as any })}
                  className={`py-2 rounded-lg font-medium ${settings.timerStyle === 'sandglass' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.sandglass', 'Sand Watch')}
                </button>
              </div>
            </div>

            {/* Target Score */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.targetScore', 'Target score')}</div>
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 150].map((s) => (
                  <button
                    key={s}
                    onClick={() => !lockDuringTurn && updateSettings({ targetScore: s as any })}
                    disabled={lockDuringTurn}
                    className={`py-2 rounded-lg font-medium ${settings.targetScore === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${lockDuringTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Turn Mode */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.turnMode', 'Turn mode')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ turnMode: 'auto' as any })}
                  className={`py-2 rounded-lg font-medium ${settings.turnMode === 'auto' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.auto', 'Auto')}
                </button>
                <button
                  onClick={() => updateSettings({ turnMode: 'manual' as any })}
                  className={`py-2 rounded-lg font-medium ${settings.turnMode === 'manual' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.manual', 'Manual')}
                </button>
              </div>
            </div>

            {/* Card Difficulty */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.cardDifficulty', 'Words difficulty')}</div>
              <div className="grid grid-cols-3 gap-2">
                {(['easy','mixed','hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => !lockDuringTurn && updateSettings({ cardDifficulty: d as any })}
                    disabled={lockDuringTurn}
                    className={`py-2 rounded-lg font-medium ${settings.cardDifficulty === d ? (d==='easy'?'bg-green-600':d==='mixed'?'bg-purple-600':'bg-red-600') + ' text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${lockDuringTurn ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t(`settings.${d}`, d.charAt(0).toUpperCase()+d.slice(1))}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-700 mb-2">{t('settings.sound', 'Sound')}</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ soundEnabled: true })}
                  className={`py-2 rounded-lg font-medium ${settings.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.on', 'On')}
                </button>
                <button
                  onClick={() => updateSettings({ soundEnabled: false })}
                  className={`py-2 rounded-lg font-medium ${!settings.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('settings.off', 'Off')}
                </button>
              </div>
              {/* Volume */}
              <div className="mt-4">
                <div className="text-xs text-gray-600 mb-1">{t('settings.volume', 'Volume')}</div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.volume ?? 1}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    soundService.setVolume(v);
                    updateSettings({ volume: v });
                  }}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">
                {t('common.close', 'Close')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InGameSettingsModal;
