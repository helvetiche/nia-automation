"use client";

import { Folder as FolderIcon } from "@phosphor-icons/react";

export default function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <FolderIcon
        weight="regular"
        className="w-16 h-16 mx-auto mb-4 text-gray-300"
      />
      <p>This folder is empty</p>
      <p className="text-sm">Create a folder or upload PDFs to get started</p>
    </div>
  );
}
