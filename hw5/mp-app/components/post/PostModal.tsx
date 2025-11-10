"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, FileText, Trash2 } from "lucide-react";
import { validateTextLength } from "@/lib/utils/text-parser";
import { createPost, getDrafts } from "@/lib/server/posts";
import type { PostModalProps, Draft } from "@/types";

export function PostModal({ isOpen, onClose, parentId }: PostModalProps) {
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { valid, charCount } = validateTextLength(text);
  const canPost = valid && text.trim().length > 0;

  const loadDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    try {
      const fetchedDrafts = await getDrafts();
      setDrafts(fetchedDrafts);
    } catch (error) {
      console.error("Error loading drafts:", error);
      setErrorMessage("Failed to load drafts");
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && showDrafts) {
      loadDrafts();
    }
  }, [isOpen, showDrafts, loadDrafts]);

  // Auto-focus textarea when modal opens and is in post editing mode
  useEffect(() => {
    if (isOpen && !showDrafts && !pendingDraft && !showDiscardConfirm && textareaRef.current) {
      // Use setTimeout to ensure the textarea is rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [isOpen, showDrafts, pendingDraft, showDiscardConfirm]);

  const handleLoadDraft = (draft: Draft) => {
    // If there's existing content and it's not the same draft being edited, show confirmation
    if (text.trim().length > 0 && editingDraftId !== draft.id) {
      setPendingDraft(draft);
      setShowDrafts(false);
      return;
    }
    
    // Otherwise, load the draft directly
    setText(draft.text);
    setEditingDraftId(draft.id);
    setShowDrafts(false);
    // Focus textarea after loading draft
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleConfirmLoadDraft = () => {
    if (pendingDraft) {
      setText(pendingDraft.text);
      setEditingDraftId(pendingDraft.id);
      setPendingDraft(null);
      setShowDiscardConfirm(false);
      // Focus textarea after loading draft
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleCancelLoadDraft = () => {
    setPendingDraft(null);
    setShowDrafts(true);
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) {
      return;
    }
    try {
      // TODO: Implement delete draft Server Action
      // For now, just remove from local state
      setDrafts(drafts.filter((d) => d.id !== draftId));
      if (editingDraftId === draftId) {
        setText("");
        setEditingDraftId(null);
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      setErrorMessage("Failed to delete draft");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Command+Enter (Mac) or Control+Enter (Windows/Linux) to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canPost && !isPosting) {
        handlePost();
      }
    }
  };

  const handlePost = async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);
    setErrorMessage(null);
    try {
      const result = await createPost(text, parentId);
      if (!result.success) {
        setErrorMessage(result.error ?? "Unable to publish post");
        return;
      }
      setText("");
      setEditingDraftId(null);
      setPendingDraft(null);
      onClose();
    } catch (error) {
      console.error("Error posting:", error);
      setErrorMessage("Something went wrong while publishing your post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = useCallback(() => {
    // If showing drafts, just close drafts view and return to post state
    if (showDrafts) {
      setShowDrafts(false);
      setShowDiscardConfirm(false);
      setPendingDraft(null);
      return;
    }
    
    // If there's a pending draft confirmation, cancel it and return to drafts
    if (pendingDraft) {
      setPendingDraft(null);
      setShowDrafts(true);
      return;
    }
    
    // Otherwise, handle normal close logic
    if (text.trim().length > 0 && !editingDraftId) {
      setShowDiscardConfirm(true);
    } else {
      setText("");
      setEditingDraftId(null);
      setShowDrafts(false);
      setPendingDraft(null);
      onClose();
    }
  }, [showDrafts, pendingDraft, text, editingDraftId, onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // If showing discard confirm or pending draft, just cancel those states
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
          return;
        }
        if (pendingDraft) {
          setPendingDraft(null);
          setShowDrafts(true);
          return;
        }
        // Otherwise, close the modal
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, showDiscardConfirm, pendingDraft, handleClose]);

  const handleDiscard = () => {
    setText("");
    setShowDiscardConfirm(false);
      setEditingDraftId(null);
      setPendingDraft(null);
    onClose();
  };

  const handleSaveDraft = async () => {
    if (isPosting || isSavingDraft) return;
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setErrorMessage("Draft cannot be empty");
      return;
    }

    setIsSavingDraft(true);
    setErrorMessage(null);
    try {
      const result = await createPost(text, parentId, true);
      if (!result.success) {
        setErrorMessage(result.error ?? "Unable to save draft");
        return;
      }
    setText("");
    setShowDiscardConfirm(false);
      setEditingDraftId(null);
      setPendingDraft(null);
    onClose();
    } catch (error) {
      console.error("Error saving draft:", error);
      setErrorMessage("Something went wrong while saving your draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
            {!showDrafts && (
              <button
                onClick={() => {
                  setShowDrafts(true);
                  loadDrafts();
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4" />
                <span>Drafts</span>
              </button>
            )}
          </div>
          {!showDrafts && (
          <button
            onClick={handlePost}
            disabled={!canPost || isPosting}
            className="rounded-full bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
          )}
        </div>

        {showDrafts ? (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Your Drafts</h3>
              <button
                onClick={() => {
                  setShowDrafts(false);
                  setText("");
                  setEditingDraftId(null);
                  setPendingDraft(null);
                  // Focus textarea after creating new post
                  setTimeout(() => {
                    textareaRef.current?.focus();
                  }, 0);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                New Post
              </button>
            </div>
            {isLoadingDrafts ? (
              <div className="py-8 text-center text-gray-500">Loading drafts...</div>
            ) : drafts.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No drafts yet. Start writing to save a draft!
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="group flex items-start justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <button
                      onClick={() => handleLoadDraft(draft)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {draft.text}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {draft.relativeTime}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : pendingDraft ? (
          <div className="p-6">
            <h3 className="mb-2 text-lg font-bold">Discard current changes?</h3>
            <p className="mb-6 text-gray-600">
              You have unsaved changes. Loading this draft will replace your current text.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLoadDraft}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLoadDraft}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Load Draft
              </button>
            </div>
          </div>
        ) : showDiscardConfirm ? (
          <div className="p-6">
            <h3 className="mb-2 text-lg font-bold">Discard post?</h3>
            <p className="mb-6 text-gray-600">
              You have an unsaved draft. What would you like to do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={handleDiscard}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" />
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's happening?"
                className="w-full resize-none border-none p-2 text-lg outline-none"
                rows={6}
              />
            </div>
            {errorMessage ? (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            ) : null}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Hashtags and mentions don&apos;t count toward character limit
              </div>
              <div
                className={`font-medium ${
                  charCount > 260 ? "text-orange-600" : "text-gray-600"
                } ${!valid ? "text-red-600" : ""}`}
              >
                {charCount}/280
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Press Cmd/Ctrl+Enter to post
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

