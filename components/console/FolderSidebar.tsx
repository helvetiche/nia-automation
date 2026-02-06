"use client";

import { useState, useMemo } from "react";
import type { Folder } from "@/types";
import {
  CaretRight,
  CaretDown,
  Folder as FolderIcon,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image as ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera,
  FolderPlus,
  FilePlus,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";

interface FolderSidebarProps {
  folders: Folder[];
  currentFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onUploadFile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType> = {
  Folder: FolderIcon,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image: ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera,
};

const COLOR_MAP: Record<string, string> = {
  red: "text-red-600",
  orange: "text-orange-600",
  yellow: "text-yellow-600",
  emerald: "text-emerald-600",
  blue: "text-blue-600",
  indigo: "text-indigo-600",
  purple: "text-purple-600",
  pink: "text-pink-600",
};

const BG_COLOR_MAP: Record<string, string> = {
  red: "bg-red-100",
  orange: "bg-orange-100",
  yellow: "bg-yellow-100",
  emerald: "bg-emerald-100",
  blue: "bg-blue-100",
  indigo: "bg-indigo-100",
  purple: "bg-purple-100",
  pink: "bg-pink-100",
};

const TEXT_SELECTED_MAP: Record<string, string> = {
  red: "text-red-900",
  orange: "text-orange-900",
  yellow: "text-yellow-900",
  emerald: "text-emerald-900",
  blue: "text-blue-900",
  indigo: "text-indigo-900",
  purple: "text-purple-900",
  pink: "text-pink-900",
};

export default function FolderSidebar({
  folders,
  currentFolder,
  onSelectFolder,
  onCreateFolder,
  onUploadFile,
  searchQuery,
  onSearchChange,
}: FolderSidebarProps) {
  const computedExpandedFolders = useMemo(() => {
    if (!searchQuery) {
      return new Set<string>();
    }

    const foldersToExpand = new Set<string>();
    
    const findMatchingFolders = (folderId: string | null = null): void => {
      const children = folders.filter((f) => f.parentId === folderId);
      
      for (const child of children) {
        if (child.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          let current = child.parentId;
          while (current) {
            foldersToExpand.add(current);
            const parent = folders.find((f) => f.id === current);
            current = parent?.parentId || null;
          }
        }
        findMatchingFolders(child.id);
      }
    };
    
    findMatchingFolders();
    return foldersToExpand;
  }, [searchQuery, folders]);

  const [manuallyExpandedFolders, setManuallyExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const expandedFolders = useMemo(() => {
    return new Set([...computedExpandedFolders, ...manuallyExpandedFolders]);
  }, [computedExpandedFolders, manuallyExpandedFolders]);

  const toggleExpand = (folderId: string) => {
    const newExpanded = new Set(manuallyExpandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setManuallyExpandedFolders(newExpanded);
  };

  const hasMatchingDescendant = (folderId: string): boolean => {
    if (!searchQuery) return true;
    
    const children = folders.filter((f) => f.parentId === folderId);
    
    for (const child of children) {
      if (child.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      if (hasMatchingDescendant(child.id)) {
        return true;
      }
    }
    
    return false;
  };

  const getRootFolders = () => {
    const result = folders.filter((f) => !f.parentId);
    if (!searchQuery) return result;
    
    return result.filter((f) => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hasMatchingDescendant(f.id)
    );
  };

  const getChildFolders = (parentId: string) => {
    const result = folders.filter((f) => f.parentId === parentId);
    if (!searchQuery) return result;
    
    return result.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hasMatchingDescendant(f.id)
    );
  };

  const renderFolderTree = (parentId: string | null = null, depth = 0) => {
    const folderList =
      parentId === null ? getRootFolders() : getChildFolders(parentId);

    return folderList.map((folder) => {
      const children = getChildFolders(folder.id);
      const hasChildren = children.length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = currentFolder === folder.id;
      const IconComponent = (ICON_MAP[folder.icon || "Folder"] ||
        FolderIcon) as React.ComponentType<{
        weight?: IconWeight;
        className?: string;
      }>;
      const textColor = COLOR_MAP[folder.color || "blue"] || "text-blue-600";
      const bgColor = BG_COLOR_MAP[folder.color || "blue"] || "bg-blue-100";
      const textSelected =
        TEXT_SELECTED_MAP[folder.color || "blue"] || "text-blue-900";

      return (
        <div key={folder.id}>
          <div
            className={`flex items-center gap-1 px-3 py-2 rounded cursor-pointer transition ${
              isSelected
                ? `${bgColor} ${textSelected}`
                : "hover:bg-gray-100 text-gray-700"
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(folder.id);
              }
              onSelectFolder(folder.id);
            }}
          >
            {hasChildren && (
              <div className="p-0.5">
                {isExpanded ? (
                  <CaretDown weight="fill" className="w-4 h-4" />
                ) : (
                  <CaretRight weight="fill" className="w-4 h-4" />
                )}
              </div>
            )}
            {!hasChildren && <div className="w-4" />}

            <IconComponent
              weight="fill"
              className={`w-5 h-5 flex-shrink-0 ${textColor}`}
            />
            <span className="text-sm font-medium truncate">
              {folder.name}
            </span>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {renderFolderTree(folder.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Folders</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreateFolder}
              className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700 transition"
              title="New Folder"
            >
              <FolderPlus weight="regular" className="w-4 h-4" />
            </button>
            <button
              onClick={onUploadFile}
              className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700 transition"
              title="New File"
            >
              <FilePlus weight="regular" className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded px-3 py-2">
          <MagnifyingGlass weight="regular" className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="outline-none text-sm text-gray-700 bg-transparent flex-1"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          <div
            className={`flex items-center gap-2 px-3 py-2.5 rounded cursor-pointer transition ${
              currentFolder === null
                ? "bg-emerald-100 text-emerald-900"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => onSelectFolder(null)}
          >
            <House weight="fill" className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Root</span>
          </div>

          <div className="mt-2">
            {renderFolderTree()}
          </div>
        </div>
      </div>
    </div>
  );
}
