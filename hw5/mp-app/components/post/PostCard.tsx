"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Repeat2, Heart } from "lucide-react";
import { toggleLike } from "@/lib/server/interactions";
import type { PostCardProps } from "@/types";

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.viewerHasLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const displayUserId = post.author.userId ? `@${post.author.userId}` : "";

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLiking) return;
    
    // Optimistic update
    const previousLiked = liked;
    const previousLikeCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setIsLiking(true);

    try {
      const result = await toggleLike(post.id);
      if (!result.success) {
        // Revert optimistic update on error
        setLiked(previousLiked);
        setLikeCount(previousLikeCount);
        console.error("Failed to toggle like:", result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    // TODO: Implement repost Server Action
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to post page with focus=reply query parameter
    router.push(`/post/${post.id}?focus=reply`);
  };

  const handleCardClick = () => {
    router.push(`/post/${post.id}`);
  };

  return (
    <article
      className="post-card p-4 transition-colors hover:bg-gray-50 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="post-card__body flex gap-3">
        <div className="post-card__avatar h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-300">
          {post.author.imageUrl ? (
            <img
              src={post.author.imageUrl}
              alt={`${post.author.name} avatar`}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex-1">
          <div className="post-card__meta flex items-start gap-2">
            <div className="post-card__meta-left">
              <span className="post-card__author font-semibold">{post.author.name}</span>
              {displayUserId ? (
                <span className="post-card__handle ml-2 text-gray-500">
                  {displayUserId}
                </span>
              ) : null}
              <span className="post-card__dot ml-2 text-gray-400">·</span>
              <span className="post-card__timestamp ml-2 text-gray-500">
                {post.relativeTime}
              </span>
            </div>
          </div>
          <p className="mt-1 whitespace-pre-wrap">{post.text}</p>
          {post.imageUrl && (
            <div className="mt-2">
              <img
                src={post.imageUrl}
                alt="Post image"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="post-card__actions mt-3 flex items-center gap-6 text-gray-500">
            <button
              onClick={handleReply}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.replyCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRepost();
              }}
              className="flex items-center gap-2 hover:text-green-600"
            >
              <Repeat2 className="h-4 w-4" />
              <span>{post.repostCount}</span>
            </button>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-2 hover:text-red-600 transition-colors ${
                liked ? "text-red-600" : ""
              } ${isLiking ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

