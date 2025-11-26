"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiffContext } from "@/components/providers/liff-provider";
import { PlayerList } from "@/components/game/lobby/player-list";
import { ActionBar } from "@/components/game/lobby/action-bar";
import { RoleEditorModal } from "@/components/game/lobby/role-editor-modal";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Role } from "@prisma/client";

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
  activeRoles?: string[];
}

export default function LobbyPage() {
  const { liff, isReady, error: liffError } = useLiffContext();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameData | null>(null);
  const [profile, setProfile] = useState<{ userId: string; displayName: string } | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRoleEditorOpen, setIsRoleEditorOpen] = useState(false);

  // Initialize
  useEffect(() => {
    if (isReady && liff) {
      liff.getProfile().then((p) => {
        setProfile({ userId: p.userId, displayName: p.displayName });
      }).catch(console.error);

      // First, try to get groupId from URL query parameter (passed from Flex Message)
      const urlParams = new URLSearchParams(window.location.search);
      const urlGroupId = urlParams.get("groupId");
      
      // Log full URL for debugging
      console.log(`[Lobby] Full URL: ${window.location.href}`);
      console.log(`[Lobby] URL search params: ${window.location.search}`);
      console.log(`[Lobby] URL groupId parameter: ${urlGroupId}`);

      const context = liff.getContext();
      console.log("[Lobby] LIFF Context:", {
        type: context?.type,
        groupId: context?.groupId,
        roomId: context?.roomId,
        userId: context?.userId,
        fullContext: context,
      });
      
      // Priority: URL parameter > getContext().groupId
      // URL parameter is more reliable as it comes from webhook event (which has correct Group ID)
      let finalGroupId: string | null = null;
      
      if (urlGroupId) {
        const isLineGroupId = urlGroupId.startsWith("C") && urlGroupId.length === 33;
        const isUUID = urlGroupId.includes("-") && urlGroupId.length === 36;
        
        console.log(`[Lobby] URL groupId: ${urlGroupId}, length=${urlGroupId.length}, startsWithC=${urlGroupId.startsWith("C")}, isUUID=${isUUID}`);
        
        if (isLineGroupId) {
          console.log(`[Lobby] Using groupId from URL parameter: ${urlGroupId}`);
          finalGroupId = urlGroupId;
        } else if (isUUID) {
          console.warn(`[Lobby] URL parameter contains UUID format, will try getContext() instead`);
        } else {
          console.warn(`[Lobby] URL parameter format unclear, will try getContext() instead`);
        }
      }
      
      // Fallback to getContext() if URL parameter is not available or invalid
      if (!finalGroupId && context?.groupId) {
        const receivedGroupId = context.groupId;
        const isLineGroupId = receivedGroupId.startsWith("C") && receivedGroupId.length === 33;
        const isUUID = receivedGroupId.includes("-") && receivedGroupId.length === 36;
        
        console.log(`[Lobby] getContext() groupId: ${receivedGroupId}, length=${receivedGroupId.length}, startsWithC=${receivedGroupId.startsWith("C")}, isUUID=${isUUID}`);
        
        if (isUUID) {
          console.error(`[Lobby] ERROR: getContext() returned UUID instead of LINE Group ID!`);
          console.error(`[Lobby] This indicates a LIFF configuration issue. Please check LINE Official Account Manager settings.`);
          setError("錯誤：無法取得有效的群組 ID。請確認 Bot 已加入群組，並在 LINE Official Account Manager 中啟用「允許 Bot 加入群組聊天」功能。");
          return;
        }
        
        if (isLineGroupId) {
          console.log(`[Lobby] Using groupId from getContext(): ${receivedGroupId}`);
          finalGroupId = receivedGroupId;
        } else {
          console.warn(`[Lobby] getContext() groupId format unclear: ${receivedGroupId}`);
        }
      }
      
      if (finalGroupId) {
        console.log(`[Lobby] Successfully set groupId: ${finalGroupId}`);
        setGroupId(finalGroupId);
      } else if (context?.roomId) {
        console.warn(`[Lobby] Room ID detected instead of Group ID: ${context.roomId}. Games only work in Groups.`);
        setError("請在 LINE 群組中開啟此頁面！（目前偵測到的是聊天室，不是群組）");
      } else {
        console.error(`[Lobby] No valid groupId found.`);
        console.error(`[Lobby] Debug info:`, {
          urlGroupId,
          urlGroupIdLength: urlGroupId?.length,
          urlGroupIdStartsWithC: urlGroupId?.startsWith("C"),
          urlGroupIdType: urlGroupId ? (urlGroupId.startsWith("C") && urlGroupId.length === 33 ? "LINE_GROUP_ID" : urlGroupId.includes("-") && urlGroupId.length === 36 ? "UUID" : "UNKNOWN") : "NONE",
          contextGroupId: context?.groupId,
          contextGroupIdLength: context?.groupId?.length,
          contextGroupIdStartsWithC: context?.groupId?.startsWith("C"),
          contextGroupIdType: context?.groupId ? (context.groupId.startsWith("C") && context.groupId.length === 33 ? "LINE_GROUP_ID" : context.groupId.includes("-") && context.groupId.length === 36 ? "UUID" : "UNKNOWN") : "NONE",
          contextType: context?.type,
          contextRoomId: context?.roomId,
          fullUrl: window.location.href,
          searchParams: window.location.search,
        });
        
        // Provide more helpful error message based on what we found
        let errorMessage = "無法取得有效的群組 ID。\n\n";
        
        if (urlGroupId) {
          if (urlGroupId.startsWith("C") && urlGroupId.length !== 33) {
            errorMessage += `URL 參數中的 Group ID 長度不正確：${urlGroupId.length}（應為 33）。\n`;
          } else if (urlGroupId.includes("-")) {
            errorMessage += "URL 參數中的 ID 格式不正確（UUID 格式，應為 C 開頭）。\n";
          } else if (!urlGroupId.startsWith("C")) {
            errorMessage += `URL 參數中的 ID 格式不正確：${urlGroupId.substring(0, 20)}...（應為 C 開頭）。\n`;
          }
        }
        
        if (context?.groupId) {
          if (context.groupId.includes("-")) {
            errorMessage += "LIFF getContext() 回傳的 ID 格式不正確（UUID 格式）。\n";
          } else if (!context.groupId.startsWith("C")) {
            errorMessage += `LIFF getContext() 回傳的 ID 格式不正確：${context.groupId.substring(0, 20)}...（應為 C 開頭）。\n`;
          }
        }
        
        if (context?.type === "none" || !context?.type) {
          errorMessage += "LIFF Context type 為 'none'，表示可能不在群組環境中。\n";
        }
        
        if (!urlGroupId && !context?.groupId) {
          errorMessage += "未偵測到任何 Group ID（URL 參數和 getContext() 都沒有）。\n";
        }
        
        errorMessage += "\n請確認：\n";
        errorMessage += "1. Bot 已加入群組\n";
        errorMessage += "2. 在 LINE Official Account Manager 中啟用「允許 Bot 加入群組聊天」\n";
        errorMessage += "3. 從群組中的 Flex Message 點擊「開始遊戲」按鈕（不要直接開啟 LIFF URL）\n";
        errorMessage += "4. 檢查瀏覽器 Console 的詳細 Log";
        
        setError(errorMessage);
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
             // If game is closed/aborted, clear game state
             if (data.status === "ABORTED" || data.status === "FINISHED") {
               setGame(null);
               return;
             }
             setGame(data);
             if (data.status === "PLAYING") {
               router.push("/game/role");
             }
          } else {
            // No active game found
            setGame(null);
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

  const handleCloseGame = async () => {
    if (!game || !profile) return;
    
    // Confirm before closing
    if (!confirm("確定要關閉房間嗎？所有玩家將被移除，遊戲將無法繼續。")) {
      return;
    }
    
    try {
      const res = await fetch("/api/game/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id, userId: profile.userId }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to close game");
        return;
      }
      
      // Game closed successfully, clear game state
      setGame(null);
      alert("房間已關閉");
    } catch (e) {
      alert(`關閉房間時發生錯誤: ${e}`);
    }
  };

  const handleUpdateMaxPlayers = async (newMaxPlayers: number) => {
    if (!game || !profile) return;
    
    // Validate range
    if (newMaxPlayers < 2 || newMaxPlayers > 10) {
      alert("房間人數必須在 2-10 人之間");
      return;
    }
    
    // Cannot set less than current players
    if (newMaxPlayers < game.players.length) {
      alert(`無法設定為 ${newMaxPlayers} 人，目前已有 ${game.players.length} 位玩家`);
      return;
    }
    
    try {
      const res = await fetch("/api/game/update-max-players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          gameId: game.id, 
          userId: profile.userId,
          maxPlayers: newMaxPlayers 
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update max players");
        return;
      }
      
      // Update local state
      setGame({ ...game, maxPlayers: newMaxPlayers });
    } catch (e) {
      alert(`更新房間人數時發生錯誤: ${e}`);
    }
  };

  const handleSaveRoles = async (roles: Role[]) => {
    if (!game || !profile) return;
    
    try {
      const res = await fetch("/api/game/update-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          gameId: game.id, 
          userId: profile.userId,
          activeRoles: roles 
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update roles");
      }
      
      // Update local state
      setGame({ ...game, activeRoles: roles });
    } catch (e) {
      throw e; // Re-throw to let modal handle the error
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
      <div className="bg-slate-800 p-4 shadow-lg text-center border-b border-amber-600/30 sticky top-0 z-10 relative">
        {/* Close button - only visible for host when game exists */}
        {game && isHost && (
          <button
            onClick={handleCloseGame}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
            title="關閉房間"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold text-amber-500 tracking-widest">AVALON</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">Lobby: {groupId?.slice(-4)}</p>
        
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto">
        {!game ? (
          // No Game - Create Mode
          <div className="text-center mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-7xl">🏰</div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-amber-100">尚未建立遊戲</h2>
              <p className="text-slate-400 text-sm px-8">
                點擊下方按鈕成為房主，召集你的圓桌騎士們。
              </p>
            </div>
            <Button onClick={handleCreateGame} isLoading={loading} size="lg" className="w-full">
              開啟新局
            </Button>
          </div>
        ) : (
          // Game Exists - Lobby Mode
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Status Banner */}
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">👥</span>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Players</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl text-white">{game.players.length}</span>
                    <span className="text-slate-500 text-sm">/</span>
                    {isHost ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateMaxPlayers(game.maxPlayers - 1)}
                          disabled={game.maxPlayers <= 2 || game.players.length > (game.maxPlayers - 1)}
                          className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-slate-700/50"
                          title="減少人數"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="font-bold text-xl text-white min-w-[1.5rem] text-center">{game.maxPlayers}</span>
                        <button
                          onClick={() => handleUpdateMaxPlayers(game.maxPlayers + 1)}
                          disabled={game.maxPlayers >= 10}
                          className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 rounded hover:bg-slate-700/50"
                          title="增加人數"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-xl text-white">{game.maxPlayers}</span>
                    )}
                  </div>
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
              <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Participants</h3>
                {isHost && (
                  <button
                    onClick={() => setIsRoleEditorOpen(true)}
                    className="text-xs text-amber-500 hover:text-amber-400 transition-colors px-2 py-1 rounded hover:bg-slate-700/50"
                  >
                    編輯角色
                  </button>
                )}
              </div>
              <PlayerList players={game.players} maxPlayers={game.maxPlayers} />
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

      {/* Role Editor Modal */}
      {game && (
        <RoleEditorModal
          isOpen={isRoleEditorOpen}
          onClose={() => setIsRoleEditorOpen(false)}
          currentRoles={(game.activeRoles || []) as Role[]}
          maxPlayers={game.maxPlayers}
          onSave={handleSaveRoles}
        />
      )}
    </div>
  );
}
