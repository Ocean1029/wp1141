import React from "react";
import { Avatar } from "@/components/ui/avatar";

interface Player {
  lineId: string;
  displayName: string;
  pictureUrl?: string;
  isHost: boolean;
  isReady: boolean;
}

interface PlayerListProps {
  players: Player[];
  maxPlayers: number;
}

export function PlayerList({ players, maxPlayers }: PlayerListProps) {
  const emptySlotsCount = Math.max(0, maxPlayers - players.length);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {players.map((player) => (
        <div 
          key={player.lineId} 
          className={`relative bg-slate-800 p-3 rounded-lg border transition-all ${
            player.isReady 
              ? "border-green-500 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
              : "border-slate-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={player.pictureUrl} alt={player.displayName} />
              {player.isHost && (
                <span className="absolute -top-2 -right-2 text-sm drop-shadow-md">👑</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-slate-200">{player.displayName}</div>
              <div className={`text-xs ${player.isReady ? "text-green-400 font-bold" : "text-slate-500"}`}>
                {player.isReady ? "Ready" : "Waiting..."}
              </div>
            </div>
          </div>
          
          {player.isReady && (
            <div className="absolute top-2 right-2 text-green-500 animate-in zoom-in duration-200">
              ✓
            </div>
          )}
        </div>
      ))}
      
      {/* Empty Slots - Show slots up to maxPlayers */}
      {Array.from({ length: emptySlotsCount }).map((_, i) => (
        <div key={`empty-${i}`} className="border border-dashed border-slate-700 rounded-lg p-3 flex items-center justify-center min-h-[66px]">
          <span className="text-slate-600 text-xs">Empty Slot</span>
        </div>
      ))}
    </div>
  );
}

