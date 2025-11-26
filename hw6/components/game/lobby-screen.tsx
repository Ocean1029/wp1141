import React, { useState, useEffect } from "react";
import liff from "@line/liff";

// Mock Data for development
const MOCK_PLAYERS = [
  { id: "1", name: "傑米 (我)", isHost: true, status: "ready", avatar: "https://placehold.co/100x100/png?text=J" },
  { id: "2", name: "小明", isHost: false, status: "ready", avatar: "https://placehold.co/100x100/png?text=M" },
  { id: "3", name: "小美", isHost: false, status: "waiting", avatar: "https://placehold.co/100x100/png?text=Me" },
];

interface LobbyScreenProps {
  profile: any;
  context: any;
}

export function LobbyScreen({ profile, context }: LobbyScreenProps) {
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [isHost, setIsHost] = useState(true); // TODO: Real logic based on DB
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = () => {
    if (!isHost) return;
    setIsLoading(true);
    // TODO: Call API to start game
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleShare = () => {
    if (liff.isApiAvailable("shareTargetPicker")) {
      liff.shareTargetPicker([
        {
          type: "text",
          text: "快點進來阿瓦隆房間玩！",
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-overlay filter blur-xl opacity-20 -mr-10 -mt-10"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-purple-400 overflow-hidden">
              {/* User Avatar */}
              {profile?.pictureUrl ? (
                <img src={profile.pictureUrl} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  {profile?.displayName?.[0] || "U"}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg">{profile?.displayName}</h2>
              <p className="text-xs text-slate-400">
                {context?.type === "group" ? "群組房間" : "測試房間"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">目前人數</p>
            <p className="text-2xl font-bold text-purple-400">{players.length} <span className="text-sm text-white">/ 10</span></p>
          </div>
        </div>
      </header>

      {/* Body: Player List */}
      <main className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
            玩家列表
          </h3>
          
          <button 
            onClick={handleShare}
            className="text-xs bg-white text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition"
          >
            <span>📤</span> 邀請朋友
          </button>
        </div>

        <div className="space-y-3">
          {players.map((player) => (
            <div 
              key={player.id} 
              className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border ${
                player.id === "1" ? "border-purple-200 bg-purple-50/50" : "border-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full bg-slate-200" />
                  {player.isHost && (
                    <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-yellow-900 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                      👑
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{player.name}</p>
                  {player.id === "1" && <p className="text-xs text-purple-500 font-medium">你</p>}
                </div>
              </div>
              
              <div>
                {player.status === "ready" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ready!
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                    ...
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {/* Empty Slots */}
          {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="p-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
              等待加入...
            </div>
          ))}
        </div>
      </main>

      {/* Footer: CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {isHost ? (
          <div className="space-y-2">
            <button 
              onClick={handleStartGame}
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  啟動中...
                </>
              ) : (
                "開始遊戲 (Start Game)"
              )}
            </button>
            <p className="text-center text-xs text-slate-400">等待所有朋友加入後再按開始</p>
          </div>
        ) : (
          <button className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl cursor-not-allowed">
            等待房主開始...
          </button>
        )}
      </div>
    </div>
  );
}

