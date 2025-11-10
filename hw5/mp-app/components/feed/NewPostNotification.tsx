"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePusherChannel } from "@/lib/hooks/usePusher";

export function NewPostNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();

  const handleNewPost = useCallback(() => {
    setShowNotification(true);
  }, []);

  usePusherChannel("home-feed", {
    "post:new": handleNewPost,
  });

  const handleRefresh = () => {
    setShowNotification(false);
    router.refresh();
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-2 text-center">
      <button
        onClick={handleRefresh}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        New posts available. Click to refresh.
      </button>
    </div>
  );
}

