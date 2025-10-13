// ThemePage component - displays all segments for a specific theme

import React, { useEffect, useState } from 'react';
import type { ThemeWithSegments } from '../types/theme';
import themeService from '../services/themeService';
import SegmentCard from './SegmentCard';
import '../styles/ThemePage.css';

interface ThemePageProps {
  themeId: string;
  onViewDiary: (diaryId: string) => void;
  onClose: () => void;
}

const ThemePage: React.FC<ThemePageProps> = ({
  themeId,
  onViewDiary,
  onClose,
}) => {
  const [theme, setTheme] = useState<ThemeWithSegments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTheme();
  }, [themeId]);

  const fetchTheme = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedTheme = await themeService.getThemeById(themeId);
      setTheme(fetchedTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="theme-page">
        <div className="theme-page__loading">
          <div className="spinner"></div>
          <p>Loading theme...</p>
        </div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="theme-page">
        <div className="theme-page__error">
          <p>{error || 'Theme not found'}</p>
          <button className="btn btn--secondary" onClick={onClose}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page">
      <div className="theme-page__header">
        <button className="theme-page__back" onClick={onClose} type="button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M16 10H4M10 16l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Diaries
        </button>

        <div
          className="theme-page__title-container"
          style={{
            borderLeftColor: theme.color_hex || '#9ca3af',
          }}
        >
          <h2 className="theme-page__title">{theme.name}</h2>
          {theme.description && (
            <p className="theme-page__description">{theme.description}</p>
          )}
        </div>

        <div className="theme-page__stats">
          <span className="theme-page__count">
            {theme.segments.length} segment{theme.segments.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {theme.segments.length === 0 ? (
        <div className="theme-page__empty">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            className="theme-page__empty-icon"
          >
            <path
              d="M48 8H16C13.7909 8 12 9.79086 12 12V52C12 54.2091 13.7909 56 16 56H48C50.2091 56 52 54.2091 52 52V12C52 9.79086 50.2091 8 48 8Z"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 20H44M20 32H44M20 44H36"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="theme-page__empty-text">
            No segments found for this theme yet.
          </p>
        </div>
      ) : (
        <div className="theme-page__segments">
          {theme.segments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              onViewDiary={() => onViewDiary(segment.diary_id)}
              showDiaryLink={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemePage;

