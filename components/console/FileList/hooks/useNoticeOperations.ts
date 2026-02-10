import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";

export const useNoticeOperations = (onRefresh: () => void) => {
  const { showToast } = useToast();

  const updateFolderNotice = async (folderId: string, notice: string) => {
    try {
      const response = await apiCall(`/api/folders/${folderId}/notice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notice }),
      });

      if (response.ok) {
        showToast(
          "success",
          "Notice Updated",
          notice ? "Notice added successfully" : "Notice removed",
        );
        onRefresh();
      } else {
        showToast("error", "Update failed", "Could not update notice");
      }
    } catch (error) {
      console.error("folder notice update failed:", error);
      showToast("error", "Update failed", "Could not update notice");
    }
  };

  const updateFileNotice = async (
    fileId: string,
    notice: string,
    summaryId?: string,
  ) => {
    try {
      const response = await apiCall(`/api/files/${fileId}/notice`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notice, summaryId }),
      });

      if (response.ok) {
        showToast(
          "success",
          "Notice Updated",
          notice ? "Notice added successfully" : "Notice removed",
        );
        onRefresh();
      } else {
        showToast("error", "Update failed", "Could not update notice");
      }
    } catch (error) {
      console.error("file notice update failed:", error);
      showToast("error", "Update failed", "Could not update notice");
    }
  };

  return {
    updateFolderNotice,
    updateFileNotice,
  };
};
