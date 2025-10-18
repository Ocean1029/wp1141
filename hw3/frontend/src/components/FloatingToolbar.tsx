// FloatingToolbar component - Simplified text selection toolbar
// Appears when user selects text in the diary content area
// Only shows "Add to Theme" (star) functionality

import React, { useState, useEffect, useRef } from 'react';
import '../styles/FloatingToolbar.css';

interface FloatingToolbarProps {
  onAddToTheme?: (text: string) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

interface SelectionInfo {
  text: string;
  rect: DOMRect;
  isVisible: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onAddToTheme,
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

  if (!selection) return null;

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      style={getToolbarStyle()}
    >
      <div className="floating-toolbar__content">
        {/* Theme button - Add selected text to segment */}
        {onAddToTheme && (
          <button
            className="floating-toolbar__btn"
            onClick={() => onAddToTheme(selection?.text || '')}
            title="Add to Theme"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L10.5 5.5L15.5 6L12 9.5L13 14.5L8 12L3 14.5L4 9.5L0.5 6L5.5 5.5L8 1Z"
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
  );
};

export default FloatingToolbar;
