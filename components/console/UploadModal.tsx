'use client';

import { useState } from 'react';
import { FilePlus, UploadSimple } from '@phosphor-icons/react/dist/ssr';
import { apiCall } from '@/lib/api/client';
import Modal from '@/components/Modal';

interface UploadModalProps {
  currentFolder: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({
  currentFolder,
  onClose,
  onSuccess,
}: UploadModalProps) {
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(fileList).forEach((file) => {
      formData.append('files', file);
    });
    
    if (currentFolder) {
      formData.append('folderId', currentFolder);
    }

    try {
      const response = await apiCall('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Upload PDF Files"
      description="Upload up to 10 PDF files at once. Each file can be up to 50MB. Files will be ready to scan after upload."
      icon={<FilePlus weight="regular" className="w-5 h-5" />}
      maxWidth="sm"
    >
      <div className="p-8">
        <label className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-800 cursor-pointer transition">
          <UploadSimple weight="regular" className="w-12 h-12 text-emerald-800" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Click to upload PDFs'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max 10 files, 50MB each
            </p>
          </div>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={uploadFiles}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200">
        <button
          data-modal-close="true"
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition text-sm font-medium"
        >
          Nevermind
        </button>
      </div>
    </Modal>
  );
}
