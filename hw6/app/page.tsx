"use client";

import { useGameInit } from "@/hooks/use-game-init";
import { LoadingScreen } from "@/components/game/loading-screen";
import { ErrorScreen } from "@/components/game/error-screen";
import { LobbyScreen } from "@/components/game/lobby-screen";

export default function Home() {
  const { isLoading, error, profile, context } = useGameInit();

  // Phase 1: Initial Loading (System init or Data fetching)
  if (isLoading) {
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
