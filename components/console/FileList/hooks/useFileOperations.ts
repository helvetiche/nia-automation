import { useState } from "react";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";
import type { PdfFile } from "@/types";

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
        await onRefresh();
        setTimeout(async () => await onRefresh(), 1500);
        setTimeout(async () => await onRefresh(), 3000);
      } else {
        console.error("scan request failed:", response.status);
      }
    } catch (error) {
      console.error("scan failed:", error);
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
    showToast("success", "File Moved", `${pdfName} has been moved`);

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
        showToast(
          "error",
          "Oops, something broke",
          "Could not move the file. Try again?",
        );
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
      showToast(
        "error",
        "Oops, something broke",
        "Could not move the file. Try again?",
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
        onRefresh();
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
