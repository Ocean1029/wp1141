"use client";

import { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import type { ProfileHeaderProps } from "@/types";

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    // TODO: Implement follow toggle Server Action
    setFollowing(!following);
  };

  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="relative h-48 bg-gray-200">
        {user.bannerUrl && (
          <img
            src={user.bannerUrl}
            alt="Banner"
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute -bottom-16 left-4">
          <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-300" />
        </div>
      </div>
      <div className="mt-20 px-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-gray-600">@{user.userId}</p>
          </div>
          {isOwnProfile ? (
            <button className="rounded-full border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50">
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium ${
                following
                  ? "border border-gray-300 hover:bg-gray-50"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {following ? (
                <>
                  <Check className="h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>
        {user.bio && <p className="mt-3">{user.bio}</p>}
        <div className="mt-3 flex gap-4 text-sm">
          <span>
            <span className="font-semibold">{user.followingCount}</span>{" "}
            <span className="text-gray-600">Following</span>
          </span>
          <span>
            <span className="font-semibold">{user.followersCount}</span>{" "}
            <span className="text-gray-600">Followers</span>
          </span>
        </div>
      </div>
    </div>
  );
}

