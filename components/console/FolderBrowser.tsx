"use client";

import { useState, useEffect, useMemo } from "react";
import type { Folder, PdfFile } from "@/types";
import Ribbon from "./Ribbon";
import FileGrid from "./FileGrid";
import FolderSidebar from "./FolderSidebar";
import FolderSidebarSkeleton from "./FolderSidebarSkeleton";
import CreateFolderModal from "./CreateFolderModal";
import UploadModal from "./UploadModal";
import UploadTemplateModal from "./UploadTemplateModal";
import { apiCall } from "@/lib/api/client";

interface FolderBrowserProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
}

const STORAGE_KEYS = {
  viewMode: "nia-view-mode",
  currentFolder: "nia-current-folder",
};

export default function FolderBrowser({
  viewMode,
  onViewModeChange,
}: FolderBrowserProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showUploadTemplate, setShowUploadTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus] = useState<"all" | "scanned" | "unscanned">("all");
  const [sortBy] = useState<"name-asc" | "name-desc" | "date" | "size">(
    "name-asc",
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [allFiles, setAllFiles] = useState<PdfFile[]>([]);
  const [currentlyScanning] = useState<string | null>(null);
  const [estimatedTimeRemaining] = useState(0);

  const loadFolders = async () => {
    try {
      const response = await apiCall("/api/folders");
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error("folder load failed:", error);
    }
  };

  const loadFiles = async (folderId: string | null) => {
    try {
      const timestamp = Date.now();
      const url = folderId
        ? `/api/files?folderId=${folderId}&t=${timestamp}`
        : `/api/files?t=${timestamp}`;
      const response = await apiCall(url);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("file load failed:", error);
    }
  };

  const loadAllFiles = async () => {
    try {
      const timestamp = Date.now();
      const response = await apiCall(`/api/files?t=${timestamp}`);
      const data = await response.json();
      setAllFiles(data.files || []);
    } catch (error) {
      console.error("all files load failed:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const savedFolder = localStorage.getItem(STORAGE_KEYS.currentFolder);

      await loadFolders();
      await loadFiles(savedFolder || null);
      await loadAllFiles();

      if (savedFolder) {
        setCurrentFolder(savedFolder);
      }

      setLoading(false);
    };
    init();
  }, []);

  const selectFolder = async (folderId: string | null) => {
    setLoading(true);
    setCurrentFolder(folderId);
    localStorage.setItem(STORAGE_KEYS.currentFolder, folderId || "");
    await loadFiles(folderId);
    setLoading(false);
  };

  const refreshData = async (force = false) => {
    setLoading(true);
    if (force) {
      setFiles([]);
      setFolders([]);
      setAllFiles([]);
    }
    await loadFolders();
    await loadFiles(currentFolder);
    await loadAllFiles();
    setRefreshTrigger((prev) => prev + 1);
    setLoading(false);
  };

  const handleUploadOptimistic = (uploadedFiles: File[]) => {
    const newFiles: PdfFile[] = uploadedFiles.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      folderId: currentFolder || "",
      status: "unscanned" as const,
      uploadedAt: Date.now(),
      storageUrl: "",
      userId: "",
    }));

    setFiles([...files, ...newFiles]);
  };

  const filteredFiles = useMemo(() => {
    let result = searchQuery ? allFiles : files;

    if (searchQuery) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((file) => file.status === filterStatus);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date":
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
        case "size":
          return (b.pageCount || 0) - (a.pageCount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [allFiles, files, searchQuery, filterStatus, sortBy]);

  const exportToExcel = async (
    templateId: string | null,
    fileIds?: string[],
  ) => {
    if (!currentFolder && !fileIds) {
      alert("Please select a folder first");
      return;
    }

    try {
      let url: string;

      if (fileIds && fileIds.length > 0) {
        url = `/api/reports/lipa?fileIds=${fileIds.join(",")}`;
      } else if (currentFolder) {
        url = templateId
          ? `/api/reports/lipa?folderId=${currentFolder}&templateId=${templateId}`
          : `/api/reports/lipa?folderId=${currentFolder}`;
      } else {
        return;
      }

      const response = await apiCall(url);

      if (!response.ok) {
        throw new Error("export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `LIPA_Report_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("export broken:", error);
      alert("export failed, try again");
    }
  };

  const handleScanComplete = (fileIds: string[]) => {
    exportToExcel(null, fileIds);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Ribbon refreshTrigger={refreshTrigger} />

      <div className="flex flex-1 overflow-hidden">
        {loading && folders.length === 0 ? (
          <FolderSidebarSkeleton />
        ) : (
          <FolderSidebar
            folders={folders}
            currentFolder={currentFolder}
            onSelectFolder={selectFolder}
            onCreateFolder={() => setShowCreateFolder(true)}
            onUploadFile={() => setShowUpload(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        <FileGrid
          folders={folders}
          files={filteredFiles}
          currentFolder={currentFolder}
          onSelectFolder={selectFolder}
          onRefresh={refreshData}
          onCreateFolder={() => setShowCreateFolder(true)}
          onUploadFile={() => setShowUpload(true)}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          loading={loading}
          currentlyScanning={currentlyScanning}
          estimatedTimeRemaining={estimatedTimeRemaining}
        />
      </div>

      {showCreateFolder && (
        <CreateFolderModal
          currentFolder={currentFolder}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={refreshData}
        />
      )}

      {showUpload && (
        <UploadModal
          currentFolder={currentFolder}
          onClose={() => setShowUpload(false)}
          onSuccess={refreshData}
          onUploadOptimistic={handleUploadOptimistic}
          onScanComplete={handleScanComplete}
        />
      )}

      {showUploadTemplate && (
        <UploadTemplateModal
          onClose={() => setShowUploadTemplate(false)}
          onSuccess={() => setShowUploadTemplate(false)}
        />
      )}
    </div>
  );
}
