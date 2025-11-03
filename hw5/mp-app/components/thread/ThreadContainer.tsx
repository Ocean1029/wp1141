"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PostCard } from "../post/PostCard";

interface Post {
  id: string;
  author: {
    userId: string;
    name: string;
    imageUrl?: string;
  };
  text: string;
  createdAt: Date;
  replyCount: number;
  repostCount: number;
  likeCount: number;
}

export function ThreadContainer({ postId }: { postId: Promise<{ id: string }> }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);

  useEffect(() => {
    async function loadThread() {
      await postId; // Resolve the promise
      // TODO: Fetch post and replies from Server Action
    }
    loadThread();
  }, [postId]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Post</span>
        </button>
      </div>
      {post && (
        <>
          <PostCard post={post} />
          <div className="divide-y divide-gray-200">
            {replies.map((reply) => (
              <PostCard key={reply.id} post={reply} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

