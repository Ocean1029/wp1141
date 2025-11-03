"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { validateTextLength } from "@/lib/utils/text-parser";
import { createPost } from "@/lib/server/posts";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
}

export function PostModal({ isOpen, onClose, parentId }: PostModalProps) {
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { valid, charCount } = validateTextLength(text);
  const canPost = valid && text.trim().length > 0;

  const handlePost = async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);
    try {
      await createPost("currentUserId", text, parentId);
      setText("");
      onClose();
    } catch (error) {
      console.error("Error posting:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    if (text.trim().length > 0) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setText("");
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft
    setText("");
    setShowDiscardConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={handlePost}
            disabled={!canPost || isPosting}
            className="rounded-full bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>

        {showDiscardConfirm ? (
          <div className="p-6">
            <h3 className="mb-2 text-lg font-bold">Discard post?</h3>
            <p className="mb-6 text-gray-600">
              You have an unsaved draft. What would you like to do?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
              >
                Save Draft
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
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening?"
                className="w-full resize-none border-none p-2 text-lg outline-none"
                rows={6}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
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
          </div>
        )}
      </div>
    </div>
  );
}

