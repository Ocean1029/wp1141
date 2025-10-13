// FloatingToolbar component - Notion-style text selection toolbar
// Appears when user selects text in the diary content area

import React, { useState, useEffect, useRef } from 'react';
import '../styles/FloatingToolbar.css';

interface FloatingToolbarProps {
  onFormatText: (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  onAddLink: () => void;
  onAddComment: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

interface SelectionInfo {
  text: string;
  rect: DOMRect;
  isVisible: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onFormatText,
  onAddLink,
  onAddComment,
  textareaRef,
}) => {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        setSelection(null);
        return;
      }

      // Check if selection is within our textarea
      if (textareaRef?.current && !textareaRef.current.contains(selection.anchorNode)) {
        setSelection(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const text = selection.toString().trim();

      // Only show toolbar for text selections (not empty selections)
      if (text.length > 0) {
        setSelection({
          text,
          rect,
          isVisible: true,
        });
      } else {
        setSelection(null);
      }
    };

    const handleTextareaSelection = () => {
      if (!textareaRef?.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      if (start === end) {
        setSelection(null);
        return;
      }

      const selectedText = textarea.value.substring(start, end).trim();
      if (selectedText.length === 0) {
        setSelection(null);
        return;
      }

      // Create a mock rect for positioning
      const textareaRect = textarea.getBoundingClientRect();
      const lineHeight = 24; // Approximate line height
      const lines = textarea.value.substring(0, start).split('\n').length - 1;
      
      setSelection({
        text: selectedText,
        rect: {
          ...textareaRect,
          top: textareaRect.top + (lines * lineHeight),
          height: lineHeight,
        } as DOMRect,
        isVisible: true,
      });
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        // Check if the click is not on selected text
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setSelection(null);
        }
      }
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    if (textareaRef?.current) {
      textareaRef.current.addEventListener('mouseup', handleTextareaSelection);
      textareaRef.current.addEventListener('keyup', handleTextareaSelection);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setSelection(null);
      }
    });

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      // Capture the current textarea reference to avoid stale closure warning
      const currentTextarea = textareaRef?.current;
      if (currentTextarea) {
        currentTextarea.removeEventListener('mouseup', handleTextareaSelection);
        currentTextarea.removeEventListener('keyup', handleTextareaSelection);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textareaRef]);

  // Position the toolbar above the selection
  const getToolbarStyle = (): React.CSSProperties => {
    if (!selection) return { display: 'none' };

    const toolbarHeight = 40; // Approximate toolbar height
    const offset = 8; // Distance from selection

    return {
      position: 'fixed',
      left: `${selection.rect.left + selection.rect.width / 2}px`,
      top: `${selection.rect.top - toolbarHeight - offset}px`,
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: selection.isVisible ? 'flex' : 'none',
    };
  };

  const handleFormatClick = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    onFormatText(format);
    // Clear selection after formatting
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const handleLinkClick = () => {
    onAddLink();
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  const handleCommentClick = () => {
    onAddComment();
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  };

  if (!selection) return null;

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      style={getToolbarStyle()}
    >
      <div className="floating-toolbar__content">
        {/* Format buttons */}
        <button
          className="floating-toolbar__btn"
          onClick={() => handleFormatClick('bold')}
          title="Bold"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 2.5h3.5a3 3 0 0 1 0 6H4V2.5zM4 8.5h3a2 2 0 0 1 0 4H4v-4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="floating-toolbar__btn"
          onClick={() => handleFormatClick('italic')}
          title="Italic"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 2.5h4M6 13.5h4M8 2.5v11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="floating-toolbar__btn"
          onClick={() => handleFormatClick('underline')}
          title="Underline"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 13h8M6 13V4a2 2 0 0 1 4 0v9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className="floating-toolbar__btn"
          onClick={() => handleFormatClick('strikethrough')}
          title="Strikethrough"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 8h8M6 8V4a2 2 0 0 1 4 0v4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="floating-toolbar__divider" />

        {/* Link button */}
        <button
          className="floating-toolbar__btn"
          onClick={handleLinkClick}
          title="Add Link"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M7 13a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v3a3 3 0 0 0 3 3zM13 7a3 3 0 0 0-3-3M3 7a3 3 0 0 0 3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Comment button */}
        <button
          className="floating-toolbar__btn"
          onClick={handleCommentClick}
          title="Add Comment"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8a5 5 0 0 1 10 0v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zM8 8h0M8 11h0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FloatingToolbar;
