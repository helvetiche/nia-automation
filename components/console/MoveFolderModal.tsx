"use client";

import { useState } from "react";
import type { Folder } from "@/types";
import Modal from "@/components/Modal";
import { Folder as FolderIcon } from "@phosphor-icons/react/dist/ssr";

interface MoveFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder;
  allFolders: Folder[];
  onConfirm: (targetFolderId: string | null) => void;
}

export default function MoveFolderModal({
  isOpen,
  onClose,
  folder,
  allFolders,
  onConfirm,
}: MoveFolderModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const availableFolders = allFolders.filter(
    (f) => f.id !== folder.id && f.parentId !== folder.id && f.level < 3,
  );

  const moveFolder = () => {
    onConfirm(selectedFolder);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      description="Choose where to move this folder. It will be moved along with all its contents."
      maxWidth="2xl"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Move Folder</h2>
        <p className="text-sm text-gray-600 mt-1">Moving: {folder.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
              selectedFolder === null
                ? "border-emerald-800 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <FolderIcon weight="regular" className="w-6 h-6 text-gray-600" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900">Root</p>
              <p className="text-xs text-gray-500">Move to top level</p>
            </div>
          </button>

          {availableFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                selectedFolder === f.id
                  ? "border-emerald-800 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <FolderIcon weight="regular" className="w-6 h-6 text-gray-600" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                <p className="text-xs text-gray-500">Level {f.level}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          data-modal-close="true"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Nevermind
        </button>
        <button
          onClick={moveFolder}
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition text-sm font-medium"
        >
          Move Here
        </button>
      </div>
    </Modal>
  );
}
