// ThemeSidebar component - displays themes list in sidebar
import React from 'react';
import type { Theme } from '../types/theme';
import '../styles/ThemeSidebar.css';

interface ThemeSidebarProps {
  themes: Theme[];
  selectedThemeId?: string | null;
  onThemeSelect: (theme: Theme) => void;
  onCreateTheme: () => void;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  searchQuery: string;
}

const ThemeSidebar: React.FC<ThemeSidebarProps> = ({
  themes,
  selectedThemeId,
  onThemeSelect,
  onCreateTheme,
  onSearchChange,
  isLoading = false,
  searchQuery,
}) => {
  const handleThemeClick = (theme: Theme) => {
    onThemeSelect(theme);
  };

  const handleCreateTheme = () => {
    onCreateTheme();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="theme-sidebar">
      {/* Search Bar */}
      <div className="theme-sidebar__search">
        <div className="theme-sidebar__search-container">
          <svg className="theme-sidebar__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M7 14A7 7 0 1 0 7 0a7 7 0 0 0 0 14zM13 13l-3-3" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="theme-sidebar__search-input"
          />
        </div>
      </div>

      {/* Create Theme Button */}
      <div className="theme-sidebar__actions">
        <button 
          className="theme-sidebar__create-btn"
          onClick={handleCreateTheme}
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M8 1v14M1 8h14" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
          Create Theme
        </button>
      </div>

      {/* Themes List */}
      <div className="theme-sidebar__content">
        {isLoading ? (
          <div className="theme-sidebar__loading">
            <div className="spinner"></div>
            <p>Loading themes...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="theme-sidebar__empty">
            <div className="theme-sidebar__empty-icon">
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
            <h3 className="theme-sidebar__empty-title">No themes yet</h3>
            <p className="theme-sidebar__empty-description">
              Create your first theme to start organizing your thoughts.
            </p>
          </div>
        ) : (
          <div className="theme-sidebar__themes">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-sidebar__theme-item ${
                  selectedThemeId === theme.id ? 'theme-sidebar__theme-item--active' : ''
                }`}
                onClick={() => handleThemeClick(theme)}
              >
                <div className="theme-sidebar__theme-content">
                  <div className="theme-sidebar__theme-header">
                    <div className="theme-sidebar__theme-color">
                      <div 
                        className="theme-sidebar__color-dot"
                        style={{ backgroundColor: theme.color_hex || '#6366f1' }}
                      />
                    </div>
                    <div className="theme-sidebar__theme-info">
                      <h4 className="theme-sidebar__theme-name">{theme.name}</h4>
                      <p className="theme-sidebar__theme-description">
                        {theme.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="theme-sidebar__theme-meta">
                    <span className="theme-sidebar__theme-date">
                      {formatDate(theme.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSidebar;
