"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PostCard } from "../post/PostCard";
import { ReplyPostCard } from "../post/ReplyPostCard";
import { getPostWithReplies } from "@/lib/server/posts";
import { usePusherChannel } from "@/lib/hooks/usePusher";
import type { Post } from "@/types";
import type { Session } from "next-auth";

interface ThreadContainerProps {
  postId: string;
  session: Session | null;
}

export function ThreadContainer({ postId, session }: ThreadContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldFocusReply, setShouldFocusReply] = useState(false);

  const loadThread = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPostWithReplies(postId);
      setPost(result.post);
      setReplies(result.replies);
    } catch (error) {
      console.error("Error loading thread:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  // Check if focus=reply query parameter is present
  useEffect(() => {
    const focusReply = searchParams.get("focus") === "reply";
    if (focusReply && !isLoading && post) {
      setShouldFocusReply(true);
      // Remove the query parameter from URL without reloading
      router.replace(`/post/${postId}`, { scroll: false });
    }
  }, [searchParams, isLoading, post, postId, router]);

  const handleReplySuccess = useCallback(() => {
    loadThread();
    setShouldFocusReply(false);
  }, [loadThread]);

  // Subscribe to Pusher events for real-time reply updates
  const handleReplyCreated = useCallback(() => {
    // Reload thread when a new reply is created
    loadThread();
  }, [loadThread]);

  usePusherChannel(`post-${postId}`, {
    "reply:created": handleReplyCreated,
  });

  return (
    <div className="thread__container min-h-screen flex flex-col">
      <div className="thread__header sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="thread__back-btn flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Post</span>
        </button>
      </div>
      <div className="flex-1 pb-32">
        {isLoading ? (
          <div className="thread__loading p-8 text-center text-gray-500">
            Loading...
          </div>
        ) : post ? (
          <>
            <PostCard post={post} />
            <div className="border-t-2 border-gray-300" />
            {replies.length > 0 && (
              <div className="thread__replies divide-y divide-gray-200">
                {replies.map((reply) => (
                  <PostCard key={reply.id} post={reply} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="thread__empty p-8 text-center text-gray-500">
            Post not found
          </div>
        )}
      </div>
      {post && (
        <div className="sticky bottom-0 z-10 bg-white border-t-2 border-gray-300">
          <ReplyPostCard
            session={session}
            parentId={postId}
            onReplySuccess={handleReplySuccess}
            autoFocus={shouldFocusReply}
          />
        </div>
      )}
    </div>
  );
}

