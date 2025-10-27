// TagFilterBar - Multi-select tag filter component
import { useState } from 'react';
import type { Tag } from '../types/tag';
import '../styles/TagFilterBar.css';

interface TagFilterBarProps {
  tags: Tag[];
  selectedTagIds: string[]; // Now contains tag names
  onTagToggle: (tagName: string) => void;
  onClearAll: () => void;
  onCreateTag: () => void;
}

export function TagFilterBar({
  tags,
  selectedTagIds,
  onTagToggle,
  onClearAll,
  onCreateTag,
}: TagFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasSelection = selectedTagIds.length > 0;

  return (
    <div className="tag-filter-bar">
      <div className="tag-filter-bar__header">
        <button
          className="tag-filter-bar__toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="tag-filter-bar__title">Filter by Tags</h3>
          {hasSelection && (
            <span className="tag-filter-bar__count">{selectedTagIds.length}</span>
          )}
        </button>

        <div className="tag-filter-bar__actions">
          {hasSelection && (
            <button onClick={onClearAll} className="tag-filter-bar__clear">
              Clear all
            </button>
          )}
          <button onClick={onCreateTag} className="tag-filter-bar__add">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="tag-filter-bar__content">
          {tags.length === 0 ? (
            <div className="tag-filter-bar__empty">
              <p>No tags yet. Create your first tag!</p>
            </div>
          ) : (
            <div className="tag-filter-bar__list">
              {tags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    onClick={() => onTagToggle(tag.name)}
                    className={`tag-filter-bar__tag ${isSelected ? 'tag-filter-bar__tag--selected' : ''}`}
                  >
                    <div className="tag-filter-bar__tag-info">
                      <span className="tag-filter-bar__tag-name">{tag.name}</span>
                      {tag._count && tag._count.places > 0 && (
                        <span className="tag-filter-bar__tag-count">
                          {tag._count.places}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

