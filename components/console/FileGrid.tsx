"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import type { Folder, PdfFile } from "@/types";
import {
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
  FilePdf,
  Eye,
  Trash,
  ChartLineUp,
  ArrowsDownUp,
  SquaresFour,
  ListBullets,
  CheckSquare,
  DotsThree,
  ArrowsClockwise,
  CurrencyDollar,
  FileXls,
} from "@phosphor-icons/react/dist/ssr";
import type { IconWeight } from "@phosphor-icons/react";
import { apiCall } from "@/lib/api/client";
import ContextMenu from "./ContextMenu";
import DeleteFolderModal from "./DeleteFolderModal";
import MoveFolderModal from "./MoveFolderModal";
import SummaryModal from "./SummaryModal";
import SummaryViewModal from "./SummaryViewModal";
import Tooltip from "@/components/Tooltip";
import { useToast } from "@/components/ToastContainer";
import FileList from "./FileList";
import FileGridSkeleton from "./FileGridSkeleton";
import BulkMovePdfModal from "./BulkMovePdfModal";
import BulkDeleteModal from "./BulkDeleteModal";
import ReportConfigModal from "./ReportConfigModal";

interface FileGridProps {
  folders: Folder[];
  files: PdfFile[];
  currentFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onRefresh: () => void;
  onCreateFolder: () => void;
  onUploadFile: () => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  loading?: boolean;
  currentlyScanning: string | null;
  estimatedTimeRemaining: number;
  sidebarCollapsed?: boolean;
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
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
};

const PILL_COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-700" },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-700",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-700",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-700",
  },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-700" },
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-700",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-700",
  },
  pink: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-700" },
};

const TEXT_COLOR_MAP: Record<string, string> = {
  red: "text-red-700",
  orange: "text-orange-700",
  yellow: "text-yellow-700",
  emerald: "text-emerald-700",
  blue: "text-blue-700",
  indigo: "text-indigo-700",
  purple: "text-purple-700",
  pink: "text-pink-700",
};

const BORDER_COLOR_MAP: Record<string, string> = {
  red: "hover:border-red-500",
  orange: "hover:border-orange-500",
  yellow: "hover:border-yellow-500",
  emerald: "hover:border-emerald-500",
  blue: "hover:border-blue-500",
  indigo: "hover:border-indigo-500",
  purple: "hover:border-purple-500",
  pink: "hover:border-pink-500",
};

