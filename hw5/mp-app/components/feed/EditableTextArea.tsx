"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { parseText } from "@/lib/utils/text-parser";

interface EditableTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export interface EditableTextAreaRef {
  focus: () => void;
  blur: () => void;
  getSelectionStart: () => number;
  getSelectionEnd: () => number;
  setSelectionRange: (start: number, end: number) => void;
}

/**
 * ContentEditable textarea component that highlights URLs in blue
 */
export const EditableTextArea = forwardRef<EditableTextAreaRef, EditableTextAreaProps>(
  ({ value, onChange, onKeyDown, placeholder, className = "", rows = 3 }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const isComposingRef = useRef(false);

    useImperativeHandle(ref, () => ({
      focus: () => {
        divRef.current?.focus();
      },
      blur: () => {
        divRef.current?.blur();
      },
      getSelectionStart: () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !divRef.current) return 0;
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(divRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
      },
      getSelectionEnd: () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !divRef.current) return 0;
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(divRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
      },
      setSelectionRange: (start: number, end: number) => {
        if (!divRef.current) return;
        const textContent = divRef.current.textContent || "";
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (selection) {
          try {
            let charCount = 0;
            let startNode: Node | null = null;
            let startOffset = 0;
            let endNode: Node | null = null;
            let endOffset = 0;

            const walker = document.createTreeWalker(
              divRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );

            let node;
            while ((node = walker.nextNode())) {
              const nodeLength = node.textContent?.length || 0;
              
              if (!startNode && charCount + nodeLength >= start) {
                startNode = node;
                startOffset = start - charCount;
              }
              
              if (!endNode && charCount + nodeLength >= end) {
                endNode = node;
                endOffset = end - charCount;
                break;
              }
              
              charCount += nodeLength;
            }

            if (startNode && endNode) {
              range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length || 0));
              range.setEnd(endNode, Math.min(endOffset, endNode.textContent?.length || 0));
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              // Fallback: set cursor to end
              range.selectNodeContents(divRef.current);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (error) {
            console.error("Error setting selection range:", error);
          }
        }
      },
    }));

    // Update content when value changes externally
    useEffect(() => {
      if (divRef.current && !isComposingRef.current) {
        const currentText = divRef.current.textContent || "";
        if (currentText !== value) {
          const parsed = parseText(value);
          const sortedSegments = [...parsed.segments].sort((a, b) => a.start - b.start);
          
          let html = "";
          let lastIndex = 0;

          sortedSegments.forEach((segment) => {
            // Add text before this segment
            if (segment.start > lastIndex) {
              const textBefore = value.substring(lastIndex, segment.start);
              html += escapeHtml(textBefore);
            }

            // Add the segment with styling
            if (segment.type === "url") {
              html += `<span class="text-blue-600">${escapeHtml(segment.content)}</span>`;
            } else {
              html += escapeHtml(segment.content);
            }

            lastIndex = segment.end;
          });

          // Add remaining text
          if (lastIndex < value.length) {
            html += escapeHtml(value.substring(lastIndex));
          }

          divRef.current.innerHTML = html || "";
          
          // Restore cursor position
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = divRef.current.firstChild;
            if (textNode) {
              const newRange = document.createRange();
              newRange.setStart(textNode, Math.min(range.startOffset, textNode.textContent?.length || 0));
              newRange.setEnd(textNode, Math.min(range.endOffset, textNode.textContent?.length || 0));
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      }
    }, [value]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      if (isComposingRef.current) return;
      
      const text = divRef.current?.textContent || "";
      onChange(text);
    };

    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = () => {
      isComposingRef.current = false;
      const text = divRef.current?.textContent || "";
      onChange(text);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text/plain");
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(pastedText);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        const newText = divRef.current?.textContent || "";
        onChange(newText);
      }
    };

    const isEmpty = !value || value.trim().length === 0;

    return (
      <div className="relative">
        {isEmpty && placeholder && (
          <div className="absolute inset-0 pointer-events-none text-gray-500" style={{ padding: 0 }}>
            {placeholder}
          </div>
        )}
        <div
          ref={divRef}
          contentEditable
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onPaste={handlePaste}
          onKeyDown={onKeyDown}
          className={className}
          suppressContentEditableWarning
          style={{
            minHeight: `${rows * 1.5}rem`,
          }}
        />
      </div>
    );
  }
);

EditableTextArea.displayName = "EditableTextArea";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

