"use client";

import { useState } from "react";
import Modal from "../Modal";
import { Trash } from "@phosphor-icons/react/dist/ssr";

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileCount: number;
  onConfirm: () => Promise<void>;
}

export default function BulkDeleteModal({
  isOpen,
  onClose,
  fileCount,
  onConfirm,
}: BulkDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Multiple Files?">
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm text-gray-700">
            About to delete{" "}
            <span className="font-semibold text-gray-900">
              {fileCount} PDF{fileCount !== 1 ? "s" : ""}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            All selected files will be permanently removed. No going back after
            this.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            data-modal-close="true"
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
          >
            Keep Them
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Trash weight="regular" className="w-4 h-4" />
            {deleting ? "Deleting..." : "Yes, Delete All"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
