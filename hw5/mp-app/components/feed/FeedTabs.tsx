"use client";

import { useState } from "react";

export function FeedTabs() {
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");

  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "following"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Following
        </button>
      </div>
    </div>
  );
}

