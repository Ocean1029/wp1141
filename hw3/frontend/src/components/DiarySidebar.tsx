// DiarySidebar component - VSCode/Confluence style folder structure
// Displays diaries organized in folders with expand/collapse functionality

import React, { useState } from 'react';
import type { Diary } from '../types/diary';
import { formatRelativeTime } from '../utils/date';
import { getPreviewText } from '../utils/text';
import '../styles/DiarySidebar.css';

interface DiaryFolder {
  id: string;
  name: string;
  diaries: Diary[];
  isExpanded: boolean;
  parentId?: string;
  level: number;
}

interface DiarySidebarProps {
  diaries: Diary[];
  folders: Array<{id: string, name: string, diaries: Diary[], parentId?: string, level: number}>;
  selectedDiaryId?: string | null;
  onDiarySelect: (diary: Diary) => void;
  onCreateNew: (folderId: string) => void;
  onCreateFolder: (parentId?: string) => void;
  onDeleteDiary: (diary: Diary) => void;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  searchQuery?: string;
}

const DiarySidebar: React.FC<DiarySidebarProps> = ({
  diaries,
  folders,
  selectedDiaryId,
  onDiarySelect,
  onCreateNew,
  onCreateFolder,
  onDeleteDiary,
  onSearchChange,
  isLoading = false,
  searchQuery = '',
}) => {
  const [localFolders, setLocalFolders] = useState<DiaryFolder[]>([]);
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  // Convert folders from props to local state format
  React.useEffect(() => {
    const convertedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      diaries: folder.diaries,
      isExpanded: true,
      parentId: folder.parentId,
      level: folder.level,
    }));
    setLocalFolders(convertedFolders);
  }, [folders]);

  const toggleFolder = (folderId: string) => {
    setLocalFolders(prevFolders =>
      prevFolders.map(folder =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };


  const filteredFolders = localFolders.map(folder => ({
    ...folder,
    diaries: searchQuery
      ? folder.diaries.filter(
          diary =>
            diary.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            diary.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : folder.diaries,
  }));

  // Function to render folder hierarchy
  const renderFolderHierarchy = (parentId: string | null = null, level: number = 0): React.ReactElement[] => {
    const childFolders = filteredFolders
      .filter(folder => {
        // For root level (parentId is null), include folders with no parentId or id === 'root'
        if (parentId === null) {
          return folder.id === 'root' || !folder.parentId;
        }
        return folder.parentId === parentId;
      })
      .sort((a, b) => {
        // Sort folders first, then diaries
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        return a.name.localeCompare(b.name);
      });

    return childFolders.map(folder => (
      <div key={folder.id} className="diary-sidebar__folder" style={{ marginLeft: `${level * 16}px` }}>
        {/* Folder Header */}
        <div
          className="diary-sidebar__folder-header"
          onMouseEnter={() => setHoveredFolderId(folder.id)}
          onMouseLeave={() => setHoveredFolderId(null)}
        >
          <button
            className="diary-sidebar__folder-toggle"
            onClick={() => toggleFolder(folder.id)}
            type="button"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: folder.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path
                d="M4.5 3L7.5 6L4.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Folder Icon */}
          <svg className="diary-sidebar__folder-icon" width="16" height="16" viewBox="-1 -1 18 18" fill="none">
            <path d="M2 4h4l2 2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <span className="diary-sidebar__folder-name">
            {folder.name}
          </span>

          {/* Action buttons on hover */}
          {hoveredFolderId === folder.id && (
            <div className="diary-sidebar__folder-actions">
              <button
                className="diary-sidebar__action-btn"
                onClick={() => onCreateNew(folder.id)}
                type="button"
                aria-label={`Add new diary to ${folder.name}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <button
                className="diary-sidebar__action-btn"
                onClick={() => onCreateFolder(folder.id)}
                type="button"
                aria-label="Create new folder"
              >
                <svg width="14" height="14" viewBox="-1 -1 12 12" fill="none">
                  <path d="M2 4h4l2 2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Folder Content */}
        {folder.isExpanded && (
          <div className="diary-sidebar__folder-content">
            {/* Render child folders first */}
            {renderFolderHierarchy(folder.id, level + 1)}
            
            {/* Then render diaries */}
            {folder.diaries.map((diary) => (
              <div
                key={diary.id}
                className={`diary-sidebar__diary ${
                  selectedDiaryId === diary.id ? 'diary-sidebar__diary--selected' : ''
                }`}
              >
                <div 
                  className="diary-sidebar__diary-content"
                  onClick={() => onDiarySelect(diary)}
                >
                  <div className="diary-sidebar__diary-title">
                    {diary.title || 'Untitled'}
                  </div>
                  <div className="diary-sidebar__diary-preview">
                    {getPreviewText(diary.content, 60)}
                  </div>
                  <div className="diary-sidebar__diary-meta">
                    <span className="diary-sidebar__diary-date">
                      {formatRelativeTime(diary.created_at)}
                    </span>
                  </div>
                </div>

                {/* Delete button - positioned on the right */}
                <button
                  className="diary-sidebar__diary-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDiary(diary);
                  }}
                  type="button"
                  aria-label={`Delete ${diary.title || 'diary'}`}
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
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="diary-sidebar">
      {/* Search */}
      <div className="diary-sidebar__search">
        <svg
          className="diary-sidebar__search-icon"
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
          className="diary-sidebar__search-input"
          placeholder="Search diaries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>


      {/* Folder List */}
      <div className="diary-sidebar__content">
        {isLoading ? (
          <div className="diary-sidebar__loading">
            <div className="spinner-small"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="diary-sidebar__folders">
            {renderFolderHierarchy()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiarySidebar;