// SegmentCard component - displays a diary segment with theme

import React from 'react';
import type { Segment } from '../types/segment';
import type { ThemeSegment } from '../types/theme';
import '../styles/SegmentCard.css';

interface SegmentCardProps {
  segment: Segment | ThemeSegment;
  onViewDiary?: () => void;
  onThemeChange?: (segmentId: string, newThemeId: string | null) => void;
  onDelete?: (segmentId: string) => void;
  showDiaryLink?: boolean;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  onViewDiary,
  onThemeChange,
  onDelete,
  showDiaryLink = false,
}) => {
  const themeColor = segment.theme_color || '#9ca3af';

  return (
    <div className="segment-card" style={{ borderLeftColor: themeColor }}>
      <div className="segment-card__header">
        {segment.theme_name && (
          <span
            className="segment-card__theme"
            style={{
              backgroundColor: `${themeColor}20`,
              color: themeColor,
            }}
          >
            {segment.theme_name}
          </span>
        )}
        
        {showDiaryLink && segment.diary_title && (
          <button
            className="segment-card__diary-link"
            onClick={onViewDiary}
            type="button"
          >
            View original diary →
          </button>
        )}
      </div>

      <p className="segment-card__content">{segment.content}</p>

      {(onThemeChange || onDelete) && (
        <div className="segment-card__actions">
          {onThemeChange && (
            <button
              className="segment-card__action-btn"
              onClick={() => {
                // TODO: Implement theme change UI
                console.log('Change theme for segment', segment.id);
              }}
              type="button"
            >
              Change Theme
            </button>
          )}
          
          {onDelete && (
            <button
              className="segment-card__action-btn segment-card__action-btn--delete"
              onClick={() => onDelete(segment.id)}
              type="button"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SegmentCard;

