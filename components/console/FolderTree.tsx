"use client";

import { useState } from "react";
import type { Folder } from "@/types";
import { apiCall } from "@/lib/api/client";

interface FolderTreeProps {
  folders: Folder[];
  currentFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onRefresh: () => void;
}

export default function FolderTree({
  folders,
  currentFolder,
  onSelectFolder,
  onRefresh,
}: FolderTreeProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    setCreating(true);
    try {
      const response = await apiCall("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder,
        }),
      });

      if (response.ok) {
        setNewFolderName("");
        setShowCreateModal(false);
        await onRefresh();
      }
    } catch (error) {
      console.error("folder creation failed:", error);
    } finally {
      setCreating(false);
    }
  };

  const rootFolders = folders.filter((f) => f.parentId === null);
  const getSubfolders = (parentId: string) =>
    folders.filter((f) => f.parentId === parentId);

  const renderFolder = (folder: Folder) => {
    const subfolders = getSubfolders(folder.id);
    const isSelected = currentFolder === folder.id;

    return (
      <div key={folder.id} className="ml-4">
        <button
          onClick={() => onSelectFolder(folder.id)}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
            isSelected
              ? "bg-emerald-800 text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span className="text-sm">{folder.name}</span>
        </button>
        {subfolders.map(renderFolder)}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
            currentFolder === null
              ? "bg-emerald-800 text-white"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-sm font-medium">Root</span>
        </button>
      </div>

      {rootFolders.map(renderFolder)}

      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full mt-4 px-3 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition text-sm"
      >
        + New Folder
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Create Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={createFolder}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
