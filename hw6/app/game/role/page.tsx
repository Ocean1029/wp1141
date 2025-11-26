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
        const context = liff.getContext();
        
        if (!context?.groupId) {
           // Fallback for testing
           // throw new Error("請在群組中開啟");
        }
        const groupId = context?.groupId;

        // 1. Get Active Game ID
        const gameRes = await fetch(`/api/game/active?groupId=${groupId}`);
        if (!gameRes.ok) throw new Error("無法取得遊戲資訊");
        const gameData = await gameRes.json();
        
        if (!gameData || gameData.status !== "PLAYING") {
            // Redirect back to lobby if game not playing
            window.location.href = "/game/lobby";
            return;
        }

        // 2. Get Role
        const roleRes = await fetch(`/api/game/role?gameId=${gameData.id}&userId=${profile.userId}`);
        if (!roleRes.ok) throw new Error(await roleRes.text());
        const data = await roleRes.json();
        
        setRoleData(data);
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
  const cardBorder = isEvil ? "border-red-500" : "border-blue-400";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col items-center pt-10 px-4">
      <h1 className="text-xl text-amber-500 font-bold mb-6 tracking-widest">YOUR IDENTITY</h1>

      {/* Card Scene */}
      <div className="relative w-64 h-96 cursor-pointer perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`w-full h-full transition-all duration-700 transform-style-3d relative ${isFlipped ? "rotate-y-180" : ""}`}>
          
          {/* Front (Cover) */}
          <div className="absolute w-full h-full backface-hidden bg-slate-800 rounded-xl border-2 border-amber-600/50 shadow-2xl flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4">🛡️</div>
            <div className="text-amber-500 font-serif text-2xl">AVALON</div>
            <div className="mt-8 text-slate-400 text-sm animate-pulse">點擊翻開身分卡</div>
          </div>

          {/* Back (Role) */}
          <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-xl border-4 shadow-2xl flex flex-col items-center p-6 ${cardColor} ${cardBorder}`}>
             <div className="text-xs uppercase tracking-widest text-white/50 mb-4">{roleData.roleTeam} TEAM</div>
             <div className="text-4xl font-bold text-white mb-2">{roleData.roleName}</div>
             <div className="w-16 h-1 bg-white/20 mb-4 rounded-full"></div>
             <p className="text-sm text-center text-white/90 leading-relaxed">
               {roleData.roleDesc}
             </p>
             
             {/* Role Icon */}
             <div className="mt-auto text-6xl opacity-50">
                {isEvil ? "😈" : "🛡️"}
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

