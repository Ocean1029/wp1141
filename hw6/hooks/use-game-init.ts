import { useState, useEffect } from "react";
import { useLiff } from "@/hooks/use-liff";

interface GameInitState {
  profile: any;
  context: any;
  isLoading: boolean;
  error: Error | null;
}

export function useGameInit(): GameInitState {
  const { liff, isReady, error: liffError } = useLiff();
  const [profile, setProfile] = useState<any>(null);
  const [context, setContext] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !liff) return;

    const initGameData = async () => {
      try {
        // Check login status and redirect if needed
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        // Fetch Profile & Context in parallel
        const [profileData, contextData] = await Promise.all([
          liff.getProfile().catch((e) => {
            console.warn("Failed to fetch profile", e);
            return null;
          }),
          liff.getContext(),
        ]);

        setProfile(profileData);
        setContext(contextData);
      } catch (err) {
        console.error("Game Init Error:", err);
        // We don't set error state here to allow partial loading, 
        // or handle it specific to game logic if needed.
      } 
      finally {
        // Artificial delay for smoother UX (prevent flicker)
        // Matches the original logic
        setTimeout(() => {
          setIsDataLoading(false);
        }, 200);
      }
    };

    initGameData();
  }, [isReady, liff]);

  // Combined loading state: System init OR Data fetching
  const isLoading = !isReady || isDataLoading;

  return {
    profile,
    context,
    isLoading,
    error: liffError,
  };
}

