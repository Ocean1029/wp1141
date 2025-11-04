"use client";

import { useState } from "react";
import type { ProfileTabsProps } from "@/types";

export function ProfileTabs({ isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");

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
      <div className="p-8 text-center text-gray-500">
        {/* TODO: Render posts or likes based on activeTab */}
        No content yet
      </div>
    </div>
  );
}

