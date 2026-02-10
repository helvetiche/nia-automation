import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";
import type { Folder, PdfFile } from "@/types";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants/appConfig";

interface UseFileGridActionsProps {
  deletedFolders: string[];
  setDeletedFolders: (folders: string[]) => void;
  deletedPdfs: string[];
  setDeletedPdfs: (pdfs: string[]) => void;
  syncingFolders: Set<string>;
  setSyncingFolders: (folders: Set<string>) => void;
  selectedItems: Set<string>;
  setSelectedItems: (items: Set<string>) => void;
  setIsSelectMode: (mode: boolean) => void;
  setBulkActionsMenu: (open: boolean) => void;
  onRefresh: () => void;
}

export const useFileGridActions = ({
  deletedFolders,
  setDeletedFolders,
  deletedPdfs,
  setDeletedPdfs,
  syncingFolders,
  setSyncingFolders,
  selectedItems,
  setSelectedItems,
  setIsSelectMode,
  setBulkActionsMenu,
  onRefresh,
}: UseFileGridActionsProps) => {
  const { showToast } = useToast();

  const deleteFolder = async (folderId: string, folderName: string) => {
    setDeletedFolders([...deletedFolders, folderId]);
    showToast("success", SUCCESS_MESSAGES.FOLDER_DELETED, `${folderName} has been removed`);

    try {
      const response = await apiCall(`/api/folders?id=${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setDeletedFolders(deletedFolders.filter((id) => id !== folderId));
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.DELETE_FAILED);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error("delete failed:", error);
      setDeletedFolders(deletedFolders.filter((id) => id !== folderId));
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.DELETE_FAILED);
    }
  };

  const moveFolder = async (folder: Folder, targetFolderId: string | null) => {
    try {
      const response = await apiCall(`/api/folders?id=${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: targetFolderId }),
      });

      if (response.ok) {
        showToast("success", SUCCESS_MESSAGES.FOLDER_MOVED, `${folder.name} has been moved`);
        onRefresh();
      } else {
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.MOVE_FAILED);
      }
    } catch (error) {
      console.error("move failed:", error);
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.MOVE_FAILED);
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
        showToast("success", SUCCESS_MESSAGES.FOLDER_SYNCED, `${folderName} totals updated`);
        onRefresh();
      } else {
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.SYNC_FAILED);
      }
    } catch (error) {
      console.error("sync failed:", error);
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.SYNC_FAILED);
    } finally {
      setSyncingFolders(new Set([...syncingFolders].filter((id) => id !== folderId)));
    }
  };

  const deletePdf = async (pdfId: string, pdfName: string) => {
    setDeletedPdfs([...deletedPdfs, pdfId]);
    showToast("success", SUCCESS_MESSAGES.FILE_DELETED, `${pdfName} has been removed`);

    try {
      const response = await apiCall(`/api/files?id=${pdfId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setDeletedPdfs(deletedPdfs.filter((id) => id !== pdfId));
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.DELETE_FAILED);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error("delete pdf failed:", error);
      setDeletedPdfs(deletedPdfs.filter((id) => id !== pdfId));
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.DELETE_FAILED);
    }
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
        onRefresh();
      } else {
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.MOVE_FAILED);
      }
    } catch (error) {
      console.error("bulk move failed:", error);
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.MOVE_FAILED);
    }
  };

  const bulkDeletePdfs = async (files: PdfFile[]) => {
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
        onRefresh();
      } else {
        setDeletedPdfs(deletedPdfs.filter((id) => !selectedPdfIds.includes(id)));
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.DELETE_FAILED);
      }
    } catch (error) {
      console.error("bulk delete failed:", error);
      setDeletedPdfs(deletedPdfs.filter((id) => !selectedPdfIds.includes(id)));
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.DELETE_FAILED);
    }
  };

  const generateBulkReport = async (
    config: {
      title: string;
      season: string;
      year: number;
      boldKeywords: string[];
      capitalizeKeywords: string[];
    },
    files: PdfFile[],
    folders: Folder[],
  ) => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) {
      showToast("error", "No Selection", "Please select files or folders to generate report");
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

      showToast("success", SUCCESS_MESSAGES.REPORT_GENERATED, "Excel report downloaded successfully");
      setSelectedItems(new Set());
      setIsSelectMode(false);
    } catch (error) {
      console.error("report generation broken:", error);
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.REPORT_FAILED);
    }
  };

  return {
    deleteFolder,
    moveFolder,
    syncFolder,
    deletePdf,
    bulkMovePdfs,
    bulkDeletePdfs,
    generateBulkReport,
  };
};
