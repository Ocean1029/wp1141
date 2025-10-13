// ThemeNav component - navigation sidebar for themes

import React from 'react';
import type { Theme } from '../types/theme';
import '../styles/ThemeNav.css';

interface ThemeNavProps {
  themes: Theme[];
  selectedThemeId: string | null;
  onThemeSelect: (themeId: string) => void;
  onShowAll: () => void;
}

const ThemeNav: React.FC<ThemeNavProps> = ({
  themes,
  selectedThemeId,
  onThemeSelect,
  onShowAll,
}) => {
  return (
    <nav className="theme-nav">
      <div className="theme-nav__header">
        <h3 className="theme-nav__title">Themes</h3>
      </div>

      <button
        className={`theme-nav__item ${!selectedThemeId ? 'theme-nav__item--active' : ''}`}
        onClick={onShowAll}
        type="button"
      >
        <span className="theme-nav__item-dot" style={{ backgroundColor: '#6b7280' }} />
        <span className="theme-nav__item-name">All Diaries</span>
      </button>

      <div className="theme-nav__divider" />

      <div className="theme-nav__list">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-nav__item ${
              selectedThemeId === theme.id ? 'theme-nav__item--active' : ''
            }`}
            onClick={() => onThemeSelect(theme.id)}
            type="button"
          >
            <span
              className="theme-nav__item-dot"
              style={{ backgroundColor: theme.color_hex || '#9ca3af' }}
            />
            <span className="theme-nav__item-name">{theme.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ThemeNav;

