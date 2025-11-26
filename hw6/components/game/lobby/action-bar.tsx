import React from "react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  isJoined: boolean;
  isReady: boolean;
  isHost: boolean;
  isStartable: boolean;
  onJoin: () => void;
  onToggleReady: () => void;
  onStart: () => void;
}

export function ActionBar({ 
  isJoined, 
  isReady, 
  isHost, 
  isStartable, 
  onJoin, 
  onToggleReady, 
  onStart
}: ActionBarProps) {
  
  if (!isJoined) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-10">
        <div className="max-w-md mx-auto">
          <Button onClick={onJoin} size="lg" className="animate-bounce-slow">
            加入遊戲 (Join Game)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-10">
      <div className="max-w-md mx-auto">
        {isHost ? (
          // Host: Only show start game button
          <Button 
            onClick={onStart} 
            disabled={!isStartable}
            variant="primary"
            size="lg"
            className={`w-full ${isStartable ? "animate-pulse !bg-amber-600" : "!bg-slate-800 !text-slate-500"}`}
          >
            開始遊戲
          </Button>
        ) : (
          // Guest: Only show ready/unready button
          <Button 
            onClick={onToggleReady} 
            variant={isReady ? "secondary" : "primary"}
            className={`w-full ${!isReady ? "!bg-green-600 hover:!bg-green-500" : ""}`}
            size="lg"
          >
            {isReady ? "取消準備" : "我準備好了"}
          </Button>
        )}
      </div>
    </div>
  );
}

