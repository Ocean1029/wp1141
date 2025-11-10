"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Trash2, X } from "lucide-react";
import { validateTextLength } from "@/lib/utils/text-parser";
import { createPost, getDrafts } from "@/lib/server/posts";
import { useRouter } from "next/navigation";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import type { Session } from "next-auth";
import type { Draft } from "@/types";
import { EditableTextArea, type EditableTextAreaRef } from "./EditableTextArea";

interface EditablePostCardProps {
  session: Session | null;
}

export function EditablePostCard({ session }: EditablePostCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<Draft | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showSaveDraftConfirm, setShowSaveDraftConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<EditableTextAreaRef>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

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
    if (showDrafts) {
      loadDrafts();
    }
  }, [showDrafts, loadDrafts]);

  // Handle ESC key to close drafts modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDrafts) {
        setShowDrafts(false);
      }
      if (e.key === "Escape" && pendingDraft) {
        setPendingDraft(null);
        setShowDrafts(true);
      }
    };

    if (showDrafts || pendingDraft) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showDrafts, pendingDraft]);

  const handleSaveDraft = useCallback(async () => {
    if (isPosting || isSavingDraft) return;
    const trimmed = text.trim();
    if (trimmed.length === 0 && !imageUrl) {
      setErrorMessage("Draft cannot be empty");
      return;
    }

    setIsSavingDraft(true);
    setErrorMessage(null);
    try {
      const result = await createPost(text, undefined, true, imageUrl ?? undefined);
      if (!result.success) {
        setErrorMessage(result.error ?? "Unable to save draft");
        return;
      }
      setText("");
      setImageUrl(null);
      setEditingDraftId(null);
      setPendingDraft(null);
      setShowSaveDraftConfirm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Navigate if there's a pending navigation
      if (pendingNavigation) {
        router.push(pendingNavigation);
        setPendingNavigation(null);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      setErrorMessage("Something went wrong while saving your draft");
    } finally {
      setIsSavingDraft(false);
    }
  }, [text, imageUrl, isPosting, isSavingDraft, pendingNavigation, router]);

  // Handle beforeunload event (closing tab/window)
  useEffect(() => {
    const hasContent = text.trim().length > 0 || imageUrl !== null;
    
    if (hasContent) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [text, imageUrl]);

  // Intercept navigation attempts
  useEffect(() => {
    const hasContent = text.trim().length > 0 || imageUrl !== null;
    
    if (!hasContent) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Only intercept if navigating to a different route
        if (url.pathname !== currentUrl.pathname) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(url.pathname);
          setShowSaveDraftConfirm(true);
        }
      }
    };

    const handlePopState = () => {
      const hasContent = text.trim().length > 0 || imageUrl !== null;
      if (hasContent) {
        const shouldSave = window.confirm("You have unsaved content. Save as draft before leaving?");
        if (shouldSave) {
          // Save draft and allow navigation
          handleSaveDraft();
        } else {
          // Discard and allow navigation
          setText("");
          setImageUrl(null);
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [text, imageUrl, handleSaveDraft]);

  // Focus textarea when component mounts or when focus=compose query param is present
  useEffect(() => {
    const shouldFocus = searchParams.get("focus") === "compose";
    if (textareaRef.current) {
      if (shouldFocus) {
        // Scroll to top and focus when coming from Post button
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          textareaRef.current?.focus();
          // Remove the query parameter from URL without reloading
          router.replace("/home", { scroll: false });
        }, 300);
      } else if (!showDrafts && !pendingDraft && !showSaveDraftConfirm) {
        // Auto-focus on mount if no query param
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    }
  }, [searchParams, router, showDrafts, pendingDraft, showSaveDraftConfirm]);

  const handleLoadDraft = (draft: Draft) => {
    // Check if textarea has content before loading draft
    const hasContent = text.trim().length > 0;
    
    // If there's existing content, always show confirmation dialog
    if (hasContent) {
      setPendingDraft(draft);
      setShowDrafts(false);
      return;
    }
    
    // No content in textarea, load draft directly
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Command+Enter (Mac) or Control+Enter (Windows/Linux) to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canPost && !isPosting) {
        handlePost();
      }
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setImageUrl(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.getSelectionStart();
    const end = textarea.getSelectionEnd();
    const newText = text.slice(0, start) + emoji + text.slice(end);
    
    setText(newText);
    setShowEmojiPicker(false);
    
    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + emoji.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handlePost = async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);
    setErrorMessage(null);
    try {
      const result = await createPost(text, undefined, false, imageUrl ?? undefined);
      if (!result.success) {
        setErrorMessage(result.error ?? "Unable to publish post");
        return;
      }
      setText("");
      setImageUrl(null);
      setEditingDraftId(null);
      setPendingDraft(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Refresh the page to show the new post
      router.refresh();
    } catch (error) {
      console.error("Error posting:", error);
      setErrorMessage("Something went wrong while publishing your post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDiscardAndNavigate = () => {
    setText("");
    setImageUrl(null);
    setEditingDraftId(null);
    setPendingDraft(null);
    setShowSaveDraftConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowSaveDraftConfirm(false);
    setPendingNavigation(null);
  };

  if (!session?.user) {
    return null;
  }

  const userImage = session.user.image ?? null;
  const userName = session.user.name ?? "User";

  return (
    <>
      <article className="post-card border-b border-gray-200 relative">
        <div className="post-card__body flex gap-4 p-3 border-b border-gray-200 relative">
          <button
            onClick={() => {
              setShowDrafts(true);
              loadDrafts();
            }}
            className="absolute top-3 right-3 text-blue-500 hover:text-blue-600 z-10"
            title="Drafts"
          >
            <FileText className="h-5 w-5" />
          </button>
          <div className="post-card__avatar h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-300">
            {userImage ? (
              <img
                src={userImage}
                alt={`${userName} avatar`}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex-1">
            <EditableTextArea
              ref={textareaRef}
              value={text}
              onChange={setText}
              onKeyDown={handleKeyDown}
              placeholder="What's happening?"
              className="w-full resize-none border-none p-0 text-lg outline-none bg-transparent placeholder:text-gray-500 whitespace-pre-wrap break-words"
              rows={3}
            />
            {errorMessage ? (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            ) : null}
            {imageUrl && (
              <div className="mt-2 relative">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex items-center justify-center text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add image"
                >
                  {isUploadingImage ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  )}
                </button>
                <div className="relative flex items-center justify-center">
                  <button
                    ref={emojiButtonRef}
                    onClick={toggleEmojiPicker}
                    className={`flex items-center justify-center text-blue-500 hover:text-blue-600 ${showEmojiPicker ? "text-blue-600" : ""}`}
                    title="Add emoji"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                  </button>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onEmojiSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`text-sm font-medium text-gray-500 ${
                    charCount > 260 ? "text-orange-600" : ""
                  } ${!valid ? "text-red-600" : ""}`}
                >
                  {charCount}/280
                </div>
                <button
                  onClick={handlePost}
                  disabled={!canPost || isPosting}
                  className="rounded-full bg-blue-500 px-6 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Drafts Modal Overlay */}
      {showDrafts && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDrafts(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold">Your Drafts</h3>
              <button
                onClick={() => setShowDrafts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingDrafts ? (
                <div className="py-8 text-center text-gray-500">Loading drafts...</div>
              ) : drafts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No drafts yet. Start writing to save a draft!
                </div>
              ) : (
                <div className="space-y-2">
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
          </div>
        </div>
      )}

      {/* Pending Draft Confirmation Modal */}
      {pendingDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelLoadDraft();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-bold">Discard current changes?</h3>
            <p className="mb-6 text-gray-600">
              You have unsaved content in the text area. Loading this draft will replace your current content. Do you want to continue?
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
        </div>
      )}

      {/* Save Draft Before Navigation Confirmation Modal */}
      {showSaveDraftConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelNavigation();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-bold">Save as draft before leaving?</h3>
            <p className="mb-6 text-gray-600">
              You have unsaved content. Would you like to save it as a draft before leaving?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDiscardAndNavigate}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

