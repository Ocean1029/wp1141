"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useLiffContext } from "@/components/providers/liff-provider";
import { LoadingScreen } from "@/components/ui/loading-screen";

function MissionPageContent() {
  const { liff, isReady, error: liffError } = useLiffContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState<number | null>(null);
  const [playerRole, setPlayerRole] = useState<{ role: string; team: "GOOD" | "EVIL" } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isReady || !liff) return;

    const init = async () => {
      try {
        const gameIdParam = searchParams.get("gameId");
        const roundNumberParam = searchParams.get("roundNumber");
        
        if (!gameIdParam || !roundNumberParam) {
          throw new Error("缺少必要參數");
        }

        setGameId(gameIdParam);
        setRoundNumber(parseInt(roundNumberParam, 10));

        const profile = await liff.getProfile();
        
        // Check if user has access to mission page (is in the approved team)
        const accessRes = await fetch(`/api/game/check-mission-access?gameId=${gameIdParam}&roundNumber=${roundNumberParam}&userId=${profile.userId}`);
        if (!accessRes.ok) throw new Error("無法驗證訪問權限");
        const accessData = await accessRes.json();
        
        if (!accessData.hasAccess) {
          throw new Error(accessData.error || "你不是本輪任務的出隊成員");
        }
        
        // Get player role info
        const roleRes = await fetch(`/api/game/role?gameId=${gameIdParam}&userId=${profile.userId}`);
        if (!roleRes.ok) throw new Error("無法取得角色資訊");
        const roleData = await roleRes.json();
        
        setPlayerRole({
          role: roleData.role,
          team: roleData.roleTeam,
        });
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isReady, liff, searchParams]);

  const handleSubmit = async (result: "SUCCESS" | "FAIL") => {
    if (!gameId || !roundNumber || submitting) return;

    // Check if good team player is trying to submit FAIL
    if (playerRole?.team === "GOOD" && result === "FAIL") {
      alert("好人陣營不能選擇失敗！");
      return;
    }

    setSubmitting(true);
    try {
      const profile = await liff?.getProfile();
      if (!profile) throw new Error("無法取得使用者資訊");

      const res = await fetch("/api/game/mission-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          roundNumber,
          userId: profile.userId,
          result,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "提交失敗");
      }

      alert("任務結果已提交！");
      // Close LIFF window
      if (liff?.isInClient()) {
        liff.closeWindow();
      } else {
        router.push("/game/lobby");
      }
    } catch (e) {
      alert(`提交失敗: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (liffError) return <div className="text-red-500 p-4">LIFF Error: {liffError.message}</div>;
  if (loading) return <LoadingScreen />;
  if (error) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white p-4 text-center">{error}</div>;
  if (!playerRole || !roundNumber) return null;

  const isGoodTeam = playerRole.team === "GOOD";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl text-amber-500 font-bold mb-6 text-center tracking-widest">
          第 {roundNumber} 輪任務
        </h1>

        <div className="bg-slate-800 rounded-xl border border-amber-500 p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-sm text-slate-400 mb-2">你的陣營</div>
            <div className={`text-xl font-bold ${isGoodTeam ? "text-blue-400" : "text-red-400"}`}>
              {isGoodTeam ? "🔵 好人陣營" : "🔴 壞人陣營"}
            </div>
          </div>
          
          <div className="text-sm text-slate-300 text-center mt-4">
            {isGoodTeam 
              ? "請選擇任務結果（好人只能選擇成功）"
              : "請選擇任務結果"}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSubmit("SUCCESS")}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            ✅ 成功 (SUCCESS)
          </button>

          <button
            onClick={() => handleSubmit("FAIL")}
            disabled={submitting || isGoodTeam}
            className={`w-full font-bold py-4 px-6 rounded-lg text-lg transition-colors ${
              isGoodTeam
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:opacity-50 text-white"
            }`}
            title={isGoodTeam ? "好人陣營不能選擇失敗" : ""}
          >
            ❌ 失敗 (FAIL)
          </button>
        </div>

        {isGoodTeam && (
          <div className="mt-4 text-sm text-slate-500 text-center">
            好人陣營的玩家只能選擇成功
          </div>
        )}
      </div>
    </div>
  );
}

export default function MissionPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MissionPageContent />
    </Suspense>
  );
}

