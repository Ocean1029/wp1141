"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Home() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.random() * 10, 100);
        
        if (next >= 100) {
          clearInterval(interval);
          // Keep progress at 100, then redirect after 1 second
          setTimeout(() => {
            router.replace("/game/lobby");
          }, 1000);
          return 100;
        }
        
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [router]);

  return <LoadingScreen progress={progress} />;
}
