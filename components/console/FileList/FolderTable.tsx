"use client";

import { useState } from "react";
import {
  Folder as FolderIcon,
  FolderOpen,
  Gauge,
  Flag,
  ArrowsClockwise,
  ArrowsDownUp,
  Trash,
} from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";
import type { Folder } from "@/types";
import {
  ICON_MAP,
  COLOR_MAP,
  TEXT_COLOR_MAP,
  ITEMS_PER_PAGE,
} from "./constants";
import { getRowClassName } from "./utils";
import { GRADIENT_HOVER_MAP } from "./constants";
import Tooltip from "@/components/Tooltip";
import RowActionsMenu from "../RowActionsMenu";
import Pagination from "./Pagination";

interface FolderTableProps {
  folders: Folder[];
  movedFolders: { [key: string]: string | null };
  syncingFolders: Set<string>;
  onSelectFolder: (folderId: string) => void;
  onSyncFolder: (folderId: string, folderName: string) => void;
  onMoveFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onOpenNoticePopover: (
    type: "folder",
    id: string,
    currentNotice: string,
    anchorRef: React.RefObject<HTMLElement | null>,
  ) => void;
}

export default function FolderTable({
  folders,
  movedFolders,
  syncingFolders,
  onSelectFolder,
  onSyncFolder,
  onMoveFolder,
  onDeleteFolder,
  onOpenNoticePopover,
}: FolderTableProps) {
  const [folderPage, setFolderPage] = useState(1);

  const visibleFolders = folders.filter((f) => !movedFolders[f.id]);
  const paginatedFolders = visibleFolders.slice(
    (folderPage - 1) * ITEMS_PER_PAGE,
    folderPage * ITEMS_PER_PAGE,
  );
  const folderTotalPages = Math.ceil(visibleFolders.length / ITEMS_PER_PAGE);

  if (folders.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Folders</h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FolderIcon weight="regular" className="w-4 h-4" />
                Name
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Gauge weight="regular" className="w-4 h-4" />
                Total Area
              </div>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedFolders.map((folder) => {
            const IconComponent = (ICON_MAP[folder.icon || "Folder"] ||
              FolderIcon) as React.ComponentType<{
              weight?: IconWeight;
              className?: string;
            }>;
            const colorClass =
              COLOR_MAP[folder.color || "blue"] || "bg-blue-500";
            const textColor =
              TEXT_COLOR_MAP[folder.color || "blue"] || "text-blue-700";
            const folderNoticeRef = {
              current: null,
            } as React.RefObject<HTMLButtonElement | null>;

            const folderTotals = {
              totalArea: folder.totalArea || 0,
            };

            const hasNotice = Boolean(
              folder.notice && folder.notice.trim().length > 0,
            );
            const rowClassName = getRowClassName(
              hasNotice,
              folder.color || "blue",
              GRADIENT_HOVER_MAP,
            );

            return (
              <tr
                key={folder.id}
                className={`${rowClassName} cursor-pointer`}
                onDoubleClick={() => onSelectFolder(folder.id)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded ${colorClass} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent
                        weight="regular"
                        className="w-4 h-4 text-white"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{folder.name}</p>
                      {folder.description && (
                        <p className="text-xs text-gray-500 font-mono">
                          {folder.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-gray-900">
                    {folderTotals.totalArea > 0
                      ? folderTotals.totalArea.toFixed(2)
                      : "--"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip
                      title={hasNotice ? "View Notice" : "Add Notice"}
                      description={
                        hasNotice
                          ? folder.notice || ""
                          : "Add a notice to this folder"
                      }
                      icon={<Flag weight="regular" className="w-4 h-4" />}
                    >
                      <button
                        ref={folderNoticeRef}
                        onClick={() =>
                          onOpenNoticePopover(
                            "folder",
                            folder.id,
                            folder.notice || "",
                            folderNoticeRef,
                          )
                        }
                        className={`p-1.5 rounded hover:bg-gray-100 transition ${hasNotice ? "text-orange-500" : textColor}`}
                      >
                        <Flag
                          weight={hasNotice ? "fill" : "regular"}
                          className="w-4 h-4"
                        />
                      </button>
                    </Tooltip>
                    <RowActionsMenu
                      accentColor={folder.color || "blue"}
                      actions={[
                        {
                          icon: (
                            <ArrowsClockwise
                              weight="regular"
                              className="w-4 h-4"
                            />
                          ),
                          label: "Sync Totals",
                          onClick: () => onSyncFolder(folder.id, folder.name),
                          disabled: Boolean(syncingFolders.has(folder.id)),
                        },
                        {
                          icon: (
                            <FolderOpen weight="regular" className="w-4 h-4" />
                          ),
                          label: "Open Folder",
                          onClick: () => onSelectFolder(folder.id),
                        },
                        {
                          icon: (
                            <ArrowsDownUp
                              weight="regular"
                              className="w-4 h-4"
                            />
                          ),
                          label: "Move Folder",
                          onClick: () => onMoveFolder(folder),
                        },
                        {
                          icon: <Trash weight="regular" className="w-4 h-4" />,
                          label: "Delete Folder",
                          onClick: () => onDeleteFolder(folder.id, folder.name),
                          color: "text-red-600 hover:bg-red-50",
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        currentPage={folderPage}
        totalPages={folderTotalPages}
        onPageChange={setFolderPage}
      />
    </div>
  );
}
