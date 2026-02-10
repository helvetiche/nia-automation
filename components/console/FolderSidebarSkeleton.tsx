"use client";

import { CaretRight, CaretLeft } from "@phosphor-icons/react";

interface FolderSidebarSkeletonProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function FolderSidebarSkeleton({
  isCollapsed = false,
  onToggleCollapse,
}: FolderSidebarSkeletonProps) {
  return (
    <div className="relative flex h-screen">
      <div
        className={`bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden animate-pulse transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0" : "w-80"
        }`}
      >
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 bg-gray-200 rounded" />
              <div className="w-8 h-8 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded px-3 py-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-3 flex-1 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-gray-50">
              <div className="w-5 h-5 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ paddingLeft: "28px" }}
              >
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ paddingLeft: "44px" }}
              >
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ paddingLeft: "28px" }}
              >
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-36 bg-gray-200 rounded" />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ paddingLeft: "28px" }}
              >
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
              </div>

              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{ paddingLeft: "28px" }}
              >
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={`fixed top-24 z-10 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-all hover:shadow-md ${
            isCollapsed ? "left-2" : "left-[308px]"
          }`}
          style={{ transition: "left 300ms ease-in-out" }}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <CaretRight weight="bold" className="w-4 h-4 text-gray-600" />
          ) : (
            <CaretLeft weight="bold" className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}
    </div>
  );
}
