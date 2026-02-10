"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/clientConfig";
import FolderBrowser from "@/components/console/FolderBrowser";
import ErrorBoundary from "@/components/ErrorBoundary";

const STORAGE_KEYS = {
  viewMode: "nia-view-mode",
};

export default function ConsolePage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(STORAGE_KEYS.viewMode) as
      | "grid"
      | "table"
      | null;
    return saved || "grid";
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const updateViewMode = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEYS.viewMode, mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(6 78 59) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(6 78 59) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10">
          <FolderBrowser
            viewMode={viewMode}
            onViewModeChange={updateViewMode}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
