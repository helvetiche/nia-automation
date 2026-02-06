"use client";

import { useState } from "react";
import type { Folder, PdfFile } from "@/types";
import Modal from "@/components/Modal";
import { FolderOpen } from "@phosphor-icons/react";

interface MovePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdf: PdfFile;
  allFolders: Folder[];
  onConfirm: (targetFolderId: string) => void;
}

export default function MovePdfModal({
  isOpen,
  onClose,
  pdf,
  allFolders,
  onConfirm,
}: MovePdfModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedFolderId !== null) {
      onConfirm(selectedFolderId);
      setSelectedFolderId(null);
    }
  };

  const handleClose = () => {
    setSelectedFolderId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="w-96 max-h-96 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Move PDF</h2>
          <p className="text-sm text-gray-600 mt-1">{pdf.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                selectedFolderId === null
                  ? "bg-emerald-50 text-emerald-800 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderOpen weight="regular" className="w-4 h-4" />
              Root
            </button>

            {allFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                  selectedFolderId === folder.id
                    ? "bg-emerald-50 text-emerald-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={{ paddingLeft: `${12 + folder.level * 16}px` }}
              >
                <FolderOpen weight="regular" className="w-4 h-4" />
                {folder.name}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            data-modal-close="true"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm font-medium"
          >
            Nevermind
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedFolderId === null}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move Here
          </button>
        </div>
      </div>
    </Modal>
  );
}
