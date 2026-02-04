'use client';

import { useState } from 'react';
import { FolderPlus } from '@phosphor-icons/react/dist/ssr';
import { apiCall } from '@/lib/api/client';
import Modal from '@/components/Modal';

interface CreateFolderModalProps {
  currentFolder: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFolderModal({
  currentFolder,
  onClose,
  onSuccess,
}: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const createFolder = async () => {
    if (!name.trim()) return;

    setCreating(true);
    try {
      const response = await apiCall('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parentId: currentFolder,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('folder creation failed:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Folder"
      description="Organize your PDFs by creating folders. You can nest folders up to 4 levels deep."
      icon={<FolderPlus weight="regular" className="w-5 h-5" />}
      maxWidth="sm"
    >
      <div className="p-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
          autoFocus
        />
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200">
        <button
          data-modal-close="true"
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Nevermind
        </button>
        <button
          onClick={createFolder}
          disabled={creating || !name.trim()}
          className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 disabled:opacity-50 transition text-sm font-medium"
        >
          {creating ? 'Creating...' : 'Create Folder'}
        </button>
      </div>
    </Modal>
  );
}
