"use client";

import { useState } from "react";
import type { Folder } from "@/types";
import Modal from "@/components/Modal";
import { FolderOpen } from "@phosphor-icons/react/dist/ssr";

interface BulkMovePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  allFolders: Folder[];
  onConfirm: (targetFolderId: string) => void;
  selectedCount: number;
}

export default function BulkMovePdfModal({
  isOpen,
  onClose,
  allFolders,
  onConfirm,
  selectedCount,
}: BulkMovePdfModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedFolder !== null) {
      onConfirm(selectedFolder);
      setSelectedFolder(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Move ${selectedCount} PDF${selectedCount !== 1 ? "s" : ""}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Select a folder to move the selected PDFs to:
        </p>

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          <div className="space-y-1 p-2">
            {allFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                  selectedFolder === folder.id
                    ? "bg-emerald-100 text-emerald-900"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <FolderOpen
                  weight="regular"
                  className="w-4 h-4 flex-shrink-0"
                />
                <span className="truncate">{folder.name}</span>
                <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                  {"  ".repeat(folder.level)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Nevermind
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedFolder === null}
            className="px-4 py-2 text-sm bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move {selectedCount}
          </button>
        </div>
      </div>
    </Modal>
  );
}
