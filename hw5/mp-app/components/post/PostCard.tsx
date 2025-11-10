"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Repeat2, Heart } from "lucide-react";
import type { PostCardProps } from "@/types";

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.viewerHasLiked ?? false);
  const displayUserId = post.author.userId ? `@${post.author.userId}` : "";

  const handleLike = async () => {
    // TODO: Implement like toggle Server Action
    setLiked(!liked);
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
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center gap-2 hover:text-red-600 ${
                liked ? "text-red-600" : ""
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{post.likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

