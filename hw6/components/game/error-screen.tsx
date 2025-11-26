import React from "react";
import liff from "@line/liff";

export function ErrorScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center z-50">
      <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        請在 LINE 群組內遊玩
      </h2>
      
      <p className="text-slate-600 mb-8 leading-relaxed">
        本遊戲需要多人連線參與。
        <br />
        請回到群組點擊連結，或邀請朋友掃描 QR Code 加入。
      </p>

      <button
        onClick={() => liff.closeWindow()}
        className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-colors"
      >
        關閉視窗
      </button>
    </div>
  );
}

