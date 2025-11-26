"use client";

import { useLiff } from "@/hooks/use-liff";
import { useEffect, useState } from "react";

export default function LiffCheckPage() {
  const { liff, isReady, error } = useLiff();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (liff && liff.isLoggedIn()) {
      liff
        .getProfile()
        .then((profile) => setProfile(profile))
        .catch((err) => console.error(err));
    }
  }, [liff]);

  const login = () => {
    if (!liff) return;
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  };

  const logout = () => {
    if (!liff) return;
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center border-b pb-4">LIFF Status Check</h1>

        {/* Initialization Status */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Initialization</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-gray-600">Status:</span>
            <span
              className={`font-bold ${
                isReady ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {isReady ? "Ready" : "Initializing..."}
            </span>

            <span className="text-gray-600">Error:</span>
            <span className={error ? "text-red-600" : "text-gray-400"}>
              {error ? error.message : "None"}
            </span>
          </div>
        </div>

        {/* Environment Info */}
        {isReady && liff && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Environment</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-600">OS:</span>
              <span>{liff.getOS()}</span>

              <span className="text-gray-600">Language:</span>
              <span>{liff.getLanguage()}</span>

              <span className="text-gray-600">Version:</span>
              <span>{liff.getVersion()}</span>

              <span className="text-gray-600">In Client:</span>
              <span
                className={
                  liff.isInClient() ? "text-green-600" : "text-blue-600"
                }
              >
                {liff.isInClient() ? "Yes (LINE App)" : "No (External Browser)"}
              </span>
            </div>
          </div>
        )}

        {/* Auth Status */}
        {isReady && liff && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-t pt-4">Authentication</h2>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Logged In:</span>
              <span
                className={`font-bold ${
                  liff.isLoggedIn() ? "text-green-600" : "text-gray-500"
                }`}
              >
                {liff.isLoggedIn() ? "Yes" : "No"}
              </span>
            </div>

            {liff.isLoggedIn() && profile && (
              <div className="bg-gray-100 p-4 rounded text-sm space-y-2 break-all">
                <p><strong>Name:</strong> {profile.displayName}</p>
                <p><strong>ID:</strong> {profile.userId}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {!liff.isLoggedIn() ? (
                <button
                  onClick={login}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
                >
                  Log In
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


