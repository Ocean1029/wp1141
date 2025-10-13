// DiaryForm component - auto-saving form for creating and editing diary entries
// Similar to Apple Notes behavior

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Diary, DiaryFormData } from '../types/diary';
import '../styles/DiaryForm.css';

interface DiaryFormProps {
  diary?: Diary | null;
  onAutoSave: (data: DiaryFormData) => Promise<void>;
  isLoading?: boolean;
}

const DiaryForm: React.FC<DiaryFormProps> = ({
  diary,
  onAutoSave,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(diary?.title || '');
  const [content, setContent] = useState(diary?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<{ element: 'title' | 'content'; position: number } | null>(null);
  const latestValuesRef = useRef<{ title: string; content: string }>({ title: '', content: '' });

  useEffect(() => {
    if (diary) {
      setTitle(diary.title || '');
      setContent(diary.content || '');
      setHasUnsavedChanges(false);
      latestValuesRef.current = { title: diary.title || '', content: diary.content || '' };
    } else {
      setTitle('');
      setContent('');
      setHasUnsavedChanges(false);
      latestValuesRef.current = { title: '', content: '' };
    }
  }, [diary]);

  // Update ref values whenever state changes
  useEffect(() => {
    latestValuesRef.current = { title, content };
  }, [title, content]);

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    const activeElement = document.activeElement;
    if (activeElement === titleInputRef.current && titleInputRef.current) {
      cursorPositionRef.current = {
        element: 'title',
        position: titleInputRef.current.selectionStart || 0,
      };
    } else if (activeElement === contentTextareaRef.current && contentTextareaRef.current) {
      cursorPositionRef.current = {
        element: 'content',
        position: contentTextareaRef.current.selectionStart || 0,
      };
    }
  }, []);

  // Restore cursor position
  const restoreCursorPosition = useCallback(() => {
    if (!cursorPositionRef.current) return;

    const { element, position } = cursorPositionRef.current;
    const targetElement = element === 'title' ? titleInputRef.current : contentTextareaRef.current;
    
    if (targetElement) {
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        targetElement.focus();
        targetElement.setSelectionRange(position, position);
      }, 0);
    }
  }, []);

  // Auto-save function with debouncing
  const autoSave = useCallback(async () => {
    const { title: currentTitle, content: currentContent } = latestValuesRef.current;
    
    if (!currentContent.trim()) return;

    // Save cursor position before saving
    saveCursorPosition();

    setIsSaving(true);
    try {
      await onAutoSave({
        title: currentTitle.trim() || undefined,
        content: currentContent.trim(),
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsSaving(false);
      // Restore cursor position after saving
      restoreCursorPosition();
    }
  }, [onAutoSave, saveCursorPosition, restoreCursorPosition]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1000); // Save after 1 second of inactivity
  }, [autoSave]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    latestValuesRef.current.title = newTitle;
    setHasUnsavedChanges(true);
    debouncedAutoSave();
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    latestValuesRef.current.content = newContent;
    setHasUnsavedChanges(true);
    debouncedAutoSave();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="diary-form">
      {/* Save Status Indicator - Fixed Position */}
      <div className="diary-form__status">
        {isSaving ? (
          <div className="diary-form__status-saving">
            <div className="spinner-small"></div>
            <span>Saving...</span>
          </div>
        ) : hasUnsavedChanges ? (
          <div className="diary-form__status-unsaved">
            <span>Unsaved changes</span>
          </div>
        ) : lastSaved ? (
          <div className="diary-form__status-saved">
            <span>Saved</span>
          </div>
        ) : null}
      </div>

      <div className="diary-form__content">
        <div className="diary-form__field">
          <input
            ref={titleInputRef}
            type="text"
            className="diary-form__input diary-form__input--title"
            placeholder="Title (optional)"
            value={title}
            onChange={handleTitleChange}
            disabled={isLoading}
            maxLength={255}
            autoFocus
          />
        </div>

        <div className="diary-form__field">
          <textarea
            ref={contentTextareaRef}
            className="diary-form__textarea"
            placeholder="Start writing your thoughts..."
            value={content}
            onChange={handleContentChange}
            disabled={isLoading}
            rows={25}
            autoFocus={!title}
          />
        </div>
      </div>
    </div>
  );
};

export default DiaryForm;

