"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Check } from "lucide-react";
import { toggleFollow, checkFollowingStatus } from "@/lib/server/interactions";
import { EditProfileDialog } from "./EditProfileDialog";
import type { ProfileHeaderProps } from "@/types";

export function ProfileHeader({ user, isOwnProfile, onFollowChange }: ProfileHeaderProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followersCount);
  const [isToggling, setIsToggling] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Check initial following status and sync followersCount
  useEffect(() => {
    setFollowersCount(user.followersCount);
    if (!isOwnProfile) {
      checkFollowingStatus(user.userId).then((result) => {
        setFollowing(result.following);
      });
    }
  }, [user.userId, user.followersCount, isOwnProfile]);

  const handleFollow = async () => {
    if (isToggling) return;

    // Optimistic update
    const previousFollowing = following;
    const previousFollowersCount = followersCount;
    setFollowing(!following);
    setFollowersCount(following ? followersCount - 1 : followersCount + 1);
    setIsToggling(true);

    try {
      const result = await toggleFollow(user.userId);
      if (!result.success) {
        // Revert optimistic update on error
        setFollowing(previousFollowing);
        setFollowersCount(previousFollowersCount);
        console.error("Failed to toggle follow:", result.error);
      } else {
        // Refresh the page to update counts and following feed
        router.refresh();
        // Call callback to reload profile data
        if (onFollowChange) {
          onFollowChange();
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      setFollowing(previousFollowing);
      setFollowersCount(previousFollowersCount);
      console.error("Error toggling follow:", error);
    } finally {
      setIsToggling(false);
    }
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
          <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={`${user.name} avatar`}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-20 px-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-gray-600">@{user.userId}</p>
          </div>
          {isOwnProfile ? (
            <button
              onClick={() => setShowEditDialog(true)}
              className="rounded-full border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={isToggling}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors ${
                following
                  ? "border border-gray-300 hover:bg-gray-50"
                  : "bg-black text-white hover:bg-gray-800"
              } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
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
            <span className="font-semibold">{followersCount}</span>{" "}
            <span className="text-gray-600">Followers</span>
          </span>
        </div>
      </div>
      <EditProfileDialog
        user={user}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onUpdate={() => {
          setShowEditDialog(false);
          if (onFollowChange) {
            onFollowChange();
          }
          router.refresh();
        }}
      />
    </div>
  );
}

