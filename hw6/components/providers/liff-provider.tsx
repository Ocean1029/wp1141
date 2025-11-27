"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define shape of LIFF object (minimal)
interface LiffObject {
  init: (config: { liffId: string }) => Promise<void>;
  id: string | null;
  getProfile: () => Promise<{ userId: string; displayName: string; pictureUrl?: string }>;
  getContext: () => { type: string; groupId?: string; roomId?: string; userId?: string } | null;
  isInClient: () => boolean;
  isLoggedIn: () => boolean;
  closeWindow: () => void;
  login: () => void;
  logout: () => void;
  getOS: () => string;
  getLanguage: () => string;
  getVersion: () => string;
}

declare global {
  interface Window {
    liff: LiffObject;
  }
}

interface LiffContextValue {
  liff: LiffObject | null;
  isReady: boolean;
  error: Error | null;
}

const LiffContext = createContext<LiffContextValue>({
  liff: null,
  isReady: false,
  error: null,
});

interface LiffProviderProps {
  children: ReactNode;
  liffId: string;
}

export function LiffProvider({ children, liffId }: LiffProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [liffObject, setLiffObject] = useState<LiffObject | null>(null);

  useEffect(() => {
    if (!liffId) {
      console.error("LIFF ID is not provided.");
      setError(new Error("LIFF ID is not provided."));
      return;
    }

    // Load LIFF SDK via CDN
    const script = document.createElement("script");
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.async = true;
    
    script.onload = () => {
      if (window.liff) {
        window.liff
          .init({ liffId })
          .then(() => {
            console.log("LIFF initialized successfully!");
            setLiffObject(window.liff);
            setIsReady(true);
          })
          .catch((err: Error) => {
            console.error("LIFF initialization failed", err);
            setError(err);
          });
      }
    };

    script.onerror = () => {
      setError(new Error("Failed to load LIFF SDK script"));
    };

    document.body.appendChild(script);

    return () => {
      // Safely remove script element if it still exists in the DOM
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [liffId]);

  return (
    <LiffContext.Provider value={{ liff: liffObject, isReady, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiffContext = () => useContext(LiffContext);
