"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import liff from "@line/liff";

interface LiffContextValue {
  liff: typeof liff | null;
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

  useEffect(() => {
    console.log("Initializing LIFF...");
    
    if (!liffId) {
      console.error("LIFF ID is not provided.");
      setError(new Error("LIFF ID is not provided."));
      return;
    }

    // Avoid initializing if already initialized
    if (liff.id) {
        setIsReady(true);
        return;
    }

    liff
      .init({
        liffId: liffId,
      })
      .then(() => {
        console.log("LIFF initialized successfully!");
        setIsReady(true);
      })
      .catch((err: Error) => {
        console.error("LIFF initialization failed", err);
        setError(err);
      });
  }, [liffId]);

  return (
    <LiffContext.Provider value={{ liff: isReady ? liff : null, isReady, error }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiffContext = () => useContext(LiffContext);

