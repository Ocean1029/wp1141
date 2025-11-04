"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import type { User } from "@/types";

export function ProfileContainer({ userId }: { userId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      // TODO: Fetch profile from Server Action using userId
    }
    loadProfile();
  }, [userId]);

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
      {user && (
        <>
          <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
          <ProfileTabs user={user} isOwnProfile={isOwnProfile} />
        </>
      )}
    </div>
  );
}

