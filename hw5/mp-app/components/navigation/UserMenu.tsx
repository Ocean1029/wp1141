"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import type { Session } from "next-auth";

interface UserMenuProps {
  session: Session | null;
}

export function UserMenu({ session }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  if (!session?.user) {
    return null;
  }

  const userName = session.user.name ?? "User";
  const userID = session.user.userID ?? "userid";
  const userImage = session.user.image;

  return (
    <div className="absolute bottom-4 w-[calc(16rem-2rem)]">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-100"
      >
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-300">
          {userImage ? (
            <img
              src={userImage}
              alt={`${userName} avatar`}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{userName}</p>
          <p className="text-sm text-gray-600 truncate">@{userID}</p>
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

