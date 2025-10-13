// SegmentCard component - displays individual segments in Notion style
import React from 'react';
import type { ThemeSegment } from '../types/theme';
import '../styles/SegmentCard.css';

interface SegmentCardProps {
  segment: ThemeSegment;
  onClick?: (segment: ThemeSegment) => void;
  onEdit?: (segment: ThemeSegment) => void;
  onDelete?: (segment: ThemeSegment) => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleClick = () => {
    onClick?.(segment);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(segment);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(segment);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="segment-card" onClick={handleClick}>
      <div className="segment-card__content">
        {/* Segment Header */}
        <div className="segment-card__header">
          <div className="segment-card__meta">
            <span className="segment-card__diary-title">
              {segment.diary_title || 'Untitled Diary'}
            </span>
            <span className="segment-card__date">
              {formatDate(segment.diary_created_at)}
            </span>
          </div>
          <div className="segment-card__actions">
            {onEdit && (
              <button
                className="segment-card__action-btn"
                onClick={handleEdit}
                title="Edit segment"
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
            {onDelete && (
              <button
                className="segment-card__action-btn segment-card__action-btn--danger"
                onClick={handleDelete}
                title="Delete segment"
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

        {/* Segment Content */}
        <div className="segment-card__text">
          {segment.content}
        </div>

        {/* Segment Footer */}
        <div className="segment-card__footer">
          <div className="segment-card__order">
            #{segment.segment_order}
          </div>
          <div className="segment-card__theme-info">
            {segment.theme_name && (
              <span className="segment-card__theme-name">
                {segment.theme_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;