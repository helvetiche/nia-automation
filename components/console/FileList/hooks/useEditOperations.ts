import { useState } from "react";
import { apiCall } from "@/lib/api/client";
import { useToast } from "@/components/ToastContainer";
import type { PdfFile } from "@/types";
import type { EditingAreaState, EditingNameState } from "../types";

export const useEditOperations = (
  onRefresh: () => void,
  setLocalFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>,
) => {
  const [editingArea, setEditingArea] = useState<EditingAreaState | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingName, setEditingName] = useState<EditingNameState | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const { showToast } = useToast();

  const startEditingArea = (
    fileId: string,
    currentValue: number,
    associationId?: string,
  ) => {
    setEditingArea({ fileId, associationId, currentValue });
    setEditValue(currentValue.toFixed(2));
  };

  const cancelEditingArea = () => {
    setEditingArea(null);
    setEditValue("");
  };

  const saveAreaEdit = async () => {
    if (!editingArea) return;

    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      showToast("error", "Invalid Value", "Please enter a valid number");
      return;
    }

    try {
      const response = await apiCall(`/api/files/${editingArea.fileId}/area`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newArea: newValue,
          associationId: editingArea.associationId,
        }),
      });

      if (response.ok) {
        showToast("success", "Area Updated", "Area value has been updated");
        onRefresh();
        cancelEditingArea();
      } else {
        showToast("error", "Update failed", "Could not update area value");
      }
    } catch (error) {
      console.error("area update failed:", error);
      showToast("error", "Update failed", "Could not update area value");
    }
  };

  const startEditingName = (
    fileId: string,
    currentValue: string,
    associationId?: string,
  ) => {
    setEditingName({ fileId, associationId, currentValue });
    setEditNameValue(currentValue);
  };

  const cancelEditingName = () => {
    setEditingName(null);
    setEditNameValue("");
  };

  const saveNameEdit = async () => {
    if (!editingName) return;

    const newName = editNameValue.trim();
    if (newName.length === 0) {
      showToast("error", "Invalid Name", "Name cannot be empty");
      return;
    }

    try {
      const response = await apiCall(
        `/api/files/${editingName.fileId}/rename`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newName,
            associationId: editingName.associationId,
          }),
        },
      );

      if (response.ok) {
        setLocalFiles((prevFiles) =>
          prevFiles.map((file) => {
            if (file.id === editingName.fileId) {
              if (editingName.associationId) {
                return {
                  ...file,
                  summaryData: file.summaryData?.map((assoc) =>
                    assoc.id === editingName.associationId
                      ? { ...assoc, name: newName }
                      : assoc,
                  ),
                };
              } else {
                return { ...file, name: newName };
              }
            }
            return file;
          }),
        );
        showToast("success", "Name Updated", "Name has been updated");
        cancelEditingName();
      } else {
        showToast("error", "Update failed", "Could not update name");
      }
    } catch (error) {
      console.error("name update failed:", error);
      showToast("error", "Update failed", "Could not update name");
    }
  };

  return {
    editingArea,
    editValue,
    setEditValue,
    editingName,
    editNameValue,
    setEditNameValue,
    startEditingArea,
    cancelEditingArea,
    saveAreaEdit,
    startEditingName,
    cancelEditingName,
    saveNameEdit,
  };
};
