import React from 'react';

type ThemeKey = 'modern' | 'cartoon' | 'dark' | 'high-contrast' | 'colorblind';
interface ThemeToggleProps {
  value: ThemeKey;
  onChange: (theme: ThemeKey) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onChange }) => {
  const applyTheme = (theme: ThemeKey) => {
    document.body.classList.remove(
      'theme-modern',
      'theme-cartoon',
      'theme-dark',
      'theme-high-contrast',
      'theme-colorblind'
    );
    document.body.classList.add(`theme-${theme}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {([
          ['modern', '✨ Modern'],
          ['cartoon', '🎨 Cartoon'],
          ['dark', '🌙 Dark'],
          ['high-contrast', '⚡ High Contrast'],
          ['colorblind', '🧿 Colorblind'],
        ] as [ThemeKey, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => { applyTheme(k); onChange(k); }}
            className={`py-2 px-3 rounded-lg font-medium border ${
              value === k ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)] hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;
