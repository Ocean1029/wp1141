"use client";

import { useEffect, useState } from "react";
import { useLiffContext } from "@/components/providers/liff-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface KnownInfo {
  displayName: string;
  pictureUrl: string | null;
  type: string;
}

interface RoleData {
  role: string;
  roleName: string;
  roleTeam: "GOOD" | "EVIL";
  roleDesc: string;
  knownInfo: KnownInfo[];
}

export default function RolePage() {
  const { liff, isReady, error: liffError } = useLiffContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!isReady || !liff) return;

    const init = async () => {
      try {
        const profile = await liff.getProfile();
        
        // First, try to get groupId from URL query parameter (passed from lobby page)
        const urlParams = new URLSearchParams(window.location.search);
        const urlGroupId = urlParams.get("groupId");
        
        const context = liff.getContext();
        console.log("[Role] LIFF Context:", {
          type: context?.type,
          groupId: context?.groupId,
          roomId: context?.roomId,
          urlGroupId,
        });
        
        // Priority: URL parameter > getContext().groupId
        let finalGroupId: string | null = null;
        
        if (urlGroupId) {
          const isLineGroupId = urlGroupId.startsWith("C") && urlGroupId.length === 33;
          if (isLineGroupId) {
            console.log(`[Role] Using groupId from URL: ${urlGroupId}`);
            finalGroupId = urlGroupId;
          } else {
            console.warn(`[Role] URL groupId format unclear: ${urlGroupId}`);
          }
        }
        
        if (!finalGroupId && context?.groupId) {
          const isLineGroupId = context.groupId.startsWith("C") && context.groupId.length === 33;
          if (isLineGroupId) {
            console.log(`[Role] Using groupId from getContext(): ${context.groupId}`);
            finalGroupId = context.groupId;
          } else {
            console.warn(`[Role] getContext() groupId format unclear: ${context.groupId}`);
          }
        }
        
        if (!finalGroupId) {
          // Provide helpful error message
          let errorMessage = "無法取得有效的群組 ID。\n\n";
          
          if (urlGroupId) {
            if (urlGroupId.startsWith("C") && urlGroupId.length !== 33) {
              errorMessage += `URL 參數中的 Group ID 長度不正確：${urlGroupId.length}（應為 33）。\n`;
            } else if (urlGroupId.includes("-")) {
              errorMessage += "URL 參數中的 ID 格式不正確（UUID 格式，應為 C 開頭）。\n";
            }
          }
          
          if (context?.groupId) {
            if (context.groupId.includes("-")) {
              errorMessage += "LIFF getContext() 回傳的 ID 格式不正確（UUID 格式）。\n";
            }
          }
          
          if (!urlGroupId && !context?.groupId) {
            errorMessage += "未偵測到任何 Group ID（URL 參數和 getContext() 都沒有）。\n";
            errorMessage += "請從遊戲大廳頁面開始遊戲，或確認 Bot 已加入群組。\n";
          }
          
          errorMessage += "\n請確認：\n";
          errorMessage += "1. Bot 已加入群組\n";
          errorMessage += "2. 在 LINE Official Account Manager 中啟用「允許 Bot 加入群組聊天」\n";
          errorMessage += "3. 從遊戲大廳頁面開始遊戲\n";
          
          throw new Error(errorMessage);
        }

        // 1. Get Active Game ID
        const gameRes = await fetch(`/api/game/active?groupId=${finalGroupId}`);
        if (!gameRes.ok) throw new Error("無法取得遊戲資訊");
        const gameData = await gameRes.json();
        
        if (!gameData || gameData.status !== "PLAYING") {
            // Redirect back to lobby if game not playing, preserve groupId
            window.location.href = `/game/lobby?groupId=${encodeURIComponent(finalGroupId)}`;
            return;
        }

        // 2. Get Role
        const roleRes = await fetch(`/api/game/role?gameId=${gameData.id}&userId=${profile.userId}`);
        if (!roleRes.ok) throw new Error(await roleRes.text());
        const data = await roleRes.json();
        
        setRoleData(data);

        // 3. Send game info messages to group (only once per player)
        // Use sessionStorage to track if we've already sent messages
        const hasSentMessages = sessionStorage.getItem(`gameInfoSent_${gameData.id}`);
        if (!hasSentMessages && finalGroupId) {
          try {
            await fetch("/api/game/send-game-info", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                gameId: gameData.id,
                groupId: finalGroupId,
              }),
            });
            sessionStorage.setItem(`gameInfoSent_${gameData.id}`, "true");
          } catch (e) {
            console.error("Failed to send game info messages:", e);
            // Don't throw error, just log it
          }
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isReady, liff]);

  if (liffError) return <div className="text-red-500 p-4">LIFF Error: {liffError.message}</div>;
  if (loading) return <LoadingScreen />;
  if (error) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-4 text-center">{error}</div>;
  if (!roleData) return null;

  const isEvil = roleData.roleTeam === "EVIL";
  const cardColor = isEvil ? "bg-red-900" : "bg-blue-900";
  const cardBorder = "border-amber-500";
  
  // Map role to image path
  const getRoleImage = (role: string): string => {
    const roleImageMap: Record<string, string> = {
      MERLIN: "/Images/Roles/Merlin.jpg",
      PERCIVAL: "/Images/Roles/Percival.jpg",
      SERVANT: "/Images/Roles/Servant.jpg",
      MORGANA: "/Images/Roles/Morgana.jpg",
      ASSASSIN: "/Images/Roles/Assassin.jpg",
      MINION: "/Images/Roles/Servant.jpg", // Fallback to Servant if no specific image
      OBERON: "/Images/Roles/Servant.jpg", // Fallback
      MORDRED: "/Images/Roles/Servant.jpg", // Fallback
    };
    return roleImageMap[role] || "/Images/Roles/Servant.jpg";
  };
  
  const roleImageUrl = getRoleImage(roleData.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col items-center justify-center px-4 py-10">
      {/* Card Scene */}
      <div className="relative w-80 h-[32rem] cursor-pointer perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`w-full h-full transition-all duration-700 transform-style-3d relative ${isFlipped ? "rotate-y-180" : ""}`}>
          
          {/* Front (Cover) */}
          <div className="absolute w-full h-full backface-hidden bg-slate-800 rounded-xl border border-amber-500 shadow-2xl flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4">🛡️</div>
            <div className="text-amber-500 font-serif text-2xl">AVALON</div>
            <div className="mt-8 text-slate-400 text-sm animate-pulse">點擊翻開身分卡</div>
          </div>

          {/* Back (Role) */}
          <div 
            className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-xl border shadow-2xl flex flex-col ${cardBorder} relative overflow-hidden ${cardColor}`}
          >
             {/* Content */}
             <div className="flex flex-col items-center h-full w-full p-4">
               {/* Top: Role Name */}
               <div className="w-full text-center mb-2">
                 <div className="text-[8px] uppercase tracking-widest text-white/70 mb-0.5 font-semibold">{roleData.roleTeam} TEAM</div>
                 <div className="text-xl font-bold text-white drop-shadow-lg">{roleData.roleName}</div>
               </div>
               
               {/* Middle: Role Image */}
               <div className="flex-1 w-full mb-2 flex items-center justify-center overflow-hidden rounded-lg min-h-0">
                 <img 
                   src={roleImageUrl} 
                   alt={roleData.roleName}
                   className="w-full h-full object-cover rounded-lg"
                   onError={(e) => {
                     // Fallback if image fails to load
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                   }}
                 />
               </div>
               
               {/* Bottom: Role Description */}
               <div className="w-full">
                 <p className="text-sm text-center text-white/90 leading-relaxed px-1">
                   {roleData.roleDesc}
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Known Info Section (Only visible when flipped) */}
      <div className={`mt-8 w-full max-w-md transition-opacity duration-500 ${isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {roleData.knownInfo.length > 0 ? (
           <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
             <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase">Known Information</h3>
             <div className="space-y-3">
                {roleData.knownInfo.map((info, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-800 p-2 rounded">
                        {info.pictureUrl ? (
                            <img src={info.pictureUrl} className="w-8 h-8 rounded-full" alt="" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs">?</div>
                        )}
                        <div className="flex-1 text-sm font-medium">{info.displayName}</div>
                        <div className="text-xs px-2 py-1 bg-slate-700 rounded text-amber-400">{info.type}</div>
                    </div>
                ))}
             </div>
           </div>
        ) : (
           <div className="text-center text-slate-500 text-sm italic">
             你沒有任何特殊資訊，請小心觀察...
           </div>
        )}
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

