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
  mouseX?: number;
  mouseY?: number;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onAddToTheme,
  textareaRef,
}) => {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
          mouseX: lastMousePosition.current.x,
          mouseY: lastMousePosition.current.y,
        });
      } else {
        setSelection(null);
      }
    };

    const handleTextareaSelection = (event?: MouseEvent) => {
      if (!textareaRef?.current) return;

      // Store mouse position when available
      if (event) {
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }

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
        mouseX: lastMousePosition.current.x,
        mouseY: lastMousePosition.current.y,
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

    // Track mouse movement globally
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousemove', handleMouseMove);
    if (textareaRef?.current) {
      textareaRef.current.addEventListener('mouseup', handleTextareaSelection as EventListener);
      textareaRef.current.addEventListener('keyup', () => handleTextareaSelection());
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setSelection(null);
      }
    });

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousemove', handleMouseMove);
      // Capture the current textarea reference to avoid stale closure warning
      const currentTextarea = textareaRef?.current;
      if (currentTextarea) {
        currentTextarea.removeEventListener('mouseup', handleTextareaSelection as EventListener);
        currentTextarea.removeEventListener('keyup', () => handleTextareaSelection());
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textareaRef]);

  // Position the toolbar near the mouse cursor where selection ended
  const getToolbarStyle = (): React.CSSProperties => {
    if (!selection) return { display: 'none' };

    const toolbarHeight = 40; // Approximate toolbar height
    const offset = 12; // Distance from mouse cursor
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const toolbarWidth = 48; // Approximate toolbar width (single button)

    // Use mouse position if available, otherwise fall back to selection rect
    let left = selection.mouseX ?? selection.rect.left + selection.rect.width / 2;
    let top = (selection.mouseY ?? selection.rect.top) - toolbarHeight - offset;

    // Ensure toolbar stays within viewport bounds
    // Horizontal bounds
    if (left - toolbarWidth / 2 < 10) {
      left = toolbarWidth / 2 + 10;
    } else if (left + toolbarWidth / 2 > viewportWidth - 10) {
      left = viewportWidth - toolbarWidth / 2 - 10;
    }

    // Vertical bounds - if toolbar would be above viewport, show it below the cursor
    if (top < 10) {
      top = (selection.mouseY ?? selection.rect.bottom) + offset;
    }

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
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
