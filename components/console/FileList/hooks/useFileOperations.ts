import { useState } from "react";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";
import type { PdfFile } from "@/types";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants/appConfig";

export const useFileOperations = (onRefresh: () => void) => {
  const [scanning, setScanning] = useState<string[]>([]);
  const [movedPdfs, setMovedPdfs] = useState<{ [key: string]: string }>({});
  const [deletedPdfs, setDeletedPdfs] = useState<string[]>([]);
  const [localFiles, setLocalFiles] = useState<PdfFile[]>([]);
  const { showToast } = useToast();

  const scanPdf = async (
    pdfId: string,
    scanType: "total" | "summary" = "total",
    pageNumbers?: string,
  ) => {
    setScanning((prev) => [...prev, pdfId]);

    try {
      const response = await apiCall("/api/files/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId, scanType, pageNumbers }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        console.error("scan request failed:", response.status);
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.SCAN_FAILED);
      }
    } catch (error) {
      console.error("scan failed:", error);
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.SCAN_FAILED);
    } finally {
      setTimeout(() => {
        setScanning((prev) => prev.filter((id) => id !== pdfId));
      }, 1000);
    }
  };

  const movePdf = async (
    pdfId: string,
    targetFolderId: string,
    pdfName: string,
  ) => {
    setMovedPdfs({ ...movedPdfs, [pdfId]: targetFolderId });
    showToast("success", SUCCESS_MESSAGES.FILE_MOVED, `${pdfName} has been moved`);

    try {
      const response = await apiCall("/api/files/move", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfId, targetFolderId }),
      });

      if (!response.ok) {
        setMovedPdfs(
          Object.fromEntries(
            Object.entries(movedPdfs).filter(([key]) => key !== pdfId),
          ),
        );
        showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.MOVE_FAILED);
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error("move pdf failed:", error);
      setMovedPdfs(
        Object.fromEntries(
          Object.entries(movedPdfs).filter(([key]) => key !== pdfId),
        ),
      );
      showToast("error", ERROR_MESSAGES.SERVER_ERROR, ERROR_MESSAGES.MOVE_FAILED);
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

  return {
    scanning,
    movedPdfs,
    deletedPdfs,
    localFiles,
    setLocalFiles,
    scanPdf,
    movePdf,
    deletePdf,
  };
};
