// DiaryDetail component - displays full diary entry

import React from 'react';
import type { Diary } from '../types/diary';
import { formatDate } from '../utils/date';
import '../styles/DiaryDetail.css';

interface DiaryDetailProps {
  diary: Diary;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  diary,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="diary-detail">
      <div className="diary-detail__header">
        <div className="diary-detail__meta">
          <time className="diary-detail__date" dateTime={diary.created_at}>
            {formatDate(diary.created_at)}
          </time>
          {diary.updated_at !== diary.created_at && (
            <span className="diary-detail__updated">
              Updated: {formatDate(diary.updated_at)}
            </span>
          )}
        </div>
      </div>

      <div className="diary-detail__content">
        {diary.title && (
          <h1 className="diary-detail__title">{diary.title}</h1>
        )}

        <div className="diary-detail__text">
          {diary.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiaryDetail;