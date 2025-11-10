"use client";

import Link from "next/link";

export type FeedTab = "all" | "following";

interface FeedTabsProps {
  activeTab: FeedTab;
}

export function FeedTabs({ activeTab }: FeedTabsProps) {
  return (
    <div className="feed__tabs sticky top-0 z-20 border-b border-gray-200 bg-white w-full">
      <div className="grid grid-cols-2">
        <div className="flex justify-center">
          <Link
            href="/home"
            className={`feed__tab px-4 py-3 text-base transition-colors ${
              activeTab === "all"
                ? "border-b-2 border-blue-500 font-bold text-black"
                : "font-normal text-gray-500 hover:bg-gray-50"
            }`}
          >
            All
          </Link>
        </div>
        <div className="flex justify-center">
          <Link
            href="/home?tab=following"
            className={`feed__tab px-4 py-3 text-base transition-colors ${
              activeTab === "following"
                ? "border-b-2 border-blue-500 font-bold text-black"
                : "font-normal text-gray-500 hover:bg-gray-50"
            }`}
          >
            Following
          </Link>
        </div>
      </div>
    </div>
  );
}

