"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/hooks/use-liff";
import { LoadingScreen } from "@/components/game/loading-screen";
import { ErrorScreen } from "@/components/game/error-screen";
import { LobbyScreen } from "@/components/game/lobby-screen";

export default function Home() {
  const { liff, isReady, error } = useLiff();
  const [profile, setProfile] = useState<any>(null);
  const [context, setContext] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (isReady && liff) {
      const fetchLiffData = async () => {
        try {
          // Check login status
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }

          // Get Profile & Context
          const [profileData, contextData] = await Promise.all([
            liff.getProfile(),
            liff.getContext(),
          ]);

          setProfile(profileData);
          setContext(contextData);
        } catch (err) {
          console.error("LIFF Data Fetch Error:", err);
        } finally {
          // Artificial delay for smoother UX (prevent flicker)
          setTimeout(() => {
            setIsProfileLoading(false);
          }, 1000);
        }
      };

      fetchLiffData();
    }
  }, [isReady, liff]);

  // Phase 1: Initial Loading (System init or Data fetching)
  if (!isReady || isProfileLoading) {
    return <LoadingScreen />;
  }

  // Phase 2: Error Handling (Invalid Environment)
  // In production, strict check: context?.type !== "group" && context?.type !== "room"
  // For development/testing, we might want to allow external browser (context?.type === "none")
  const isInvalidEnv = false; // Temporarily disabled for easier testing
  
  if (error || isInvalidEnv) {
    return <ErrorScreen />;
  }

  // Phase 3: Game Lobby
  return <LobbyScreen profile={profile} context={context} />;
}
