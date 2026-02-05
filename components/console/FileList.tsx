'use client';

import { useState, useEffect } from 'react';
import type { Folder, PdfFile } from '@/types';
import { 
  Folder as FolderIcon,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image as ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera,
  FilePdf,
  Eye,
  ScanSmiley,
  Trash,
  ChartLineUp,
  ArrowsDownUp,
  FolderPlus,
  CheckCircle,
  Gauge,
  Leaf,
  Plant,
  ArrowsClockwise,
  CurrencyDollar,
  Cpu
} from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';
import { apiCall } from '@/lib/api/client';
import DeleteFolderModal from './DeleteFolderModal';
import MoveFolderModal from './MoveFolderModal';
import SummaryModal from './SummaryModal';
import ScanOptionsModal from './ScanOptionsModal';
import Tooltip from '@/components/Tooltip';
import { useToast } from '@/components/ToastContainer';
import MovePdfModal from './MovePdfModal';

interface FileListProps {
  folders: Folder[];
  files: PdfFile[];
  allFolders: Folder[];
  onSelectFolder: (folderId: string | null) => void;
  onViewPdf: (pdf: PdfFile) => void;
  onRefresh: () => void;
  isSelectMode: boolean;
  selectedPdfs: Set<string>;
  onToggleSelectPdf: (id: string) => void;
  onToggleSelectAllPdfs: (ids: string[]) => void;
  batchScanning: boolean;
  currentlyScanning: string | null;
  estimatedTimeRemaining: number;
}

const ICON_MAP: Record<string, React.ComponentType> = {
  Folder: FolderIcon,
  FolderOpen,
  Archive,
  BookBookmark,
  Briefcase,
  ChartBar,
  FileText,
  Gear,
  Heart,
  House,
  Image: ImageIcon,
  Lightning,
  MusicNote,
  Star,
  Users,
  VideoCamera,
};

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
};

const TEXT_COLOR_MAP: Record<string, string> = {
  red: 'text-red-700',
  orange: 'text-orange-700',
  yellow: 'text-yellow-700',
  emerald: 'text-emerald-700',
  blue: 'text-blue-700',
  indigo: 'text-indigo-700',
  purple: 'text-purple-700',
  pink: 'text-pink-700',
};

