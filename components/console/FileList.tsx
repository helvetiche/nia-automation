'use client';

import { useState } from 'react';
import type { PdfFile } from '@/types';
import { apiCall } from '@/lib/api/client';

interface FileListProps {
  files: PdfFile[];
  currentFolder: string | null;
  onViewPdf: (pdf: PdfFile) => void;
  onRefresh: () => void;
}

export default function FileList({
  files,
  currentFolder,
  onViewPdf,
  onRefresh,
}: FileListProps) {
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

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
        await onRefresh();
      }
    } catch (error) {
      console.error('upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const scanPdf = async (pdfId: string) => {
    setScanning([...scanning, pdfId]);
    try {
      const response = await apiCall('/api/files/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId }),
      });

      if (response.ok) {
        await onRefresh();
      }
    } catch (error) {
      console.error('scan failed:', error);
    } finally {
      setScanning(scanning.filter((id) => id !== pdfId));
    }
  };

  const toggleSelect = (fileId: string) => {
    setSelected(
      selected.includes(fileId)
        ? selected.filter((id) => id !== fileId)
        : [...selected, fileId]
    );
  };

  const selectAll = () => {
    setSelected(selected.length === files.length ? [] : files.map((f) => f.id));
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentFolder ? 'Folder Contents' : 'Root Files'}
        </h2>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 cursor-pointer transition">
            {uploading ? 'Uploading...' : '+ Upload PDF'}
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
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No files in this folder. Upload some PDFs to get started.
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={selectAll}
              className="text-sm text-emerald-800 hover:underline"
            >
              {selected.length === files.length ? 'Deselect All' : 'Select All'}
            </button>
            {selected.length > 0 && (
              <span className="text-sm text-gray-600">
                {selected.length} selected
              </span>
            )}
          </div>

          <div className="grid gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="w-4 h-4"
                />
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.status === 'scanned'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {file.status}
                  </span>

                  {file.status === 'unscanned' ? (
                    <button
                      onClick={() => scanPdf(file.id)}
                      disabled={scanning.includes(file.id)}
                      className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 disabled:opacity-50 text-sm"
                    >
                      {scanning.includes(file.id) ? 'Scanning...' : 'Scan'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewPdf(file)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
