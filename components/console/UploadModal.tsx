'use client';

import { useState } from 'react';
import { FilePlus, UploadSimple, FilePdf, X } from '@phosphor-icons/react/dist/ssr';
import { apiCall } from '@/lib/api/client';
import Modal from '@/components/Modal';

interface UploadModalProps {
  currentFolder: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onUploadOptimistic?: (files: File[]) => void;
}

export default function UploadModal({
  currentFolder,
  onClose,
  onSuccess,
  onUploadOptimistic,
}: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    setSelectedFiles(Array.from(fileList));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    if (onUploadOptimistic) {
      onUploadOptimistic(selectedFiles);
    }
    
    const formData = new FormData();
    
    selectedFiles.forEach((file) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Upload PDF Files"
      description="Upload up to 10 PDF files at once. Each file can be up to 50MB."
      icon={<FilePlus weight="regular" className="w-5 h-5" />}
      maxWidth="md"
    >
      <div className="p-6 space-y-4">
        {selectedFiles.length === 0 ? (
          <label className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-800 cursor-pointer transition">
            <UploadSimple weight="regular" className="w-12 h-12 text-emerald-800" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                Click to select PDFs
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max 10 files, 50MB each
              </p>
            </div>
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={selectFiles}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
              </p>
              <label className="text-xs text-emerald-800 hover:text-emerald-900 cursor-pointer font-medium">
                Add more
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => {
                    const newFiles = e.target.files;
                    if (newFiles) {
                      setSelectedFiles([...selectedFiles, ...Array.from(newFiles)]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <FilePdf weight="regular" className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded transition flex-shrink-0"
                  >
                    <X weight="regular" className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200">
        <button
          data-modal-close="true"
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition text-sm font-medium"
        >
          Nevermind
        </button>
        {selectedFiles.length > 0 && (
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 disabled:opacity-50 transition text-sm font-medium"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'File' : 'Files'}`}
          </button>
        )}
      </div>
    </Modal>
  );
}
