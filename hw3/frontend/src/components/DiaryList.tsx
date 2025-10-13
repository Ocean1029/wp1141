// DiaryList component - displays a list of diary cards

import React from 'react';
import type { Diary } from '../types/diary';
import DiaryCard from './DiaryCard';
import '../styles/DiaryList.css';

interface DiaryListProps {
  diaries: Diary[];
  onDiaryClick: (diary: Diary) => void;
  onEdit: (diary: Diary) => void;
  onDelete: (diary: Diary) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const DiaryList: React.FC<DiaryListProps> = ({
  diaries,
  onDiaryClick,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = 'No diaries yet. Start writing your first entry!',
}) => {
  if (isLoading) {
    return (
      <div className="diary-list__loading">
        <div className="spinner"></div>
        <p>Loading diaries...</p>
      </div>
    );
  }

  if (diaries.length === 0) {
    return (
      <div className="diary-list__empty">
        <svg
          className="diary-list__empty-icon"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
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
        <p className="diary-list__empty-text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="diary-list">
      {diaries.map((diary) => (
        <DiaryCard
          key={diary.id}
          diary={diary}
          onClick={() => onDiaryClick(diary)}
          onEdit={() => onEdit(diary)}
          onDelete={() => onDelete(diary)}
        />
      ))}
    </div>
  );
};

export default DiaryList;

