import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";
import type { PdfFile } from "@/types";

export const useAssociationOperations = (
  setLocalFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>,
  expandedSummaries: Set<string>,
  setExpandedSummaries: React.Dispatch<React.SetStateAction<Set<string>>>,
) => {
  const { showToast } = useToast();

  const addAssociation = async (fileId: string) => {
    try {
      const response = await apiCall(`/api/files/${fileId}/association`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setLocalFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (file.id === fileId) {
              return {
                ...file,
                summaryData: [...(file.summaryData || []), data.association],
              };
            }
            return file;
          }),
        );
        showToast(
          "success",
          "Association Added",
          "New association created successfully",
        );
        setExpandedSummaries(new Set([...expandedSummaries, fileId]));
      } else {
        showToast("error", "Add failed", "Could not add association");
      }
    } catch (error) {
      console.error("add association failed:", error);
      showToast("error", "Add failed", "Could not add association");
    }
  };

  const deleteAssociation = async (fileId: string, associationId: string) => {
    try {
      const response = await apiCall(`/api/files/${fileId}/association`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ associationId }),
      });

      if (response.ok) {
        setLocalFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (file.id === fileId) {
              return {
                ...file,
                summaryData: file.summaryData?.filter(
                  (assoc) => assoc.id !== associationId,
                ),
              };
            }
            return file;
          }),
        );
        showToast(
          "success",
          "Association Deleted",
          "Association removed successfully",
        );
      } else {
        showToast("error", "Delete failed", "Could not delete association");
      }
    } catch (error) {
      console.error("delete association failed:", error);
      showToast("error", "Delete failed", "Could not delete association");
    }
  };

  return {
    addAssociation,
    deleteAssociation,
  };
};
