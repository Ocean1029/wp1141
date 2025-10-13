// ThemeSelectionDialog component - shows themes list for segment creation
import React, { useState } from 'react';
import type { Theme } from '../types/theme';
import '../styles/ThemeSelectionDialog.css';

interface ThemeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: Theme) => void;
  onCreateTheme: () => void;
  themes: Theme[];
  selectedText: string;
}

const ThemeSelectionDialog: React.FC<ThemeSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  onCreateTheme,
  themes,
  selectedText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleThemeClick = (theme: Theme) => {
    onSelectTheme(theme);
    onClose();
  };

  const handleCreateTheme = () => {
    onCreateTheme();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="theme-selection-overlay" onClick={onClose}>
      <div className="theme-selection-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="theme-selection-dialog__header">
          <h3 className="theme-selection-dialog__title">Add to Theme</h3>
          <button 
            className="theme-selection-dialog__close"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path 
                d="M15 5L5 15M5 5l10 10" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="theme-selection-dialog__content">
          <div className="theme-selection-dialog__preview">
            <div className="theme-selection-dialog__preview-label">Selected text:</div>
            <div className="theme-selection-dialog__preview-text">
              "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
            </div>
          </div>

          <div className="theme-selection-dialog__search">
            <input
              type="text"
              placeholder="Search themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="theme-selection-dialog__search-input"
            />
          </div>

          <div className="theme-selection-dialog__themes">
            {filteredThemes.length === 0 ? (
              <div className="theme-selection-dialog__empty">
                <div className="theme-selection-dialog__empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M9.5 1L12 5.5L17 6L13.5 9.5L14.5 14.5L9.5 12L4.5 14.5L5.5 9.5L2 6L7 5.5L9.5 1Z" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="theme-selection-dialog__empty-text">
                  {searchQuery ? 'No themes match your search' : 'No themes available'}
                </p>
              </div>
            ) : (
              filteredThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="theme-selection-dialog__theme-item"
                  onClick={() => handleThemeClick(theme)}
                >
                  <div className="theme-selection-dialog__theme-header">
                    <div className="theme-selection-dialog__theme-color">
                      <div 
                        className="theme-selection-dialog__color-dot"
                        style={{ backgroundColor: theme.color_hex || '#6366f1' }}
                      />
                    </div>
                    <div className="theme-selection-dialog__theme-info">
                      <h4 className="theme-selection-dialog__theme-name">{theme.name}</h4>
                      <p className="theme-selection-dialog__theme-description">
                        {theme.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="theme-selection-dialog__theme-meta">
                    <span className="theme-selection-dialog__theme-date">
                      {formatDate(theme.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="theme-selection-dialog__actions">
            <button 
              className="theme-selection-dialog__create-btn"
              onClick={handleCreateTheme}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path 
                  d="M8 1v14M1 8h14" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
              Create New Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectionDialog;
