import { useState } from "react";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";

export const useFolderOperations = (onRefresh: () => void) => {
  const [deletedFolders, setDeletedFolders] = useState<string[]>([]);
  const [movedFolders, setMovedFolders] = useState<{
    [key: string]: string | null;
  }>({});
  const [syncingFolders, setSyncingFolders] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const deleteFolder = async (folderId: string, folderName: string) => {
    setDeletedFolders([...deletedFolders, folderId]);
    showToast("success", "Folder Deleted", `${folderName} has been removed`);

    try {
      const response = await apiCall(`/api/folders?id=${folderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setDeletedFolders(deletedFolders.filter((id) => id !== folderId));
        showToast(
          "error",
          "Oops, something broke",
          "Could not delete the folder. Try again?",
        );
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error("delete failed:", error);
      setDeletedFolders(deletedFolders.filter((id) => id !== folderId));
      showToast(
        "error",
        "Oops, something broke",
        "Could not delete the folder. Try again?",
      );
    }
  };

  const moveFolder = async (
    folderId: string,
    targetFolderId: string | null,
    folderName: string,
  ) => {
    setMovedFolders({ ...movedFolders, [folderId]: targetFolderId });
    showToast("success", "Folder Moved", `${folderName} has been moved`);

    try {
      const response = await apiCall(`/api/folders?id=${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: targetFolderId }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        setMovedFolders(
          Object.fromEntries(
            Object.entries(movedFolders).filter(([key]) => key !== folderId),
          ),
        );
        showToast(
          "error",
          "Oops, something broke",
          "Could not move the folder. Try again?",
        );
      }
    } catch (error) {
      console.error("move failed:", error);
      setMovedFolders(
        Object.fromEntries(
          Object.entries(movedFolders).filter(([key]) => key !== folderId),
        ),
      );
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
        onRefresh();
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

  return {
    deletedFolders,
    movedFolders,
    syncingFolders,
    deleteFolder,
    moveFolder,
    syncFolder,
  };
};