export default function FileList({
  folders,
  files,
  allFolders,
  onSelectFolder,
  onViewPdf,
  onRefresh,
  isSelectMode,
  selectedPdfs,
  onToggleSelectPdf,
  onToggleSelectAllPdfs,
  batchScanning,
  currentlyScanning,
  estimatedTimeRemaining,
}: FileListProps) {
  const [scanning, setScanning] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ folderId: string; folderName: string } | null>(null);
  const [moveModal, setMoveModal] = useState<Folder | null>(null);
  const [deletedFolders, setDeletedFolders] = useState<string[]>([]);
  const [summaryModal, setSummaryModal] = useState<PdfFile | null>(null);
  const [movePdfModal, setMovePdfModal] = useState<PdfFile | null>(null);
  const [scanOptionsModal, setScanOptionsModal] = useState<PdfFile | null>(null);
  const [movedPdfs, setMovedPdfs] = useState<{ [key: string]: string }>({});
  const [movedFolders, setMovedFolders] = useState<{ [key: string]: string | null }>({});
  const [deletedPdfs, setDeletedPdfs] = useState<string[]>([]);
  const [syncingFolders, setSyncingFolders] = useState<Set<string>>(new Set());
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('nia-elapsed-time') || '0', 10);
  });
  const [scanStartTime, setScanStartTime] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('nia-scan-start-time') || '0', 10);
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (scanning.length > 0 || currentlyScanning) {
      let startTime = scanStartTime;
      
      if (startTime === 0) {
        startTime = Date.now();
        setScanStartTime(startTime);
        localStorage.setItem('nia-scan-start-time', startTime.toString());
      }

      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        localStorage.setItem('nia-elapsed-time', elapsed.toString());
      }, 1000);
      return () => clearInterval(interval);
    } else if (scanStartTime > 0 && !currentlyScanning && scanning.length === 0) {
      setElapsedTime(0);
      setScanStartTime(0);
      localStorage.removeItem('nia-elapsed-time');
      localStorage.removeItem('nia-scan-start-time');
    }
  }, [scanning.length, currentlyScanning, scanStartTime]);

  const toggleSelectPdf = (id: string) => {
    onToggleSelectPdf(id);
  };

  const toggleSelectAll = () => {
    const visiblePdfs = files.filter(file => !movedPdfs[file.id]);
    const pdfIds = visiblePdfs.map(file => file.id);
    onToggleSelectAllPdfs(pdfIds);
  };

  const scanPdf = async (pdfId: string) => {
    setScanning(prev => [...prev, pdfId]);
    
    try {
      const response = await apiCall('/api/files/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId }),
      });

      if (response.ok) {
        await onRefresh();
        
        setTimeout(async () => {
          await onRefresh();
        }, 1500);
        
        setTimeout(async () => {
          await onRefresh();
        }, 3000);
      } else {
        console.error('scan request failed:', response.status);
      }
    } catch (error) {
      console.error('scan failed:', error);
    } finally {
      setTimeout(() => {
        setScanning(prev => prev.filter((id) => id !== pdfId));
      }, 1000);
    }
  };

  const deleteFolder = async () => {
    if (!deleteModal) return;
    
    setDeletedFolders([...deletedFolders, deleteModal.folderId]);
    
    showToast('success', 'Folder Deleted', `${deleteModal.folderName} has been removed`);
    
    try {
      const response = await apiCall(`/api/folders?id=${deleteModal.folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setDeletedFolders(deletedFolders.filter(id => id !== deleteModal.folderId));
        showToast('error', 'Oops, something broke', 'Could not delete the folder. Try again?');
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('delete failed:', error);
      setDeletedFolders(deletedFolders.filter(id => id !== deleteModal.folderId));
      showToast('error', 'Oops, something broke', 'Could not delete the folder. Try again?');
    }
  };

  const moveFolder = async (targetFolderId: string | null) => {
    if (!moveModal) return;

    setMovedFolders({ ...movedFolders, [moveModal.id]: targetFolderId });
    setMoveModal(null);
    showToast('success', 'Folder Moved', `${moveModal.name} has been moved`);

    try {
      const response = await apiCall(`/api/folders?id=${moveModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: targetFolderId }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        setMovedFolders(Object.fromEntries(Object.entries(movedFolders).filter(([key]) => key !== moveModal.id)));
        showToast('error', 'Oops, something broke', 'Could not move the folder. Try again?');
      }
    } catch (error) {
      console.error('move failed:', error);
      setMovedFolders(Object.fromEntries(Object.entries(movedFolders).filter(([key]) => key !== moveModal.id)));
      showToast('error', 'Oops, something broke', 'Could not move the folder. Try again?');
    }
  };

  const syncFolder = async (folderId: string, folderName: string) => {
    setSyncingFolders(new Set([...syncingFolders, folderId]));
    
    try {
      const response = await apiCall('/api/folders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId }),
      });

      if (response.ok) {
        await response.json();
        showToast('success', 'Folder Synced', `${folderName} totals updated`);
        onRefresh();
      } else {
        showToast('error', 'Sync failed', 'Could not calculate folder totals');
      }
    } catch (error) {
      console.error('sync failed:', error);
      showToast('error', 'Sync failed', 'Could not calculate folder totals');
    } finally {
      setSyncingFolders(new Set([...syncingFolders].filter(id => id !== folderId)));
    }
  };

  const movePdf = async (targetFolderId: string) => {
    if (!movePdfModal) return;

    setMovedPdfs({ ...movedPdfs, [movePdfModal.id]: targetFolderId });
    setMovePdfModal(null);
    showToast('success', 'File Moved', `${movePdfModal.name} has been moved`);

    try {
      const response = await apiCall('/api/files/move', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId: movePdfModal.id, targetFolderId }),
      });

      if (!response.ok) {
        setMovedPdfs(Object.fromEntries(Object.entries(movedPdfs).filter(([key]) => key !== movePdfModal.id)));
        showToast('error', 'Oops, something broke', 'Could not move the file. Try again?');
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('move pdf failed:', error);
      setMovedPdfs(Object.fromEntries(Object.entries(movedPdfs).filter(([key]) => key !== movePdfModal.id)));
      showToast('error', 'Oops, something broke', 'Could not move the file. Try again?');
    }
  };

  const deletePdf = async (pdfId: string, pdfName: string) => {
    setDeletedPdfs([...deletedPdfs, pdfId]);
    showToast('success', 'File Deleted', `${pdfName} has been removed`);

    try {
      const response = await apiCall(`/api/files?id=${pdfId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setDeletedPdfs(deletedPdfs.filter(id => id !== pdfId));
        showToast('error', 'Oops, something broke', 'Could not delete the file. Try again?');
      } else {
        onRefresh();
      }
    } catch (error) {
      console.error('delete pdf failed:', error);
      setDeletedPdfs(deletedPdfs.filter(id => id !== pdfId));
      showToast('error', 'Oops, something broke', 'Could not delete the file. Try again?');
    }
  };

  const calculateTotals = (file: PdfFile) => {
    return {
      totalArea: file.totalArea || 0,
      totalIrrigatedArea: file.totalIrrigatedArea || 0,
      totalPlantedArea: file.totalPlantedArea || 0
    };
  };

  const visibleFolders = folders.filter(f => !deletedFolders.includes(f.id));

  return (
    <div className="space-y-6">
      {visibleFolders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Folders</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FolderIcon weight="regular" className="w-4 h-4" />
                    Name
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FolderPlus weight="regular" className="w-4 h-4" />
                    Contents
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Gauge weight="regular" className="w-4 h-4" />
                    Total Area
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Leaf weight="regular" className="w-4 h-4" />
                    Irrigated
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Plant weight="regular" className="w-4 h-4" />
                    Planted
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {visibleFolders.filter(f => !movedFolders[f.id]).map((folder) => {
                const IconComponent = (ICON_MAP[folder.icon || 'Folder'] || FolderIcon) as React.ComponentType<{ weight?: IconWeight; className?: string }>;
                const colorClass = COLOR_MAP[folder.color || 'blue'] || 'bg-blue-500';
                const textColor = TEXT_COLOR_MAP[folder.color || 'blue'] || 'text-blue-700';
                
                const subfolderCount = allFolders.filter(f => f.parentId === folder.id).length;
                const fileCount = files.filter(f => f.folderId === folder.id).length;
                const folderTotals = {
                  totalArea: folder.totalArea || 0,
                  totalIrrigatedArea: folder.totalIrrigatedArea || 0,
                  totalPlantedArea: folder.totalPlantedArea || 0
                };
                
                return (
                  <tr key={folder.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent weight="regular" className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{folder.name}</p>
                          {folder.description && (
                            <p className="text-xs text-gray-500 font-mono">{folder.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-600">
                        {subfolderCount} {subfolderCount === 1 ? 'Folder' : 'Folders'}, {fileCount} {fileCount === 1 ? 'File' : 'Files'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {folderTotals.totalArea > 0 ? folderTotals.totalArea.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {folderTotals.totalIrrigatedArea > 0 ? folderTotals.totalIrrigatedArea.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {folderTotals.totalPlantedArea > 0 ? folderTotals.totalPlantedArea.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip 
                          title="Sync" 
                          description="Calculate totals for files in this folder"
                          icon={<ArrowsClockwise weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => syncFolder(folder.id, folder.name)}
                            disabled={syncingFolders.has(folder.id)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor} disabled:opacity-50`}
                          >
                            <ArrowsClockwise 
                              weight="regular" 
                              className={`w-4 h-4 ${syncingFolders.has(folder.id) ? 'animate-spin' : ''}`} 
                            />
                          </button>
                        </Tooltip>
                        <Tooltip 
                          title="Open" 
                          description="Browse this folder's contents"
                          icon={<FolderOpen weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => onSelectFolder(folder.id)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                          >
                            <FolderOpen weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip 
                          title="Move" 
                          description="Move this folder to another location"
                          icon={<ArrowsDownUp weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => setMoveModal(folder)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                          >
                            <ArrowsDownUp weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip 
                          title="Delete" 
                          description="Remove this folder and all its contents"
                          icon={<Trash weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => setDeleteModal({ folderId: folder.id, folderName: folder.name })}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                          >
                            <Trash weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">PDF Files</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isSelectMode && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={files.filter(file => !movedPdfs[file.id]).length > 0 && files.filter(file => !movedPdfs[file.id]).every(file => selectedPdfs.has(file.id)) ? true : false}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FilePdf weight="regular" className="w-4 h-4" />
                    Name
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CheckCircle weight="regular" className="w-4 h-4" />
                    Status
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText weight="regular" className="w-4 h-4" />
                    Pages
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Gauge weight="regular" className="w-4 h-4" />
                    Total Area
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Leaf weight="regular" className="w-4 h-4" />
                    Irrigated
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Plant weight="regular" className="w-4 h-4" />
                    Planted
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CurrencyDollar weight="regular" className="w-4 h-4" />
                    Usage
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Gauge weight="regular" className="w-4 h-4" />
                    Confidence
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {files.filter(file => !movedPdfs[file.id] && !deletedPdfs.includes(file.id)).map((file) => {
                const parentFolder = allFolders.find(f => f.id === file.folderId);
                const fileColor = parentFolder?.color || 'red';
                const colorClass = COLOR_MAP[fileColor] || 'bg-red-500';
                const textColor = TEXT_COLOR_MAP[fileColor] || 'text-red-700';
                
                const { totalArea, totalIrrigatedArea, totalPlantedArea } = calculateTotals(file);
                
                return (
                  <tr key={file.id} className="hover:bg-gray-50 transition">
                    {isSelectMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPdfs.has(file.id)}
                          onChange={() => toggleSelectPdf(file.id)}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <FilePdf weight="regular" className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {currentlyScanning === file.id || scanning.includes(file.id) ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-medium ${textColor}`}>
                                {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <div className={`w-24 h-1.5 rounded-full overflow-hidden ${
                              fileColor === 'red' ? 'bg-red-200' :
                              fileColor === 'orange' ? 'bg-orange-200' :
                              fileColor === 'yellow' ? 'bg-yellow-200' :
                              fileColor === 'emerald' ? 'bg-emerald-200' :
                              fileColor === 'blue' ? 'bg-blue-200' :
                              fileColor === 'indigo' ? 'bg-indigo-200' :
                              fileColor === 'purple' ? 'bg-purple-200' :
                              'bg-pink-200'
                            }`}>
                              <div className={`h-full animate-pulse ${
                                fileColor === 'red' ? 'bg-red-600' :
                                fileColor === 'orange' ? 'bg-orange-600' :
                                fileColor === 'yellow' ? 'bg-yellow-600' :
                                fileColor === 'emerald' ? 'bg-emerald-600' :
                                fileColor === 'blue' ? 'bg-blue-600' :
                                fileColor === 'indigo' ? 'bg-indigo-600' :
                                fileColor === 'purple' ? 'bg-purple-600' :
                                'bg-pink-600'
                              }`} style={{ width: '100%' }} />
                            </div>
                            {currentlyScanning === file.id && estimatedTimeRemaining > 0 && (
                              <p className={`text-xs mt-1 ${textColor}`}>
                                ~{estimatedTimeRemaining}s left
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${
                          file.status === 'scanned' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            file.status === 'scanned' ? 'bg-emerald-600' : 'bg-gray-400'
                          }`} />
                          {file.status === 'scanned' ? 'Scanned' : 'Unscanned'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {file.pageCount ? `${file.pageCount}` : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {totalArea > 0 ? totalArea.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {totalIrrigatedArea > 0 ? totalIrrigatedArea.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {totalPlantedArea > 0 ? totalPlantedArea.toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {file.status === 'scanned' && file.inputTokens && file.outputTokens && file.estimatedCost ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Lightning weight="fill" className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-mono text-gray-700">
                              {(file.inputTokens / 1000).toFixed(1)}K
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChartBar weight="fill" className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-mono text-gray-700">
                              {(file.outputTokens / 1000).toFixed(1)}K
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollar weight="fill" className="w-3 h-3 text-emerald-600" />
                            <span className="text-xs font-mono text-gray-700">
                              ₱{(file.estimatedCost * 58).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {file.confidence !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                file.confidence >= 80 ? 'bg-emerald-500' : 
                                file.confidence >= 60 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${file.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-gray-600">{file.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip 
                          title="View" 
                          description="Open and view extracted table data"
                          icon={<Eye weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => onViewPdf(file)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                          >
                            <Eye weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        {file.status === 'scanned' && file.extractedData && (
                          <Tooltip 
                            title="Summary" 
                            description="View page-by-page breakdown of totals"
                            icon={<ChartLineUp weight="regular" className="w-4 h-4" />}
                          >
                            <button
                              onClick={() => setSummaryModal(file)}
                              className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                            >
                              <ChartLineUp weight="regular" className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}
                        <Tooltip 
                          title="Move" 
                          description="Move this file to another folder"
                          icon={<ArrowsDownUp weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => setMovePdfModal(file)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                          >
                            <ArrowsDownUp weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip 
                          title={file.status === 'scanned' ? 'Rescan' : 'Scan'} 
                          description={file.status === 'scanned' ? 'Re-extract data from this PDF' : 'Extract table data from this PDF'}
                          icon={<ScanSmiley weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => setScanOptionsModal(file)}
                            disabled={scanning.includes(file.id) || batchScanning}
                            className={`p-1.5 rounded hover:bg-gray-100 transition disabled:opacity-50 ${textColor}`}
                          >
                            <ScanSmiley weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <Tooltip 
                          title="Delete" 
                          description="Remove this file permanently"
                          icon={<Trash weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            onClick={() => deletePdf(file.id, file.name)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${textColor}`}
                          >
                            <Trash weight="regular" className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {visibleFolders.length === 0 && files.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FolderIcon weight="regular" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>This folder is empty</p>
          <p className="text-sm">Create a folder or upload PDFs to get started</p>
        </div>
      )}

      {deleteModal && (
        <DeleteFolderModal
          isOpen={true}
          onClose={() => setDeleteModal(null)}
          folderName={deleteModal.folderName}
          onConfirm={deleteFolder}
        />
      )}

      {moveModal && (
        <MoveFolderModal
          isOpen={true}
          onClose={() => setMoveModal(null)}
          folder={moveModal}
          allFolders={allFolders}
          onConfirm={moveFolder}
        />
      )}

      {summaryModal && (
        <SummaryModal
          isOpen={true}
          onClose={() => setSummaryModal(null)}
          file={summaryModal}
        />
      )}

      {movePdfModal && (
        <MovePdfModal
          isOpen={true}
          onClose={() => setMovePdfModal(null)}
          pdf={movePdfModal}
          allFolders={allFolders}
          onConfirm={movePdf}
        />
      )}

      {scanOptionsModal && (
        <ScanOptionsModal
          isOpen={true}
          onClose={() => setScanOptionsModal(null)}
          pdfName={scanOptionsModal.name}
          onConfirm={() => scanPdf(scanOptionsModal.id)}
        />
      )}
    </div>
  );
}