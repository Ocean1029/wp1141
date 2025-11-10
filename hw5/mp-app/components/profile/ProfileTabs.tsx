"use client";

import { useState, useEffect } from "react";
import { getUserPosts, getLikedPosts, getUserReposts } from "@/lib/server/posts";
import { PostCard } from "../post/PostCard";
import type { ProfileTabsProps } from "@/types";
import type { Post } from "@/types";

export function ProfileTabs({ user, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reposts" | "likes">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      setIsLoading(true);
      try {
        if (activeTab === "posts") {
          const userPosts = await getUserPosts(user.userId);
          setPosts(userPosts);
        } else if (activeTab === "reposts") {
          const reposts = await getUserReposts(user.userId);
          setPosts(reposts);
        } else if (isOwnProfile && activeTab === "likes") {
          const likedPosts = await getLikedPosts(user.userId);
          setPosts(likedPosts);
        }
      } catch (error) {
        console.error("Error loading content:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadContent();
  }, [activeTab, user.userId, isOwnProfile]);

  return (
    <div>
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("reposts")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "reposts"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Reposts
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("likes")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "likes"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Likes
            </button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {activeTab === "posts"
            ? "No posts yet."
            : activeTab === "reposts"
            ? "No reposts yet."
            : "No liked posts yet."}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

