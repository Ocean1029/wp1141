"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Repeat2, Heart, Trash2 } from "lucide-react";
import { toggleLike, toggleRepost } from "@/lib/server/interactions";
import { deletePost } from "@/lib/server/posts";
import { ParsedTextDisplay } from "./ParsedTextDisplay";
import { usePusherChannel } from "@/lib/hooks/usePusher";
import type { PostCardProps } from "@/types";

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.viewerHasLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isLiking, setIsLiking] = useState(false);
  const [reposted, setReposted] = useState(post.viewerHasReposted ?? false);
  const [repostCount, setRepostCount] = useState(post.repostCount);
  const [isReposting, setIsReposting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent reposting own post
    if (post.isOwnPost) {
      return;
    }
    
    if (isReposting) return;
    
    // Optimistic update
    const previousReposted = reposted;
    const previousRepostCount = repostCount;
    setReposted(!reposted);
    setRepostCount(reposted ? repostCount - 1 : repostCount + 1);
    setIsReposting(true);

    try {
      const result = await toggleRepost(post.id);
      if (!result.success) {
        // Revert optimistic update on error
        setReposted(previousReposted);
        setRepostCount(previousRepostCount);
        console.error("Failed to toggle repost:", result.error);
      }
    } catch (error) {
      // Revert optimistic update on error
      setReposted(previousReposted);
      setRepostCount(previousRepostCount);
      console.error("Error toggling repost:", error);
    } finally {
      setIsReposting(false);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to post page with focus=reply query parameter
    router.push(`/post/${post.id}?focus=reply`);
  };

  const handleCardClick = () => {
    router.push(`/post/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author.userId) {
      router.push(`/profile/${post.author.userId}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) {
        // Refresh the page to remove the deleted post
        router.refresh();
      } else {
        console.error("Failed to delete post:", result.error);
        alert(result.error ?? "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Subscribe to Pusher events for real-time updates
  const handleLikeUpdate = useCallback((data: unknown) => {
    const eventData = data as { postId: string; likeCount: number };
    if (eventData.postId === post.id) {
      setLikeCount(eventData.likeCount);
    }
  }, [post.id]);

  const handleRepostUpdate = useCallback((data: unknown) => {
    const eventData = data as { postId: string; repostCount: number };
    if (eventData.postId === post.id) {
      setRepostCount(eventData.repostCount);
    }
  }, [post.id]);

  const handleReplyCreated = useCallback((data: unknown) => {
    const eventData = data as { postId: string; replyCount: number };
    if (eventData.postId === post.id) {
      // Update reply count without re-fetching
      // Note: We don't have a replyCount state, but we could add one if needed
    }
  }, [post.id]);

  // Subscribe to post channel for real-time updates
  usePusherChannel(`post-${post.id}`, {
    "like:updated": handleLikeUpdate,
    "repost:updated": handleRepostUpdate,
    "reply:created": handleReplyCreated,
  });

  return (
    <>
      <article
        className="post-card p-4 transition-colors hover:bg-gray-50 cursor-pointer relative"
        onClick={handleCardClick}
      >
        {post.isOwnPost && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors z-10"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <div className="post-card__body flex gap-3">
        <button
          onClick={handleAuthorClick}
          className="post-card__avatar h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-300 hover:opacity-80 transition-opacity"
          disabled={!post.author.userId}
        >
          {post.author.imageUrl ? (
            <img
              src={post.author.imageUrl}
              alt={`${post.author.name} avatar`}
              className="h-full w-full object-cover"
            />
          ) : null}
        </button>
        <div className="flex-1">
          <div className="post-card__meta flex items-start gap-2">
            <div className="post-card__meta-left">
              <button
                onClick={handleAuthorClick}
                className="post-card__author font-semibold hover:underline"
                disabled={!post.author.userId}
              >
                {post.author.name}
              </button>
              {displayUserId ? (
                <button
                  onClick={handleAuthorClick}
                  className="post-card__handle ml-2 text-gray-500 hover:underline"
                  disabled={!post.author.userId}
                >
                  {displayUserId}
                </button>
              ) : null}
              <span className="post-card__dot ml-2 text-gray-400">·</span>
              <span className="post-card__timestamp ml-2 text-gray-500">
                {post.relativeTime}
              </span>
            </div>
          </div>
          <ParsedTextDisplay text={post.text} className="mt-1 whitespace-pre-wrap" />
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
                handleRepost(e);
              }}
              disabled={isReposting || post.isOwnPost}
              className={`flex items-center gap-2 hover:text-green-600 transition-colors ${
                reposted ? "text-green-600" : ""
              } ${isReposting || post.isOwnPost ? "opacity-50 cursor-not-allowed" : ""}`}
              title={post.isOwnPost ? "Cannot repost your own post" : ""}
            >
              <Repeat2 className={`h-4 w-4 ${reposted ? "fill-current" : ""}`} />
              <span>{repostCount}</span>
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

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancelDelete();
          }
        }}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-2 text-lg font-bold">Delete post?</h3>
          <p className="mb-6 text-gray-600">
            This can't be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

