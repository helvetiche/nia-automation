'use client';

import { useState } from 'react';
import type { Folder, PdfFile } from '@/types';
import { 
  Folder as FolderIcon,
  FilePdf,
  CheckCircle,
  Clock,
  Eye,
  ScanSmiley
} from '@phosphor-icons/react/dist/ssr';
import { apiCall } from '@/lib/api/client';

interface FileGridProps {
  folders: Folder[];
  files: PdfFile[];
  currentFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onViewPdf: (pdf: PdfFile) => void;
  onRefresh: () => void;
}

export default function FileGrid({
  folders,
  files,
  currentFolder,
  onSelectFolder,
  onViewPdf,
  onRefresh,
}: FileGridProps) {
  const [scanning, setScanning] = useState<string[]>([]);

  const currentFolderData = folders.find((f) => f.id === currentFolder);
  const subfolders = folders.filter((f) => f.parentId === currentFolder);

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

  const breadcrumbs = [];
  let current = currentFolderData;
  while (current) {
    breadcrumbs.unshift(current);
    current = folders.find((f) => f.id === current?.parentId);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <button
          onClick={() => onSelectFolder(null)}
          className="text-emerald-800 hover:underline"
        >
          Root
        </button>
        {breadcrumbs.map((folder) => (
          <span key={folder.id} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <button
              onClick={() => onSelectFolder(folder.id)}
              className="text-emerald-800 hover:underline"
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-4">
        {subfolders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-800 hover:shadow-md transition group"
          >
            <FolderIcon weight="regular" className="w-12 h-12 text-emerald-800" />
            <span className="text-sm text-gray-900 text-center line-clamp-2">
              {folder.name}
            </span>
          </button>
        ))}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:border-emerald-800 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <FilePdf weight="regular" className="w-12 h-12 text-red-600" />
              {file.status === 'scanned' ? (
                <CheckCircle weight="regular" className="w-5 h-5 text-green-600" />
              ) : (
                <Clock weight="regular" className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            
            <span className="text-sm text-gray-900 line-clamp-2">{file.name}</span>
            
            <div className="flex gap-1 mt-2">
              {file.status === 'unscanned' ? (
                <button
                  onClick={() => scanPdf(file.id)}
                  disabled={scanning.includes(file.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-800 text-white rounded text-xs hover:bg-emerald-900 disabled:opacity-50"
                >
                  <ScanSmiley weight="regular" className="w-4 h-4" />
                  {scanning.includes(file.id) ? 'Scanning...' : 'Scan'}
                </button>
              ) : (
                <button
                  onClick={() => onViewPdf(file)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                >
                  <Eye weight="regular" className="w-4 h-4" />
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {subfolders.length === 0 && files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FolderIcon weight="regular" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>This folder is empty</p>
          <p className="text-sm">Create a folder or upload PDFs to get started</p>
        </div>
      )}
    </div>
  );
}
