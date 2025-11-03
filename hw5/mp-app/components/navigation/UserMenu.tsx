"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    // TODO: Implement logout logic
    router.push("/login");
  };

  return (
    <div className="absolute bottom-4 w-[calc(16rem-2rem)]">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-100"
      >
        <div className="h-10 w-10 rounded-full bg-gray-300" />
        <div className="flex-1">
          <p className="font-medium">User Name</p>
          <p className="text-sm text-gray-600">@userid</p>
        </div>
      </button>
      {showMenu && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-gray-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

