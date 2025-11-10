"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { validateTextLength } from "@/lib/utils/text-parser";
import { createPost } from "@/lib/server/posts";
import { useRouter } from "next/navigation";
import { EmojiPicker } from "@/components/common/EmojiPicker";
import { searchUsers } from "@/lib/server/users";
import type { Session } from "next-auth";

interface User {
  id: string;
  userId: string;
  name: string;
  imageUrl?: string;
}

interface ReplyPostCardProps {
  session: Session | null;
  parentId: string;
  onReplySuccess?: () => void;
  autoFocus?: boolean;
}

export function ReplyPostCard({ session, parentId, onReplySuccess, autoFocus = false }: ReplyPostCardProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { valid, charCount } = validateTextLength(text);
  const canPost = valid && text.trim().length > 0;

  // Handle mention autocomplete
  useEffect(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([a-z0-9_]*)$/i);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      
      // Calculate position for dropdown
      const textBeforeMention = textBeforeCursor.substring(0, cursorPos - mentionMatch[0].length);
      const lines = textBeforeMention.split('\n');
      const lineHeight = 24; // Approximate line height
      const top = lines.length * lineHeight + 5;
      const left = lines[lines.length - 1].length * 8; // Approximate character width
      
      setMentionPosition({ top, left });
      setShowMentionAutocomplete(true);
      setMentionSelectedIndex(0);

      // Search users
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchUsers(query, 5);
        setMentionUsers(results);
      }, 300);
    } else {
      setShowMentionAutocomplete(false);
      setMentionUsers([]);
    }
  }, [text]);

  // Handle hashtag detection (just visual feedback for now)
  useEffect(() => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const hashtagMatch = textBeforeCursor.match(/(?:^|\s)#([a-z0-9_]*)$/i);
    // Hashtag autocomplete can be added later if needed
  }, [text]);

  // Auto-focus textarea when autoFocus prop is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

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
        setErrorMessage(result.error ?? "Unable to publish reply");
        return;
      }
      setText("");
      setShowEmojiPicker(false);
      // Refresh the page to show the new reply
      router.refresh();
      // Call callback if provided
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      setErrorMessage("Something went wrong while publishing your reply");
    } finally {
      setIsPosting(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
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

  if (!session?.user) {
    return null;
  }

  const userImage = session.user.image ?? null;
  const userName = session.user.name ?? "User";

  return (
    <article className="post-card">
      <div className="post-card__body flex gap-3 p-3 relative">
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
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Post your reply"
            className="w-full resize-none border-none p-0 text-lg outline-none bg-transparent placeholder:text-gray-500 whitespace-pre-wrap"
            rows={3}
          />
          {errorMessage ? (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="flex items-center justify-center text-blue-500 hover:text-blue-600"
                title="Add image"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
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
            <div className="flex items-center gap-3 pr-4">
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
                {isPosting ? "Posting..." : "Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

