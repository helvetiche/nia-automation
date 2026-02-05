'use client';

import { useState } from 'react';
import Modal from '../Modal';
import { Trash } from '@phosphor-icons/react/dist/ssr';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  onConfirm: () => void;
}

export default function DeleteFolderModal({
  isOpen,
  onClose,
  folderName,
  onConfirm,
}: DeleteFolderModalProps) {
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Folder?">
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm text-gray-700">
            About to delete <span className="font-semibold text-gray-900">{folderName}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            All files and subfolders inside will be removed too. No going back after this.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            data-modal-close="true"
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
          >
            Keep It
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Trash weight="regular" className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
