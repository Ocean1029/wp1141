// DiaryFolderSidebar component - folder-based diary navigation
// Similar to VSCode/Confluence folder structure

import React, { useState } from 'react';
import type { Diary } from '../types/diary';
import { formatDate, formatRelativeTime } from '../utils/date';
import { getPreviewText } from '../utils/text';
import '../styles/DiaryFolderSidebar.css';

interface DiaryFolder {
  id: string;
  name: string;
  diaries: Diary[];
  isExpanded: boolean;
}

interface DiaryFolderSidebarProps {
  diaries: Diary[];
  selectedDiaryId?: string | null;
  onDiarySelect: (diary: Diary) => void;
  onCreateNew: (folderId: string) => void;
  onDeleteDiary: (diary: Diary) => void;
  isLoading?: boolean;
  searchQuery?: string;
}

const DiaryFolderSidebar: React.FC<DiaryFolderSidebarProps> = ({
  diaries,
  selectedDiaryId,
  onDiarySelect,
  onCreateNew,
  onDeleteDiary,
  isLoading = false,
  searchQuery = '',
}) => {
  const [folders, setFolders] = useState<DiaryFolder[]>([
    {
      id: 'root',
      name: 'All Diaries',
      diaries: diaries,
      isExpanded: true,
    },
  ]);

  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  // Update folders when diaries change
  React.useEffect(() => {
    setFolders(prevFolders => 
      prevFolders.map(folder => ({
        ...folder,
        diaries: folder.id === 'root' ? diaries : folder.diaries
      }))
    );
  }, [diaries]);

  const toggleFolder = (folderId: string) => {
    setFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  const handleDeleteDiary = (e: React.MouseEvent, diary: Diary) => {
    e.stopPropagation();
    onDeleteDiary(diary);
  };

  const filteredFolders = folders.map(folder => ({
    ...folder,
    diaries: searchQuery
      ? folder.diaries.filter(
          diary =>
            diary.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            diary.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : folder.diaries,
  }));

  return (
    <div className="diary-folder-sidebar">
      {/* Search */}
      <div className="diary-folder-sidebar__search">
        <svg
          className="diary-folder-sidebar__search-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12zM13 13l-3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          className="diary-folder-sidebar__search-input"
          placeholder="Search diaries..."
          value={searchQuery}
          onChange={(e) => {
            // This will be handled by parent component
          }}
        />
      </div>

      {/* Folder List */}
      <div className="diary-folder-sidebar__content">
        {isLoading ? (
          <div className="diary-folder-sidebar__loading">
            <div className="spinner-small"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="diary-folder-sidebar__folders">
            {filteredFolders.map((folder) => (
              <div key={folder.id} className="diary-folder-sidebar__folder">
                {/* Folder Header */}
                <div
                  className="diary-folder-sidebar__folder-header"
                  onMouseEnter={() => setHoveredFolderId(folder.id)}
                  onMouseLeave={() => setHoveredFolderId(null)}
                >
                  <button
                    className="diary-folder-sidebar__folder-toggle"
                    onClick={() => toggleFolder(folder.id)}
                    type="button"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{
                        transform: folder.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <path
                        d="M6 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <span className="diary-folder-sidebar__folder-name">
                    {folder.name}
                  </span>

                  {/* Add button on hover */}
                  {hoveredFolderId === folder.id && (
                    <button
                      className="diary-folder-sidebar__add-btn"
                      onClick={() => onCreateNew(folder.id)}
                      type="button"
                      aria-label={`Add new diary to ${folder.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M7 2V12M2 7H12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Folder Content */}
                {folder.isExpanded && (
                  <div className="diary-folder-sidebar__folder-content">
                    {folder.diaries.length === 0 ? (
                      <div className="diary-folder-sidebar__empty">
                        <p>No diaries in this folder</p>
                      </div>
                    ) : (
                      <div className="diary-folder-sidebar__diaries">
                        {folder.diaries.map((diary) => (
                          <div
                            key={diary.id}
                            className={`diary-folder-sidebar__diary ${
                              selectedDiaryId === diary.id
                                ? 'diary-folder-sidebar__diary--active'
                                : ''
                            }`}
                            onClick={() => onDiarySelect(diary)}
                          >
                            <div className="diary-folder-sidebar__diary-content">
                              <h3 className="diary-folder-sidebar__diary-title">
                                {diary.title || 'Untitled'}
                              </h3>
                              <p className="diary-folder-sidebar__diary-preview">
                                {getPreviewText(diary.content, 80)}
                              </p>
                              <div className="diary-folder-sidebar__diary-meta">
                                <time className="diary-folder-sidebar__diary-date">
                                  {formatRelativeTime(diary.created_at)}
                                </time>
                                <button
                                  className="diary-folder-sidebar__diary-delete"
                                  onClick={(e) => handleDeleteDiary(e, diary)}
                                  type="button"
                                  aria-label="Delete diary"
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                      d="M2.5 3.5H11.5M5.5 3.5V2.5H8.5V3.5M10.5 3.5V12.5H3.5V3.5"
                                      stroke="currentColor"
                                      strokeWidth="1.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryFolderSidebar;
