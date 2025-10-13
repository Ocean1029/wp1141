// ThemePage component - Notion-style theme page with collapsible segments
import React, { useState } from 'react';
import type { Theme, ThemeSegment } from '../types/theme';
import SegmentCard from './SegmentCard';
import '../styles/ThemePage.css';

interface ThemePageProps {
  theme: Theme;
  segments: ThemeSegment[];
  onSegmentClick?: (segment: ThemeSegment) => void;
  onEditTheme?: (theme: Theme) => void;
  onDeleteTheme?: (theme: Theme) => void;
}

const ThemePage: React.FC<ThemePageProps> = ({
  theme,
  segments,
  onSegmentClick,
  onEditTheme,
  onDeleteTheme,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(theme.name);
  const [editedDescription, setEditedDescription] = useState(theme.description || '');
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== theme.name) {
      // TODO: Call API to update theme title
      console.log('Update theme title:', editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (editedDescription !== theme.description) {
      // TODO: Call API to update theme description
      console.log('Update theme description:', editedDescription);
    }
    setIsEditingDescription(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'title' | 'description') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'title') {
        handleTitleSave();
      } else {
        handleDescriptionSave();
      }
    } else if (e.key === 'Escape') {
      if (type === 'title') {
        setEditedTitle(theme.name);
        setIsEditingTitle(false);
      } else {
        setEditedDescription(theme.description || '');
        setIsEditingDescription(false);
      }
    }
  };

  const toggleSegmentExpansion = (segmentId: string) => {
    setExpandedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(segmentId)) {
        newSet.delete(segmentId);
      } else {
        newSet.add(segmentId);
      }
      return newSet;
    });
  };

  return (
    <div className="theme-page">
      {/* Theme Header */}
      <div className="theme-page__header">
        <div className="theme-page__content">
          {/* Theme Title */}
          <div className="theme-page__title-section">
            {isEditingTitle ? (
              <input
                type="text"
                className="theme-page__title-input"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => handleKeyDown(e, 'title')}
                autoFocus
              />
            ) : (
              <h1 
                className="theme-page__title"
                onClick={() => setIsEditingTitle(true)}
              >
                {theme.name}
              </h1>
            )}
          </div>

          {/* Theme Description */}
          <div className="theme-page__description-section">
            {isEditingDescription ? (
              <textarea
                className="theme-page__description-input"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => handleKeyDown(e, 'description')}
                placeholder="Add a description..."
                autoFocus
              />
            ) : (
              <div 
                className="theme-page__description"
                onClick={() => setIsEditingDescription(true)}
              >
                {theme.description || (
                  <span className="theme-page__description-placeholder">
                    Add a description...
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Theme Properties */}
          <div className="theme-page__properties">
            <div className="theme-page__property">
              <div className="theme-page__property-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path 
                    d="M8 1L10.5 5.5L15.5 6L12 9.5L13 14.5L8 12L3 14.5L4 9.5L0.5 6L5.5 5.5L8 1Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="theme-page__property-content">
                <span className="theme-page__property-label">Color</span>
                <div className="theme-page__property-value">
                  <div 
                    className="theme-page__color-dot"
                    style={{ backgroundColor: theme.color_hex || '#6366f1' }}
                  />
                  <span>{theme.color_name || 'Default'}</span>
                </div>
              </div>
            </div>

            <div className="theme-page__property">
              <div className="theme-page__property-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path 
                    d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="theme-page__property-content">
                <span className="theme-page__property-label">Segments</span>
                <span className="theme-page__property-value">{segments.length}</span>
              </div>
            </div>

            <div className="theme-page__property">
              <div className="theme-page__property-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path 
                    d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" 
                    fill="currentColor"
                  />
                  <path 
                    d="M8 4v4l3 2" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="theme-page__property-content">
                <span className="theme-page__property-label">Created</span>
                <span className="theme-page__property-value">
                  {new Date(theme.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segments Section */}
      <div className="theme-page__segments">
        <div className="theme-page__segments-header">
          <h2 className="theme-page__segments-title">Segments</h2>
          <div className="theme-page__segments-count">
            {segments.length} segment{segments.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="theme-page__segments-list">
          {segments.length === 0 ? (
            <div className="theme-page__empty-state">
              <div className="theme-page__empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="theme-page__empty-title">No segments yet</h3>
              <p className="theme-page__empty-description">
                Start creating segments to organize your thoughts around this theme.
              </p>
            </div>
          ) : (
            segments.map((segment) => (
              <div key={segment.id} className="theme-page__segment-item">
                <div 
                  className="theme-page__segment-header"
                  onClick={() => toggleSegmentExpansion(segment.id)}
                >
                  <div className="theme-page__segment-toggle">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none"
                      className={`theme-page__segment-arrow ${
                        expandedSegments.has(segment.id) ? 'theme-page__segment-arrow--expanded' : ''
                      }`}
                    >
                      <path 
                        d="M6 4l4 4-4 4" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="theme-page__segment-title">
                    <span className="theme-page__segment-diary-title">
                      {segment.diary_title || 'Untitled Diary'}
                    </span>
                    <span className="theme-page__segment-order">
                      #{segment.segment_order}
                    </span>
                  </div>
                  <div className="theme-page__segment-date">
                    {new Date(segment.diary_created_at).toLocaleDateString()}
                  </div>
                </div>
                
                {expandedSegments.has(segment.id) && (
                  <div className="theme-page__segment-content">
                    <SegmentCard
                      segment={segment}
                      onClick={onSegmentClick}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemePage;