"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/clientConfig";
import { apiCall } from "@/lib/api/client";
import Image from "next/image";
import {
  SignOut,
  Funnel,
  CheckCircle,
  Clock,
  CalendarBlank,
  FileArrowUp,
  SortAscending,
  SortDescending,
  Gear,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

interface RibbonProps {
  filterStatus: "all" | "scanned" | "unscanned";
  onFilterChange: (status: "all" | "scanned" | "unscanned") => void;
  sortBy: "name-asc" | "name-desc" | "date" | "size";
  onSortChange: (sort: "name-asc" | "name-desc" | "date" | "size") => void;
  refreshTrigger?: number;
}

export default function Ribbon({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  refreshTrigger,
}: RibbonProps) {
  const router = useRouter();
  const [stats, setStats] = useState<{
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCost: number;
    scannedCount: number;
    averageCostPerScan: number;
    usageLimit: number;
  } | null>(null);
  const [showThresholdInput, setShowThresholdInput] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiCall("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("stats load failed:", error);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const updateUsageLimit = async (newLimit: number) => {
    try {
      const response = await apiCall("/api/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usageLimit: newLimit }),
      });

      if (response.ok) {
        setStats((prev) => (prev ? { ...prev, usageLimit: newLimit } : null));
        setShowThresholdInput(false);
      } else {
        console.error("failed to update usage limit");
      }
    } catch (error) {
      console.error("usage limit update failed:", error);
    }
  };

  const currentCostPHP = stats ? stats.totalCost * 58 : 0;
  const usageLimit = stats?.usageLimit || 1000;
  const usagePercentage = Math.min((currentCostPHP / usageLimit) * 100, 100);
  const isNearThreshold = usagePercentage >= 80;
  const isOverThreshold = usagePercentage >= 100;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-nia-automation.jpg"
              alt="NIA Automation"
              width={32}
              height={32}
              className="rounded object-cover"
            />
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                NIA Automation
              </h1>
              <p className="text-xs text-gray-500">Operations & Maintenance</p>
            </div>
          </div>

          {stats && (
            <>
              <div className="w-px h-10 bg-gray-300 mx-2" />

              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Usage Limit
                    </span>
                    <button
                      onClick={() => setShowThresholdInput(!showThresholdInput)}
                      className="p-1 rounded hover:bg-gray-100 transition"
                    >
                      <Gear
                        weight="regular"
                        className="w-3 h-3 text-gray-500"
                      />
                    </button>
                    {isOverThreshold && (
                      <Warning weight="fill" className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOverThreshold
                            ? "bg-red-500"
                            : isNearThreshold
                              ? "bg-yellow-500"
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-mono ${
                        isOverThreshold
                          ? "text-red-600"
                          : isNearThreshold
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }`}
                    >
                      {usagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    ₱
                    {currentCostPHP.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    / ₱
                    {usageLimit.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {showThresholdInput && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded shadow-lg">
                    <span className="text-xs text-gray-600">₱</span>
                    <input
                      type="number"
                      value={tempThreshold || usageLimit}
                      onChange={(e) =>
                        setTempThreshold(parseFloat(e.target.value) || 0)
                      }
                      onBlur={() => {
                        if (tempThreshold > 0) {
                          updateUsageLimit(tempThreshold);
                        } else {
                          setShowThresholdInput(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tempThreshold > 0) {
                          updateUsageLimit(tempThreshold);
                        }
                        if (e.key === "Escape") {
                          setShowThresholdInput(false);
                          setTempThreshold(0);
                        }
                      }}
                      className="w-20 text-xs font-mono outline-none"
                      autoFocus
                      onFocus={(e) => {
                        if (tempThreshold === 0) {
                          setTempThreshold(usageLimit);
                        }
                        e.target.select();
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded transition text-sm"
        >
          <SignOut weight="regular" className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function FilterDropdown({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
}: {
  filterStatus: "all" | "scanned" | "unscanned";
  onFilterChange: (status: "all" | "scanned" | "unscanned") => void;
  sortBy: "name-asc" | "name-desc" | "date" | "size";
  onSortChange: (sort: "name-asc" | "name-desc" | "date" | "size") => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
     
    </div>
  );
}
