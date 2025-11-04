"use client";

import { useState } from "react";
import { MessageCircle, Repeat2, Heart, Trash2 } from "lucide-react";
import type { PostCardProps } from "@/types";

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    // TODO: Implement like toggle Server Action
    setLiked(!liked);
  };

  const handleRepost = async () => {
    // TODO: Implement repost Server Action
  };

  const handleReply = () => {
    // TODO: Implement reply modal
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      // TODO: Implement delete Server Action
      console.log("Delete post:", post.id);
    }
  };

  return (
    <article className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-semibold">{post.author.name}</span>
              <span className="ml-2 text-gray-500">@{post.author.userId}</span>
              <span className="ml-2 text-gray-400">·</span>
              <span className="ml-2 text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 whitespace-pre-wrap">{post.text}</p>
          <div className="mt-3 flex items-center gap-6 text-gray-500">
            <button
              onClick={handleReply}
              className="flex items-center gap-2 hover:text-blue-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.replyCount}</span>
            </button>
            <button
              onClick={handleRepost}
              className="flex items-center gap-2 hover:text-green-600"
            >
              <Repeat2 className="h-4 w-4" />
              <span>{post.repostCount}</span>
            </button>
            <button
              onClick={handleLike}
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

