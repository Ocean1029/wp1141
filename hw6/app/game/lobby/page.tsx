"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiffContext } from "@/components/providers/liff-provider";
import { PlayerList } from "@/components/game/lobby/player-list";
import { ActionBar } from "@/components/game/lobby/action-bar";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface Player {
  lineId: string;
  displayName: string;
  pictureUrl?: string;
  isHost: boolean;
  isReady: boolean;
}

interface GameData {
  id: string;
  status: "WAITING" | "PLAYING" | "FINISHED";
  maxPlayers: number;
  players: Player[];
  isStartable: boolean;
}

export default function LobbyPage() {
  const { liff, isReady, error: liffError } = useLiffContext();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameData | null>(null);
  const [profile, setProfile] = useState<{ userId: string; displayName: string } | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    if (isReady && liff) {
      liff.getProfile().then((p) => {
        setProfile({ userId: p.userId, displayName: p.displayName });
      }).catch(console.error);

      const context = liff.getContext();
      console.log("[Lobby] LIFF Context:", {
        type: context?.type,
        groupId: context?.groupId,
        roomId: context?.roomId,
        userId: context?.userId,
        fullContext: context,
      });
      if (context?.groupId) {
        setGroupId(context.groupId);
      } else {
        setError("請在 LINE 群組中開啟此頁面！");
      }
    }
  }, [isReady, liff]);

  // Poll Game Status
  useEffect(() => {
    if (!groupId) return;

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/game/active?groupId=${groupId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
             setGame(data);
             if (data.status === "PLAYING") {
               router.push("/game/role");
             }
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [groupId, router]);

  // Actions
  const handleCreateGame = async () => {
    if (!groupId || !profile) return;
    setLoading(true);
    try {
      const res = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineGroupId: groupId, hostUserId: profile.userId }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!game || !profile) return;
    try {
      await fetch("/api/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, userId: profile.userId }),
      });
    } catch (e) {
      alert(e);
    }
  };

  const handleToggleReady = async () => {
    if (!game || !profile) return;
    try {
      await fetch("/api/game/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, userId: profile.userId }),
      });
    } catch (e) {
      alert(e);
    }
  };

  const handleStartGame = async () => {
    if (!game || !profile) return;
    try {
      const res = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, userId: profile.userId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to start");
      }
    } catch (e) {
      alert(e);
    }
  };

  const isJoined = game?.players.some(p => p.lineId === profile?.userId) ?? false;
  const myPlayer = game?.players.find(p => p.lineId === profile?.userId);
  const isHost = myPlayer?.isHost ?? false;
  const isPlayerReady = myPlayer?.isReady ?? false;

  if (liffError) return <div className="p-4 text-red-500">LIFF Error: {liffError.message}</div>;
  if (!isReady || (!groupId && !error)) return <LoadingScreen />;
  if (error) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-4 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24">
      {/* Header */}
      <div className="bg-slate-800 p-4 shadow-lg text-center border-b border-amber-600/30 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-amber-500 tracking-widest">AVALON</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Lobby: {groupId?.slice(-4)}</p>
        {/* Debug Info */}
        <div className="text-[10px] text-slate-600 mt-1">
          GID: {groupId}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto">
        {!game ? (
          // No Game - Create Mode
          <div className="text-center mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-7xl animate-bounce">🏰</div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-amber-100">尚未建立遊戲</h2>
              <p className="text-slate-400 text-sm px-8">
                點擊下方按鈕成為房主，召集你的圓桌騎士們。
              </p>
            </div>
            <Button onClick={handleCreateGame} isLoading={loading} size="lg" className="w-full">
              👑 開啟新局 (Create Game)
            </Button>
          </div>
        ) : (
          // Game Exists - Lobby Mode
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Status Banner */}
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Players</div>
                  <div className="font-bold text-xl text-white">{game.players.length} <span className="text-slate-500 text-sm">/ {game.maxPlayers}</span></div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                game.status === "WAITING" ? "bg-green-900/50 text-green-400 border border-green-800" : "bg-blue-900 text-blue-300"
              }`}>
                {game.status}
              </div>
            </div>

            {/* Player List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Participants</h3>
              <PlayerList players={game.players} />
            </div>

            {/* Action Area */}
            <ActionBar 
              isJoined={isJoined}
              isReady={isPlayerReady}
              isHost={isHost}
              isStartable={game.isStartable}
              onJoin={handleJoinGame}
              onToggleReady={handleToggleReady}
              onStart={handleStartGame}
            />
          </div>
        )}
      </div>
    </div>
  );
}
