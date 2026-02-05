'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Folder, PdfFile } from '@/types';
import Ribbon from './Ribbon';
import FileGrid from './FileGrid';
import CreateFolderModal from './CreateFolderModal';
import UploadModal from './UploadModal';
import { apiCall } from '@/lib/api/client';

interface FolderBrowserProps {
  onViewPdf: (pdf: PdfFile) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

const STORAGE_KEYS = {
  viewMode: 'nia-view-mode',
  currentFolder: 'nia-current-folder',
};

export default function FolderBrowser({ onViewPdf, viewMode, onViewModeChange }: FolderBrowserProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scanned' | 'unscanned'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date' | 'size'>('name-asc');

  const loadFolders = async () => {
    try {
      const response = await apiCall('/api/folders');
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('folder load failed:', error);
    }
  };

  const loadFiles = async (folderId: string | null) => {
    try {
      const timestamp = Date.now();
      const url = folderId 
        ? `/api/files?folderId=${folderId}&t=${timestamp}` 
        : `/api/files?t=${timestamp}`;
      const response = await apiCall(url);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('file load failed:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const savedFolder = localStorage.getItem(STORAGE_KEYS.currentFolder);

      await loadFolders();
      await loadFiles(savedFolder || null);
      
      if (savedFolder) {
        setCurrentFolder(savedFolder);
      }

      setLoading(false);
    };
    init();
  }, []);

  const selectFolder = async (folderId: string | null) => {
    setCurrentFolder(folderId);
    localStorage.setItem(STORAGE_KEYS.currentFolder, folderId || '');
    await loadFiles(folderId);
  };

  const refreshData = async (force = false) => {
    if (force) {
      setFiles([]);
      setFolders([]);
    }
    await loadFolders();
    await loadFiles(currentFolder);
  };

  const handleUploadOptimistic = (uploadedFiles: File[]) => {
    const newFiles: PdfFile[] = uploadedFiles.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      folderId: currentFolder || '',
      status: 'unscanned' as const,
      uploadedAt: Date.now(),
      storageUrl: '',
      userId: '',
    }));

    setFiles([...files, ...newFiles]);
  };

  const filteredFiles = useMemo(() => {
    let result = files;

    if (searchQuery) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter((file) => file.status === filterStatus);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'size':
          return (b.pageCount || 0) - (a.pageCount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [files, searchQuery, filterStatus, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-600">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Ribbon
        onCreateFolder={() => setShowCreateFolder(true)}
        onUploadFile={() => setShowUpload(true)}
        onRefresh={refreshData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        refreshTrigger={refreshTrigger}
      />
      
      <FileGrid
        folders={folders}
        files={filteredFiles}
        currentFolder={currentFolder}
        onSelectFolder={selectFolder}
        onViewPdf={onViewPdf}
        onRefresh={refreshData}
        onCreateFolder={() => setShowCreateFolder(true)}
        onUploadFile={() => setShowUpload(true)}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {showCreateFolder && (
        <CreateFolderModal
          currentFolder={currentFolder}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={refreshData}
        />
      )}

      {showUpload && (
        <UploadModal
          currentFolder={currentFolder}
          onClose={() => setShowUpload(false)}
          onSuccess={refreshData}
          onUploadOptimistic={handleUploadOptimistic}
        />
      )}
    </div>
  );
}
