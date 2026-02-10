"use client";

import type { Folder } from "@/types";
import { SquaresFour, ListBullets, CheckSquare } from "@phosphor-icons/react/dist/ssr";

interface FileGridHeaderProps {
  folders: Folder[];
  currentFolder: string | null;
  viewMode: "grid" | "table";
  isSelectMode: boolean;
  selectedCount: number;
  sidebarCollapsed?: boolean;
  onSelectFolder: (folderId: string | null) => void;
  onViewModeChange: (mode: "grid" | "table") => void;
  onToggleSelectMode: () => void;
}

export default function FileGridHeader({
  folders,
  currentFolder,
  viewMode,
  isSelectMode,
  selectedCount,
  sidebarCollapsed = false,
  onSelectFolder,
  onViewModeChange,
  onToggleSelectMode,
}: FileGridHeaderProps) {
  const currentFolderData = folders.find((f) => f.id === currentFolder);
  const breadcrumbs = [];
  let current = currentFolderData;
  
  while (current) {
    breadcrumbs.unshift(current);
    current = folders.find((f) => f.id === current?.parentId);
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <div
        className={`flex items-center gap-2 text-sm transition-all duration-300 ${
          sidebarCollapsed ? "ml-12" : "ml-0"
        }`}
      >
        <button
          onClick={() => onSelectFolder(null)}
          className="text-emerald-800 hover:underline"
        >
          Root
        </button>
        {breadcrumbs.map((folder) => (
          <span key={folder.id} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <button
              onClick={() => onSelectFolder(folder.id)}
              className="text-emerald-800 hover:underline"
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white border border-gray-300 rounded p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded transition ${
              viewMode === "grid"
                ? "bg-emerald-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <SquaresFour weight="regular" className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded transition ${
              viewMode === "table"
                ? "bg-emerald-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ListBullets weight="regular" className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onToggleSelectMode}
          className={`px-3 py-1.5 rounded transition text-sm font-medium flex items-center gap-2 ${
            isSelectMode
              ? "bg-emerald-800 text-white"
              : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CheckSquare weight="regular" className="w-4 h-4" />
          {isSelectMode ? `Select (${selectedCount})` : "Select"}
        </button>
      </div>
    </div>
  );
}
