"use client";

import { useState } from "react";
import { PenSquare } from "lucide-react";
import { PostModal } from "../post/PostModal";

export function ComposeBar() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50"
      >
        <PenSquare className="h-5 w-5 text-gray-400" />
        <span className="text-gray-500">What&apos;s happening?</span>
      </button>
      <PostModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

