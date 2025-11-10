"use client";

import { useState, useRef, useEffect } from "react";
import { validateTextLength } from "@/lib/utils/text-parser";
import { createPost } from "@/lib/server/posts";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { valid, charCount } = validateTextLength(text);
  const canPost = valid && text.trim().length > 0;

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
                className="text-blue-500 hover:text-blue-600"
                title="Add image"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </button>
              <button
                className="text-blue-500 hover:text-blue-600"
                title="Add emoji"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </button>
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

