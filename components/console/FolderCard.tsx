"use client";

import type { Folder } from "@/types";
import type { IconWeight } from "@phosphor-icons/react";
import { FolderOpen, ArrowsDownUp, Trash, ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import Tooltip from "@/components/Tooltip";
import {
  ICON_MAP,
  COLOR_MAP,
  PILL_COLOR_MAP,
  TEXT_COLOR_MAP,
  BORDER_COLOR_MAP,
  GRADIENT_COLOR_MAP,
} from "@/lib/constants/colorMaps";

interface FolderCardProps {
  folder: Folder;
  subfolderCount: number;
  fileCount: number;
  isSelectMode: boolean;
  isSelected: boolean;
  isSyncing: boolean;
  onSelect: (folderId: string) => void;
  onOpen: (folderId: string) => void;
  onMove: (folder: Folder) => void;
  onDelete: (folderId: string, folderName: string) => void;
  onSync: (folderId: string, folderName: string) => void;
}

export default function FolderCard({
  folder,
  subfolderCount,
  fileCount,
  isSelectMode,
  isSelected,
  isSyncing,
  onSelect,
  onOpen,
  onMove,
  onDelete,
  onSync,
}: FolderCardProps) {
  const IconComponent = (ICON_MAP[folder.icon || "Folder"] ||
    ICON_MAP.Folder) as React.ComponentType<{
    weight?: IconWeight;
    className?: string;
  }>;

  const colorClass = COLOR_MAP[folder.color || "blue"] || COLOR_MAP.blue;
  const pillColors = PILL_COLOR_MAP[folder.color || "blue"] || PILL_COLOR_MAP.blue;
  const textColor = TEXT_COLOR_MAP[folder.color || "blue"] || TEXT_COLOR_MAP.blue;
  const borderColor = BORDER_COLOR_MAP[folder.color || "blue"] || BORDER_COLOR_MAP.blue;
  const gradientColor = GRADIENT_COLOR_MAP[folder.color || "blue"] || GRADIENT_COLOR_MAP.blue;

  const folderTotals = {
    totalArea: folder.totalArea || 0,
    totalIrrigatedArea: folder.totalIrrigatedArea || 0,
    totalPlantedArea: folder.totalPlantedArea || 0,
  };

  const hasTotals =
    folderTotals.totalArea > 0 ||
    folderTotals.totalIrrigatedArea > 0 ||
    folderTotals.totalPlantedArea > 0;

  return (
    <div
      onClick={() => isSelectMode && onSelect(folder.id)}
      className={`relative flex items-start gap-3 p-5 bg-white rounded-lg border border-gray-200 ${borderColor} hover:shadow-md transition text-left group overflow-hidden ${
        isSelectMode ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-emerald-800" : ""}`}
    >
      {isSelectMode && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(folder.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer flex-shrink-0 mt-1"
        />
      )}

      <div
        className={`w-14 h-14 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}
      >
        <IconComponent weight="regular" className="w-7 h-7 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colorClass} flex-shrink-0`} />
          <p className="text-sm font-medium text-gray-900 line-clamp-1">
            {folder.name}
          </p>
        </div>

        {folder.description && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2 font-mono">
            {folder.description}
          </p>
        )}

        {hasTotals && (
          <div className="flex flex-col gap-0.5 mt-2">
            {folderTotals.totalArea > 0 && (
              <span className="text-xs font-mono text-gray-600">
                Area:{" "}
                <span className="font-semibold">
                  {folderTotals.totalArea.toFixed(2)}
                </span>
              </span>
            )}
            {folderTotals.totalIrrigatedArea > 0 && (
              <span className="text-xs font-mono text-gray-600">
                Irrigated:{" "}
                <span className="font-semibold">
                  {folderTotals.totalIrrigatedArea.toFixed(2)}
                </span>
              </span>
            )}
            {folderTotals.totalPlantedArea > 0 && (
              <span className="text-xs font-mono text-gray-600">
                Planted:{" "}
                <span className="font-semibold">
                  {folderTotals.totalPlantedArea.toFixed(2)}
                </span>
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
            {subfolderCount} {subfolderCount === 1 ? "Folder" : "Folders"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
            {fileCount} {fileCount === 1 ? "File" : "Files"}
          </span>
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
        style={{
          background: `linear-gradient(to top, ${gradientColor}, transparent)`,
        }}
      />

      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Tooltip
          title="Sync"
          description="Calculate totals for files in this folder"
          icon={<ArrowsClockwise weight="regular" className="w-4 h-4" />}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSync(folder.id, folder.name);
            }}
            disabled={isSyncing}
            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor} disabled:opacity-50`}
          >
            <ArrowsClockwise
              weight="regular"
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
          </button>
        </Tooltip>

        <Tooltip
          title="Open"
          description="Browse this folder's contents"
          icon={<FolderOpen weight="regular" className="w-4 h-4" />}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen(folder.id);
            }}
            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
          >
            <FolderOpen weight="regular" className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip
          title="Move"
          description="Move this folder to another location"
          icon={<ArrowsDownUp weight="regular" className="w-4 h-4" />}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(folder);
            }}
            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
          >
            <ArrowsDownUp weight="regular" className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip
          title="Delete"
          description="Remove this folder and all its contents"
          icon={<Trash weight="regular" className="w-4 h-4" />}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder.id, folder.name);
            }}
            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
          >
            <Trash weight="regular" className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
