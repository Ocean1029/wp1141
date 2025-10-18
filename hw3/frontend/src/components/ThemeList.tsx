// ThemeList component - displays all themes in a grid layout
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Theme } from '../types/theme';
import '../styles/ThemeList.css';

interface ThemeListProps {
  themes: Theme[];
  onEditTheme?: (theme: Theme) => void;
  onDeleteTheme?: (theme: Theme) => void;
}

const ThemeList: React.FC<ThemeListProps> = ({
  themes,
  onEditTheme,
  onDeleteTheme,
}) => {
  const navigate = useNavigate();

  const handleThemeClick = (theme: Theme) => {
    navigate(`/theme/${theme.id}`);
  };

  const handleEditTheme = (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    onEditTheme?.(theme);
  };

  const handleDeleteTheme = (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation();
    onDeleteTheme?.(theme);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="theme-list">
      <div className="theme-list__header">
        <h1 className="theme-list__title">Themes</h1>
        <p className="theme-list__subtitle">
          Organize your thoughts by themes and topics
        </p>
      </div>

      {themes.length === 0 ? (
        <div className="theme-list__empty">
          <div className="theme-list__empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path 
                d="M9.5 1L12 5.5L17 6L13.5 9.5L14.5 14.5L9.5 12L4.5 14.5L5.5 9.5L2 6L7 5.5L9.5 1Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="theme-list__empty-title">No themes yet</h3>
          <p className="theme-list__empty-description">
            Create your first theme to start organizing your thoughts.
          </p>
          <button className="btn btn--primary">
            Create Theme
          </button>
        </div>
      ) : (
        <div className="theme-list__grid">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="theme-card"
              onClick={() => handleThemeClick(theme)}
            >
              <div className="theme-card__content">
                {/* Theme Header */}
                <div className="theme-card__header">
                  <div className="theme-card__title-section">
                    <div className="theme-card__title-with-color">
                      <div 
                        className="theme-card__color-dot"
                        style={{ backgroundColor: theme.color_hex || '#6366f1' }}
                      />
                      <h3 className="theme-card__title">{theme.name}</h3>
                    </div>
                  </div>
                  <div className="theme-card__actions">
                    {onEditTheme && (
                      <button
                        className="theme-card__action-btn"
                        onClick={(e) => handleEditTheme(e, theme)}
                        title="Edit theme"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path 
                            d="M11.5 1.5L14.5 4.5L5.5 13.5H2.5V10.5L11.5 1.5Z" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    {onDeleteTheme && (
                      <button
                        className="theme-card__action-btn theme-card__action-btn--danger"
                        onClick={(e) => handleDeleteTheme(e, theme)}
                        title="Delete theme"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path 
                            d="M2 4h12M5.5 4V2.5h5V4m1.5 0v10a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 3 14V4h10M6.5 7v5M9.5 7v5" 
                            stroke="currentColor" 
                            strokeWidth="1.2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Theme Description */}
                <div className="theme-card__description">
                  {theme.description || (
                    <span className="theme-card__description-placeholder">
                      No description
                    </span>
                  )}
                </div>

                {/* Theme Footer */}
                <div className="theme-card__footer">
                  <div className="theme-card__meta">
                    <span className="theme-card__date">
                      Created {formatDate(theme.created_at)}
                    </span>
                    {theme.color_meaning && (
                      <span className="theme-card__meaning">
                        {theme.color_meaning}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeList;