export default function FileGrid({
  folders,
  files,
  currentFolder,
  onSelectFolder,
  onRefresh,
  onCreateFolder,
  onUploadFile,
  viewMode,
  onViewModeChange,
  loading = false,
  currentlyScanning,
  estimatedTimeRemaining,
  sidebarCollapsed = false,
}: FileGridProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    folderId: string;
    folderName: string;
  } | null>(null);
  const [moveModal, setMoveModal] = useState<Folder | null>(null);
  const [deletedFolders, setDeletedFolders] = useState<string[]>([]);
  const [summaryModal, setSummaryModal] = useState<PdfFile | null>(null);
  const [summaryViewModal, setSummaryViewModal] = useState<PdfFile | null>(
    null,
  );
  const [deletedPdfs, setDeletedPdfs] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionsMenu, setBulkActionsMenu] = useState(false);
  const [bulkMoveModal, setBulkMoveModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkReportModal, setBulkReportModal] = useState(false);
  const [syncingFolders, setSyncingFolders] = useState<Set<string>>(new Set());
  const bulkMenuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!bulkMenuRef.current) return;

    if (bulkActionsMenu) {
      gsap.fromTo(
        bulkMenuRef.current,
        { opacity: 0, scale: 0.95, y: -10, pointerEvents: "none" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          pointerEvents: "auto",
          duration: 0.2,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(bulkMenuRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -10,
        pointerEvents: "none",
        duration: 0.15,
        ease: "power2.in",
      });
    }
  }, [bulkActionsMenu]);

  const currentFolderData = folders.find((f) => f.id === currentFolder);
  const subfolders = folders.filter(
    (f) => f.parentId === currentFolder && !deletedFolders.includes(f.id),
  );

  const deleteFolder = async () => {
    if (!deleteModal) return;

    setDeletedFolders([...deletedFolders, deleteModal.folderId]);

    showToast(
      "success",
      "Folder Deleted",
      `${deleteModal.folderName} has been removed`,
    );

    try {
      const response = await apiCall(
        `/api/folders?id=${deleteModal.folderId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        setDeletedFolders(
          deletedFolders.filter((id) => id !== deleteModal.folderId),
        );
        showToast(
          "error",
          "Oops, something broke",
          "Could not delete the folder. Try again?",
        );
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error("delete failed:", error);
      setDeletedFolders(
        deletedFolders.filter((id) => id !== deleteModal.folderId),
      );
      showToast(
        "error",
        "Oops, something broke",
        "Could not delete the folder. Try again?",
      );
    }
  };

  const moveFolder = async (targetFolderId: string | null) => {
    if (!moveModal) return;

    try {
      const response = await apiCall(`/api/folders?id=${moveModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: targetFolderId }),
      });

      if (response.ok) {
        showToast(
          "success",
          "Folder Moved",
          `${moveModal.name} has been moved`,
        );
        await onRefresh();
      } else {
        showToast(
          "error",
          "Oops, something broke",
          "Could not move the folder. Try again?",
        );
      }
    } catch (error) {
      console.error("move failed:", error);
      showToast(
        "error",
        "Oops, something broke",
        "Could not move the folder. Try again?",
      );
    }
  };

  const syncFolder = async (folderId: string, folderName: string) => {
    setSyncingFolders(new Set([...syncingFolders, folderId]));

    try {
      const response = await apiCall("/api/folders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });

      if (response.ok) {
        await response.json();
        showToast("success", "Folder Synced", `${folderName} totals updated`);
        await onRefresh();
      } else {
        showToast("error", "Sync failed", "Could not calculate folder totals");
      }
    } catch (error) {
      console.error("sync failed:", error);
      showToast("error", "Sync failed", "Could not calculate folder totals");
    } finally {
      setSyncingFolders(
        new Set([...syncingFolders].filter((id) => id !== folderId)),
      );
    }
  };

  const deletePdf = async (pdfId: string, pdfName: string) => {
    setDeletedPdfs([...deletedPdfs, pdfId]);
    showToast("success", "File Deleted", `${pdfName} has been removed`);

    try {
      const response = await apiCall(`/api/files?id=${pdfId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setDeletedPdfs(deletedPdfs.filter((id) => id !== pdfId));
        showToast(
          "error",
          "Oops, something broke",
          "Could not delete the file. Try again?",
        );
      } else {
        await onRefresh();
      }
    } catch (error) {
      console.error("delete pdf failed:", error);
      setDeletedPdfs(deletedPdfs.filter((id) => id !== pdfId));
      showToast(
        "error",
        "Oops, something broke",
        "Could not delete the file. Try again?",
      );
    }
  };

  const breadcrumbs = [];
  let current = currentFolderData;
  while (current) {
    breadcrumbs.unshift(current);
    current = folders.find((f) => f.id === current?.parentId);
  }

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAllItems = (ids: string[]) => {
    const newSelected = new Set(selectedItems);
    const allSelected = ids.every((id) => newSelected.has(id));

    if (allSelected) {
      ids.forEach((id) => newSelected.delete(id));
    } else {
      ids.forEach((id) => newSelected.add(id));
    }
    setSelectedItems(newSelected);
  };

  const bulkMovePdfs = async (targetFolderId: string) => {
    const selectedPdfIds = Array.from(selectedItems);
    const movePromises = selectedPdfIds.map((pdfId) =>
      apiCall("/api/files/move", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId, targetFolderId }),
      }),
    );

    try {
      const results = await Promise.all(movePromises);
      const allSuccess = results.every((r) => r.ok);

      if (allSuccess) {
        showToast(
          "success",
          "Files Moved",
          `${selectedPdfIds.length} PDF${selectedPdfIds.length !== 1 ? "s" : ""} moved successfully`,
        );
        setSelectedItems(new Set());
        setIsSelectMode(false);
        setBulkMoveModal(false);
        onRefresh();
      } else {
        showToast(
          "error",
          "Oops, something broke",
          "Could not move all files. Try again?",
        );
      }
    } catch (error) {
      console.error("bulk move failed:", error);
      showToast(
        "error",
        "Oops, something broke",
        "Could not move files. Try again?",
      );
    }
  };

  const bulkDeletePdfs = async () => {
    const selectedPdfIds = Array.from(selectedItems).filter((id) =>
      files.some((f) => f.id === id),
    );

    if (selectedPdfIds.length === 0) {
      showToast("error", "No Files Selected", "Please select PDFs to delete");
      return;
    }

    setDeletedPdfs([...deletedPdfs, ...selectedPdfIds]);
    showToast(
      "success",
      "Files Deleted",
      `${selectedPdfIds.length} PDF${selectedPdfIds.length !== 1 ? "s" : ""} removed`,
    );

    const deletePromises = selectedPdfIds.map((pdfId) =>
      apiCall(`/api/files?id=${pdfId}`, {
        method: "DELETE",
      }),
    );

    try {
      const results = await Promise.all(deletePromises);
      const allSuccess = results.every((r) => r.ok);

      if (allSuccess) {
        setSelectedItems(new Set());
        setIsSelectMode(false);
        setBulkActionsMenu(false);
        await onRefresh();
      } else {
        setDeletedPdfs(
          deletedPdfs.filter((id) => !selectedPdfIds.includes(id)),
        );
        showToast(
          "error",
          "Oops, something broke",
          "Could not delete all files. Try again?",
        );
      }
    } catch (error) {
      console.error("bulk delete failed:", error);
      setDeletedPdfs(deletedPdfs.filter((id) => !selectedPdfIds.includes(id)));
      showToast(
        "error",
        "Oops, something broke",
        "Could not delete files. Try again?",
      );
    }
  };

  const generateBulkReport = async (config: {
    title: string;
    season: string;
    year: number;
    boldKeywords: string[];
    capitalizeKeywords: string[];
  }) => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) {
      showToast(
        "error",
        "No Selection",
        "Please select files or folders to generate report",
      );
      return;
    }

    const selectedFiles = files.filter((f) => selectedIds.includes(f.id));
    const selectedFolders = folders.filter((f) => selectedIds.includes(f.id));

    let url = "/api/reports/lipa?";

    if (selectedFiles.length > 0) {
      url += `fileIds=${selectedFiles.map((f) => f.id).join(",")}`;
    } else if (selectedFolders.length > 0) {
      url += `folderIds=${selectedFolders.map((f) => f.id).join(",")}`;
    }

    url += `&title=${encodeURIComponent(config.title)}&season=${encodeURIComponent(config.season)}`;

    if (config.boldKeywords.length > 0) {
      url += `&boldKeywords=${encodeURIComponent(config.boldKeywords.join(","))}`;
    }

    if (config.capitalizeKeywords.length > 0) {
      url += `&capitalizeKeywords=${encodeURIComponent(config.capitalizeKeywords.join(","))}`;
    }

    try {
      showToast("info", "Generating Report", "Creating your Excel file...");

      const response = await apiCall(url);

      if (!response.ok) {
        throw new Error("export failed");
      }

      const contentDisposition = response.headers.get("content-disposition");
      let filename = `LIPA_Report_${Date.now()}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, "");
        }
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      showToast(
        "success",
        "Report Generated",
        "Excel report downloaded successfully",
      );
      setSelectedItems(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("report generation broken:", error);
      showToast("error", "Report Failed", "Could not generate report");
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-6 relative"
      onContextMenu={openContextMenu}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(6, 78, 59, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 78, 59, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "100px 100px",
        backgroundPosition: "0 0",
      }}
    >
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
            onClick={() => setIsSelectMode(!isSelectMode)}
            className={`px-3 py-1.5 rounded transition text-sm font-medium flex items-center gap-2 ${
              isSelectMode
                ? "bg-emerald-800 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <CheckSquare weight="regular" className="w-4 h-4" />
            {isSelectMode ? `Select (${selectedItems.size})` : "Select"}
          </button>
          {isSelectMode && selectedItems.size > 0 && (
            <div className="relative">
              <button
                onClick={() => setBulkActionsMenu(!bulkActionsMenu)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 rounded transition"
              >
                <DotsThree weight="regular" className="w-4 h-4" />
              </button>
              {bulkActionsMenu && (
                <div
                  ref={bulkMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <button
                    onClick={() => {
                      setBulkReportModal(true);
                      setBulkActionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <FileXls weight="regular" className="w-4 h-4" />
                    Create Report
                  </button>
                  <button
                    onClick={() => {
                      setBulkDeleteModal(true);
                      setBulkActionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-gray-100"
                  >
                    <Trash weight="regular" className="w-4 h-4" />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => {
                      setBulkMoveModal(true);
                      setBulkActionsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowsDownUp weight="regular" className="w-4 h-4" />
                    Move Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {viewMode === "table" ? (
        <FileList
          folders={subfolders}
          files={files}
          allFolders={folders}
          onSelectFolder={onSelectFolder}
          onRefresh={onRefresh}
          isSelectMode={isSelectMode}
          selectedPdfs={selectedItems}
          onToggleSelectPdf={(id: string) => toggleSelectItem(id)}
          onToggleSelectAllPdfs={(ids: string[]) => toggleSelectAllItems(ids)}
          loading={loading}
          currentlyScanning={currentlyScanning}
          estimatedTimeRemaining={estimatedTimeRemaining}
        />
      ) : loading ? (
        <FileGridSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {subfolders.map((folder) => {
              const IconComponent = (ICON_MAP[folder.icon || "Folder"] ||
                FolderIcon) as React.ComponentType<{
                weight?: IconWeight;
                className?: string;
              }>;
              const colorClass =
                COLOR_MAP[folder.color || "blue"] || "bg-blue-500";
              const pillColors = PILL_COLOR_MAP[folder.color || "blue"] || {
                bg: "bg-blue-100",
                text: "text-blue-700",
                border: "border-blue-700",
              };
              const textColor =
                TEXT_COLOR_MAP[folder.color || "blue"] || "text-blue-700";
              const borderColor =
                BORDER_COLOR_MAP[folder.color || "blue"] ||
                "hover:border-blue-500";

              const gradientColors: Record<string, string> = {
                red: "rgba(239, 68, 68, 0.4)",
                orange: "rgba(249, 115, 22, 0.4)",
                yellow: "rgba(234, 179, 8, 0.4)",
                emerald: "rgba(16, 185, 129, 0.4)",
                blue: "rgba(59, 130, 246, 0.4)",
                indigo: "rgba(99, 102, 241, 0.4)",
                purple: "rgba(168, 85, 247, 0.4)",
                pink: "rgba(236, 72, 153, 0.4)",
              };

              const gradientColor =
                gradientColors[folder.color || "blue"] || gradientColors.blue;

              const subfolderCount = folders.filter(
                (f) => f.parentId === folder.id,
              ).length;
              const fileCount = files.filter(
                (f) => f.folderId === folder.id,
              ).length;
              const folderTotals = {
                totalArea: folder.totalArea || 0,
                totalIrrigatedArea: folder.totalIrrigatedArea || 0,
                totalPlantedArea: folder.totalPlantedArea || 0,
              };

              return (
                <div
                  key={folder.id}
                  onClick={() => isSelectMode && toggleSelectItem(folder.id)}
                  className={`relative flex items-start gap-3 p-5 bg-white rounded-lg border border-gray-200 ${borderColor} hover:shadow-md transition text-left group overflow-hidden ${
                    isSelectMode ? "cursor-pointer" : ""
                  } ${selectedItems.has(folder.id) ? "ring-2 ring-emerald-800" : ""}`}
                >
                  {isSelectMode && (
                    <input
                      type="checkbox"
                      checked={selectedItems.has(folder.id)}
                      onChange={() => toggleSelectItem(folder.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer flex-shrink-0 mt-1"
                    />
                  )}
                  <div
                    className={`w-14 h-14 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}
                  >
                    <IconComponent
                      weight="regular"
                      className="w-7 h-7 text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${colorClass} flex-shrink-0`}
                      />
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {folder.name}
                      </p>
                    </div>
                    {folder.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 font-mono">
                        {folder.description}
                      </p>
                    )}
                    {(folderTotals.totalArea > 0 ||
                      folderTotals.totalIrrigatedArea > 0 ||
                      folderTotals.totalPlantedArea > 0) && (
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
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
                        />
                        {subfolderCount}{" "}
                        {subfolderCount === 1 ? "Folder" : "Folders"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border flex items-center gap-1.5 ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
                        />
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
                      icon={
                        <ArrowsClockwise weight="regular" className="w-4 h-4" />
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          syncFolder(folder.id, folder.name);
                        }}
                        disabled={syncingFolders.has(folder.id)}
                        className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor} disabled:opacity-50`}
                      >
                        <ArrowsClockwise
                          weight="regular"
                          className={`w-4 h-4 ${syncingFolders.has(folder.id) ? "animate-spin" : ""}`}
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
                          onSelectFolder(folder.id);
                        }}
                        className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
                      >
                        <FolderOpen weight="regular" className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <Tooltip
                      title="Move"
                      description="Move this folder to another location"
                      icon={
                        <ArrowsDownUp weight="regular" className="w-4 h-4" />
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMoveModal(folder);
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
                          setDeleteModal({
                            folderId: folder.id,
                            folderName: folder.name,
                          });
                        }}
                        className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
                      >
                        <Trash weight="regular" className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}

            {files
              .map((file) => {
                if (deletedPdfs.includes(file.id)) return null;
                const parentFolder = folders.find(
                  (f) => f.id === file.folderId,
                );
                const fileColor = parentFolder?.color || "red";
                const colorClass = COLOR_MAP[fileColor] || "bg-red-500";
                const textColor = TEXT_COLOR_MAP[fileColor] || "text-red-700";
                const borderColor =
                  BORDER_COLOR_MAP[fileColor] || "hover:border-red-500";
                const pillColors = PILL_COLOR_MAP[fileColor] || {
                  bg: "bg-red-100",
                  text: "text-red-700",
                  border: "border-red-700",
                };

                const gradientColors: Record<string, string> = {
                  red: "rgba(239, 68, 68, 0.4)",
                  orange: "rgba(249, 115, 22, 0.4)",
                  yellow: "rgba(234, 179, 8, 0.4)",
                  emerald: "rgba(16, 185, 129, 0.4)",
                  blue: "rgba(59, 130, 246, 0.4)",
                  indigo: "rgba(99, 102, 241, 0.4)",
                  purple: "rgba(168, 85, 247, 0.4)",
                  pink: "rgba(236, 72, 153, 0.4)",
                };

                const gradientColor =
                  gradientColors[fileColor] || gradientColors.red;

                const totalArea = file.totalArea || 0;
                const totalIrrigatedArea = file.totalIrrigatedArea || 0;
                const totalPlantedArea = file.totalPlantedArea || 0;

                return (
                  <div
                    key={file.id}
                    onClick={() => isSelectMode && toggleSelectItem(file.id)}
                    className={`group relative bg-white rounded-xl border-2 border-gray-200 ${borderColor} p-5 transition-all duration-200 overflow-hidden ${
                      isSelectMode ? "cursor-pointer" : ""
                    } ${selectedItems.has(file.id) ? "ring-2 ring-emerald-800" : ""}`}
                  >
                    {isSelectMode && (
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(file.id)}
                          onChange={() => toggleSelectItem(file.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer"
                        />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      style={{
                        background: `linear-gradient(to top, ${gradientColor}, transparent)`,
                      }}
                    />

                    <div className="relative flex items-start gap-3 mb-3">
                      <div
                        className={`w-14 h-14 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}
                      >
                        <FilePdf
                          weight="regular"
                          className="w-7 h-7 text-white"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-2 h-2 rounded-full ${colorClass} flex-shrink-0`}
                          />
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {file.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
                          >
                            {file.status === "scanned" ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Total Scanned
                              </>
                            ) : file.status === "summary-scanned" ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                Summary Scanned
                              </>
                            ) : (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                Unscanned
                              </>
                            )}
                          </span>
                          {file.pageCount && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
                              />
                              {file.pageCount}{" "}
                              {file.pageCount === 1 ? "Page" : "Pages"}
                            </span>
                          )}
                          {file.status === "summary-scanned" &&
                            file.summaryData && (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${colorClass}`}
                                />
                                {file.summaryData.length} Associations
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    {file.status === "scanned" &&
                      (totalArea > 0 ||
                        totalIrrigatedArea > 0 ||
                        totalPlantedArea > 0) && (
                        <div className="relative flex flex-col gap-1 mb-3">
                          {totalArea > 0 && (
                            <span className="text-xs font-mono text-gray-600">
                              Total Area:{" "}
                              <span className="font-semibold">
                                {totalArea.toFixed(2)}
                              </span>
                            </span>
                          )}
                          {totalIrrigatedArea > 0 && (
                            <span className="text-xs font-mono text-gray-600">
                              Irrigated:{" "}
                              <span className="font-semibold">
                                {totalIrrigatedArea.toFixed(2)}
                              </span>
                            </span>
                          )}
                          {totalPlantedArea > 0 && (
                            <span className="text-xs font-mono text-gray-600">
                              Planted:{" "}
                              <span className="font-semibold">
                                {totalPlantedArea.toFixed(2)}
                              </span>
                            </span>
                          )}
                        </div>
                      )}

                    {file.status === "summary-scanned" &&
                      file.summaryData &&
                      file.summaryData.length > 0 && (
                        <div className="relative mb-3">
                          <div className="text-xs font-semibold text-gray-700 mb-2">
                            Irrigation Associations ({file.summaryData.length})
                          </div>
                          <div className="space-y-1 max-h-20 overflow-y-auto">
                            {file.summaryData.slice(0, 3).map((assoc) => (
                              <div
                                key={assoc.id}
                                className="flex justify-between items-center text-xs"
                              >
                                <span className="font-mono text-gray-600 truncate flex-1 mr-2">
                                  {assoc.name}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {assoc.totalArea.toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {file.summaryData.length > 3 && (
                              <div className="text-xs text-gray-500 font-mono">
                                +{file.summaryData.length - 3} more associations
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {(file.status === "scanned" ||
                      file.status === "summary-scanned") &&
                      file.confidence !== undefined && (
                        <div className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-gray-600">
                              Confidence
                            </span>
                            <span className="text-xs font-mono font-semibold text-gray-900">
                              {file.confidence}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                file.confidence >= 80
                                  ? "bg-emerald-500"
                                  : file.confidence >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${file.confidence}%` }}
                            />
                          </div>
                        </div>
                      )}

                    {(file.status === "scanned" ||
                      file.status === "summary-scanned") &&
                      file.inputTokens &&
                      file.outputTokens &&
                      file.estimatedCost && (
                        <div className="relative mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-gray-600">
                              Usage
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                              <Lightning
                                weight="fill"
                                className="w-3 h-3 text-emerald-600 mb-1"
                              />
                              <span className="text-xs font-mono text-emerald-700 font-semibold">
                                {(file.inputTokens / 1000).toFixed(1)}K
                              </span>
                              <span className="text-xs text-emerald-600">
                                Input
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                              <ChartBar
                                weight="fill"
                                className="w-3 h-3 text-emerald-600 mb-1"
                              />
                              <span className="text-xs font-mono text-emerald-700 font-semibold">
                                {(file.outputTokens / 1000).toFixed(1)}K
                              </span>
                              <span className="text-xs text-emerald-600">
                                Output
                              </span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                              <CurrencyDollar
                                weight="fill"
                                className="w-3 h-3 text-emerald-600 mb-1"
                              />
                              <span className="text-xs font-mono text-emerald-700 font-semibold">
                                ₱{(file.estimatedCost * 58).toFixed(2)}
                              </span>
                              <span className="text-xs text-emerald-600">
                                Cost
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Tooltip
                        title="View"
                        description="Open and view extracted table data"
                        icon={<Eye weight="regular" className="w-4 h-4" />}
                      >
                        <button
                          onClick={() => {
                            if (file.status === "summary-scanned") {
                              setSummaryViewModal(file);
                            }
                          }}
                          disabled={file.status !== "summary-scanned"}
                          className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${textColor}`}
                        >
                          <Eye weight="regular" className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      {file.status === "scanned" && file.extractedData && (
                        <Tooltip
                          title="Summary"
                          description="View page-by-page breakdown of totals"
                          icon={
                            <ChartLineUp weight="regular" className="w-4 h-4" />
                          }
                        >
                          <button
                            onClick={() => setSummaryModal(file)}
                            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
                          >
                            <ChartLineUp weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip
                        title="Delete"
                        description="Remove this file permanently"
                        icon={<Trash weight="regular" className="w-4 h-4" />}
                      >
                        <button
                          onClick={() => deletePdf(file.id, file.name)}
                          className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
                        >
                          <Trash weight="regular" className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)}

            {subfolders.length === 0 && files.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FolderIcon
                  weight="regular"
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                />
                <p>This folder is empty</p>
                <p className="text-sm">
                  Create a folder or upload PDFs to get started
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRefresh={onRefresh}
          onNewFolder={onCreateFolder}
          onUploadPdf={onUploadFile}
        />
      )}

      {deleteModal && (
        <DeleteFolderModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          folderName={deleteModal.folderName}
          onConfirm={deleteFolder}
        />
      )}

      {moveModal && (
        <MoveFolderModal
          isOpen={true}
          onClose={() => setMoveModal(null)}
          folder={moveModal}
          allFolders={folders}
          onConfirm={moveFolder}
        />
      )}

      {summaryModal && (
        <SummaryModal
          isOpen={true}
          onClose={() => setSummaryModal(null)}
          file={summaryModal}
        />
      )}

      {bulkMoveModal && (
        <BulkMovePdfModal
          isOpen={true}
          onClose={() => setBulkMoveModal(false)}
          allFolders={folders}
          onConfirm={bulkMovePdfs}
          selectedCount={selectedItems.size}
        />
      )}

      {bulkReportModal && (
        <ReportConfigModal
          onClose={() => setBulkReportModal(false)}
          onConfirm={(config) => {
            generateBulkReport(config);
            setBulkReportModal(false);
          }}
        />
      )}

      {bulkDeleteModal && (
        <BulkDeleteModal
          isOpen={true}
          onClose={() => setBulkDeleteModal(false)}
          fileCount={
            Array.from(selectedItems).filter((id) =>
              files.some((f) => f.id === id),
            ).length
          }
          onConfirm={bulkDeletePdfs}
        />
      )}

      {summaryViewModal && (
        <SummaryViewModal
          isOpen={true}
          onClose={() => setSummaryViewModal(null)}
          file={summaryViewModal}
        />
      )}
    </div>
  );
}
