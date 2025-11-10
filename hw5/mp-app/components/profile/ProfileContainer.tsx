"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { getUserProfile } from "@/lib/server/users";
import type { User } from "@/types";

interface ProfileContainerProps {
  userId: string;
  currentUserID: string | null;
}

export function ProfileContainer({ userId, currentUserID }: ProfileContainerProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          setUser(profile);
          setIsOwnProfile(currentUserID === userId);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [userId, currentUserID]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Profile</span>
        </button>
      </div>
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : user ? (
        <>
          <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
          <ProfileTabs user={user} isOwnProfile={isOwnProfile} />
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">User not found</div>
      )}
    </div>
  );
}

