// DiaryCard component - displays a single diary entry as a card

import React from 'react';
import type { Diary } from '../types/diary';
import { formatRelativeTime, formatDate } from '../utils/date';
import { getPreviewText } from '../utils/text';
import '../styles/DiaryCard.css';

interface DiaryCardProps {
  diary: Diary;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DiaryCard: React.FC<DiaryCardProps> = ({
  diary,
  onClick,
  onEdit,
  onDelete,
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <article className="diary-card" onClick={onClick}>
      <div className="diary-card__header">
        <div className="diary-card__time-info">
          <time className="diary-card__date" dateTime={diary.created_at}>
            {formatRelativeTime(diary.created_at)}
          </time>
          <span className="diary-card__date-full">
            {formatDate(diary.created_at)}
          </span>
        </div>
        
        <div className="diary-card__actions">
          {onEdit && (
            <button
              className="diary-card__action-btn diary-card__action-btn--edit"
              onClick={handleEdit}
              aria-label="Edit diary"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M12.5 1.5L16.5 5.5L6 16H2V12L12.5 1.5Z"
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
              className="diary-card__action-btn diary-card__action-btn--delete"
              onClick={handleDelete}
              aria-label="Delete diary"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2.5 4.5H15.5M7 4.5V2.5H11V4.5M13.5 4.5V15.5H4.5V4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {diary.title && (
        <h3 className="diary-card__title">{diary.title}</h3>
      )}

      <p className="diary-card__preview">
        {getPreviewText(diary.content, 200)}
      </p>

      <div className="diary-card__footer">
        <span className="diary-card__read-more">Read more →</span>
      </div>
    </article>
  );
};

export default DiaryCard;

