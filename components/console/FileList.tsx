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
  CaretDown,
  CaretRight,
  FolderPlus,
  CheckCircle,
  Gauge,
  Leaf,
  Plant,
  ArrowsClockwise,
  CurrencyDollar,
  Flag
} from '@phosphor-icons/react';
import type { IconWeight } from '@phosphor-icons/react';
import { apiCall } from '@/lib/api/client';
import DeleteFolderModal from './DeleteFolderModal';
import MoveFolderModal from './MoveFolderModal';
import SummaryModal from './SummaryModal';
import SummaryViewModal from './SummaryViewModal';
import ScanOptionsModal from './ScanOptionsModal';
import Tooltip from '@/components/Tooltip';
import { useToast } from '@/components/ToastContainer';
import PdfPageModal from './PdfPageModal';
import MovePdfModal from './MovePdfModal';
import NoticePopover from './NoticePopover';
import RowActionsMenu from './RowActionsMenu';
import FileListSkeleton from './FileListSkeleton';

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
  loading?: boolean;
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

const GRADIENT_HOVER_MAP: Record<string, string> = {
  red: 'hover:bg-gradient-to-l hover:from-red-500/40 hover:to-transparent',
  orange: 'hover:bg-gradient-to-l hover:from-orange-500/40 hover:to-transparent',
  yellow: 'hover:bg-gradient-to-l hover:from-yellow-500/40 hover:to-transparent',
  emerald: 'hover:bg-gradient-to-l hover:from-emerald-500/40 hover:to-transparent',
  blue: 'hover:bg-gradient-to-l hover:from-blue-500/40 hover:to-transparent',
  indigo: 'hover:bg-gradient-to-l hover:from-indigo-500/40 hover:to-transparent',
  purple: 'hover:bg-gradient-to-l hover:from-purple-500/40 hover:to-transparent',
  pink: 'hover:bg-gradient-to-l hover:from-pink-500/40 hover:to-transparent',
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
  loading = false,
}: FileListProps) {
  const [scanning, setScanning] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ folderId: string; folderName: string } | null>(null);
  const [moveModal, setMoveModal] = useState<Folder | null>(null);
  const [deletedFolders, setDeletedFolders] = useState<string[]>([]);
  const [summaryModal, setSummaryModal] = useState<PdfFile | null>(null);
  const [summaryViewModal, setSummaryViewModal] = useState<PdfFile | null>(null);
  const [pdfPageModal, setPdfPageModal] = useState<PdfFile | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
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
  const [noticePopover, setNoticePopover] = useState<{
    isOpen: boolean;
    type: 'folder' | 'file' | 'summary';
    id: string;
    summaryId?: string;
    currentNotice?: string;
    anchorRef: React.RefObject<HTMLElement | null>;
  } | null>(null);
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

  const toggleSummaryExpansion = (fileId: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedSummaries(newExpanded);
  };

  const scanPdf = async (pdfId: string, scanType: 'total' | 'summary' = 'total', pageNumbers?: string) => {
    setScanning(prev => [...prev, pdfId]);
    
    try {
      const response = await apiCall('/api/files/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId, scanType, pageNumbers }),
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

  const updateFolderNotice = async (folderId: string, notice: string) => {
    try {
      const response = await apiCall(`/api/folders/${folderId}/notice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice }),
      });

      if (response.ok) {
        showToast('success', 'Notice Updated', notice ? 'Notice added successfully' : 'Notice removed');
        onRefresh();
      } else {
        showToast('error', 'Update failed', 'Could not update notice');
      }
    } catch (error) {
      console.error('folder notice update failed:', error);
      showToast('error', 'Update failed', 'Could not update notice');
    }
  };

  const updateFileNotice = async (fileId: string, notice: string, summaryId?: string) => {
    try {
      const response = await apiCall(`/api/files/${fileId}/notice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice, summaryId }),
      });

      if (response.ok) {
        showToast('success', 'Notice Updated', notice ? 'Notice added successfully' : 'Notice removed');
        onRefresh();
      } else {
        showToast('error', 'Update failed', 'Could not update notice');
      }
    } catch (error) {
      console.error('file notice update failed:', error);
      showToast('error', 'Update failed', 'Could not update notice');
    }
  };

  const openNoticePopover = (
    type: 'folder' | 'file' | 'summary',
    id: string,
    currentNotice: string = '',
    anchorRef: React.RefObject<HTMLElement | null>,
    summaryId?: string
  ) => {
    setNoticePopover({
      isOpen: true,
      type,
      id,
      summaryId,
      currentNotice,
      anchorRef
    });
  };

  const saveNotice = (notice: string) => {
    if (!noticePopover) return;

    if (noticePopover.type === 'folder') {
      updateFolderNotice(noticePopover.id, notice);
    } else {
      updateFileNotice(noticePopover.id, notice, noticePopover.summaryId);
    }
  };

  const visibleFolders = folders.filter(f => !deletedFolders.includes(f.id));
  const summaryFiles = files.filter(file => 
    !movedPdfs[file.id] && 
    !deletedPdfs.includes(file.id) && 
    file.status === 'summary-scanned' && 
    file.summaryData && 
    file.summaryData.length > 0
  );
  const regularFiles = files.filter(file => 
    !movedPdfs[file.id] && 
    !deletedPdfs.includes(file.id) && 
    file.status !== 'summary-scanned'
  );

  if (loading) {
    return <FileListSkeleton />;
  }

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
                const folderNoticeRef = { current: null } as React.RefObject<HTMLButtonElement | null>;
                
                const subfolderCount = allFolders.filter(f => f.parentId === folder.id).length;
                const fileCount = files.filter(f => f.folderId === folder.id).length;
                const folderTotals = {
                  totalArea: folder.totalArea || 0,
                  totalIrrigatedArea: folder.totalIrrigatedArea || 0,
                  totalPlantedArea: folder.totalPlantedArea || 0
                };

                const hasNotice = folder.notice && folder.notice.trim().length > 0;
                const rowClassName = hasNotice 
                  ? `transition bg-gradient-to-l from-orange-100/60 to-transparent hover:from-orange-200/80 hover:to-transparent`
                  : `transition ${GRADIENT_HOVER_MAP[folder.color || 'blue'] || 'hover:bg-gradient-to-l hover:from-blue-500/40 hover:to-transparent'}`;
                
                return (
                  <tr 
                    key={folder.id} 
                    className={`${rowClassName} cursor-pointer`}
                    onDoubleClick={() => onSelectFolder(folder.id)}
                  >
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
                          title={hasNotice ? "View Notice" : "Add Notice"}
                          description={hasNotice ? folder.notice || '' : "Add a notice to this folder"}
                          icon={<Flag weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            ref={folderNoticeRef}
                            onClick={() => openNoticePopover('folder', folder.id, folder.notice || '', folderNoticeRef)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${hasNotice ? 'text-orange-500' : textColor}`}
                          >
                            <Flag weight={hasNotice ? "fill" : "regular"} className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <RowActionsMenu
                          accentColor={folder.color || 'blue'}
                          actions={[
                            {
                              icon: <ArrowsClockwise weight="regular" className="w-4 h-4" />,
                              label: 'Sync Totals',
                              onClick: () => syncFolder(folder.id, folder.name),
                              disabled: syncingFolders.has(folder.id),
                            },
                            {
                              icon: <FolderOpen weight="regular" className="w-4 h-4" />,
                              label: 'Open Folder',
                              onClick: () => onSelectFolder(folder.id),
                            },
                            {
                              icon: <ArrowsDownUp weight="regular" className="w-4 h-4" />,
                              label: 'Move Folder',
                              onClick: () => setMoveModal(folder),
                            },
                            {
                              icon: <Trash weight="regular" className="w-4 h-4" />,
                              label: 'Delete Folder',
                              onClick: () => setDeleteModal({ folderId: folder.id, folderName: folder.name }),
                              color: 'text-red-600 hover:bg-red-50',
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {summaryFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Summary Scanned Files</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isSelectMode && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={summaryFiles.length > 0 && summaryFiles.every(file => selectedPdfs.has(file.id)) ? true : false}
                      onChange={() => {
                        const pdfIds = summaryFiles.map(file => file.id);
                        onToggleSelectAllPdfs(pdfIds);
                      }}
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
                    <Leaf weight="regular" className="w-4 h-4" />
                    Associations
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
              {summaryFiles.flatMap((file) => {
                const parentFolder = allFolders.find(f => f.id === file.folderId);
                const fileColor = parentFolder?.color || 'red';
                const colorClass = COLOR_MAP[fileColor] || 'bg-red-500';
                const textColor = TEXT_COLOR_MAP[fileColor] || 'text-red-700';
                const summaryNoticeRef = { current: null } as React.RefObject<HTMLButtonElement | null>;

                const hasNotice = file.notice && file.notice.trim().length > 0;
                const rowClassName = hasNotice 
                  ? `transition bg-gradient-to-l from-orange-100/60 to-transparent hover:from-orange-200/80 hover:to-transparent`
                  : `transition ${GRADIENT_HOVER_MAP[fileColor] || 'hover:bg-gradient-to-l hover:from-red-500/40 hover:to-transparent'}`;
                
                const mainRow = (
                  <tr key={file.id} className={rowClassName}>
                    {isSelectMode && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPdfs.has(file.id)}
                          onChange={() => onToggleSelectPdf(file.id)}
                          className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSummaryExpansion(file.id)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                        >
                          {expandedSummaries.has(file.id) ? (
                            <CaretDown weight="regular" className="w-4 h-4 text-gray-600" />
                          ) : (
                            <CaretRight weight="regular" className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <div className={`w-8 h-8 rounded ${colorClass} flex items-center justify-center flex-shrink-0`}>
                          <FilePdf weight="regular" className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {file.summaryData?.length || 0} Associations
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-900">
                        {file.summaryData ? file.summaryData.reduce((sum, assoc) => sum + assoc.totalArea, 0).toFixed(2) : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {file.inputTokens && file.outputTokens && file.estimatedCost ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <ChartBar weight="fill" className={`w-3 h-3 ${
                              fileColor === 'red' ? 'text-red-600' :
                              fileColor === 'orange' ? 'text-orange-600' :
                              fileColor === 'yellow' ? 'text-yellow-600' :
                              fileColor === 'emerald' ? 'text-emerald-600' :
                              fileColor === 'blue' ? 'text-blue-600' :
                              fileColor === 'indigo' ? 'text-indigo-600' :
                              fileColor === 'purple' ? 'text-purple-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs font-mono text-gray-700">
                              {file.inputTokens.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChartBar weight="fill" className={`w-3 h-3 ${
                              fileColor === 'red' ? 'text-red-600' :
                              fileColor === 'orange' ? 'text-orange-600' :
                              fileColor === 'yellow' ? 'text-yellow-600' :
                              fileColor === 'emerald' ? 'text-emerald-600' :
                              fileColor === 'blue' ? 'text-blue-600' :
                              fileColor === 'indigo' ? 'text-indigo-600' :
                              fileColor === 'purple' ? 'text-purple-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs font-mono text-gray-700">
                              {file.outputTokens.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollar weight="fill" className={`w-3 h-3 ${
                              fileColor === 'red' ? 'text-red-600' :
                              fileColor === 'orange' ? 'text-orange-600' :
                              fileColor === 'yellow' ? 'text-yellow-600' :
                              fileColor === 'emerald' ? 'text-emerald-600' :
                              fileColor === 'blue' ? 'text-blue-600' :
                              fileColor === 'indigo' ? 'text-indigo-600' :
                              fileColor === 'purple' ? 'text-purple-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs font-mono text-gray-700">
                              ₱{(file.estimatedCost * 58).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
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
                                file.confidence >= 80 ? (
                                  fileColor === 'red' ? 'bg-red-500' :
                                  fileColor === 'orange' ? 'bg-orange-500' :
                                  fileColor === 'yellow' ? 'bg-yellow-500' :
                                  fileColor === 'emerald' ? 'bg-emerald-500' :
                                  fileColor === 'blue' ? 'bg-blue-500' :
                                  fileColor === 'indigo' ? 'bg-indigo-500' :
                                  fileColor === 'purple' ? 'bg-purple-500' :
                                  'bg-pink-500'
                                ) : file.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
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
                          title={hasNotice ? "View Notice" : "Add Notice"}
                          description={hasNotice ? file.notice || '' : "Add a notice to this file"}
                          icon={<Flag weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            ref={summaryNoticeRef}
                            onClick={() => openNoticePopover('file', file.id, file.notice || '', summaryNoticeRef)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${hasNotice ? 'text-orange-500' : textColor}`}
                          >
                            <Flag weight={hasNotice ? "fill" : "regular"} className="w-4 h-4" />
                          </button>
                        </Tooltip>
                        <RowActionsMenu
                          accentColor={fileColor}
                          actions={[
                            {
                              icon: <Eye weight="regular" className="w-4 h-4" />,
                              label: 'View Associations',
                              onClick: () => setSummaryViewModal(file),
                            },
                            {
                              icon: <FilePdf weight="regular" className="w-4 h-4" />,
                              label: 'View Pages',
                              onClick: () => setPdfPageModal(file),
                            },
                            {
                              icon: <ArrowsDownUp weight="regular" className="w-4 h-4" />,
                              label: 'Move File',
                              onClick: () => setMovePdfModal(file),
                            },
                            {
                              icon: <ScanSmiley weight="regular" className="w-4 h-4" />,
                              label: 'Rescan',
                              onClick: () => setScanOptionsModal(file),
                              disabled: scanning.includes(file.id) || batchScanning,
                            },
                            {
                              icon: <Trash weight="regular" className="w-4 h-4" />,
                              label: 'Delete File',
                              onClick: () => deletePdf(file.id, file.name),
                              color: 'text-red-600 hover:bg-red-50',
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );

                const subRows = file.summaryData && expandedSummaries.has(file.id) 
                  ? file.summaryData.map((association, index) => {
                      const associationNoticeRef = { current: null } as React.RefObject<HTMLButtonElement | null>;
                      const hasAssociationNotice = association.notice && association.notice.trim().length > 0;
                      const subRowClassName = hasAssociationNotice 
                        ? `bg-gradient-to-l from-orange-100/40 to-gray-50 hover:from-orange-200/60 hover:to-gray-100 transition`
                        : `bg-gray-50 hover:bg-gray-100 transition`;

                      return (
                        <tr key={`${file.id}-sub-${index}`} className={subRowClassName}>
                          {isSelectMode && (
                            <td className="px-4 py-2"></td>
                          )}
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-3 pl-8">
                              <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                                fileColor === 'red' ? 'bg-red-100' :
                                fileColor === 'orange' ? 'bg-orange-100' :
                                fileColor === 'yellow' ? 'bg-yellow-100' :
                                fileColor === 'emerald' ? 'bg-emerald-100' :
                                fileColor === 'blue' ? 'bg-blue-100' :
                                fileColor === 'indigo' ? 'bg-indigo-100' :
                                fileColor === 'purple' ? 'bg-purple-100' :
                                'bg-pink-100'
                              }`}>
                                <Leaf weight="regular" className={`w-3 h-3 ${
                                  fileColor === 'red' ? 'text-red-600' :
                                  fileColor === 'orange' ? 'text-orange-600' :
                                  fileColor === 'yellow' ? 'text-yellow-600' :
                                  fileColor === 'emerald' ? 'text-emerald-600' :
                                  fileColor === 'blue' ? 'text-blue-600' :
                                  fileColor === 'indigo' ? 'text-indigo-600' :
                                  fileColor === 'purple' ? 'text-purple-600' :
                                  'text-pink-600'
                                }`} />
                              </div>
                              <p className="text-sm font-medium text-gray-700">{association.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${
                              fileColor === 'red' ? 'bg-red-50 text-red-700' :
                              fileColor === 'orange' ? 'bg-orange-50 text-orange-700' :
                              fileColor === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                              fileColor === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                              fileColor === 'blue' ? 'bg-blue-50 text-blue-700' :
                              fileColor === 'indigo' ? 'bg-indigo-50 text-indigo-700' :
                              fileColor === 'purple' ? 'bg-purple-50 text-purple-700' :
                              'bg-pink-50 text-pink-700'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                fileColor === 'red' ? 'bg-red-500' :
                                fileColor === 'orange' ? 'bg-orange-500' :
                                fileColor === 'yellow' ? 'bg-yellow-500' :
                                fileColor === 'emerald' ? 'bg-emerald-500' :
                                fileColor === 'blue' ? 'bg-blue-500' :
                                fileColor === 'indigo' ? 'bg-indigo-500' :
                                fileColor === 'purple' ? 'bg-purple-500' :
                                'bg-pink-500'
                              }`} />
                              Association
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="font-mono text-gray-900 text-sm">
                              {association.totalArea.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="font-mono text-gray-700 text-sm">
                              {association.usage}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    association.confidence >= 80 ? (
                                      fileColor === 'red' ? 'bg-red-500' :
                                      fileColor === 'orange' ? 'bg-orange-500' :
                                      fileColor === 'yellow' ? 'bg-yellow-500' :
                                      fileColor === 'emerald' ? 'bg-emerald-500' :
                                      fileColor === 'blue' ? 'bg-blue-500' :
                                      fileColor === 'indigo' ? 'bg-indigo-500' :
                                      fileColor === 'purple' ? 'bg-purple-500' :
                                      'bg-pink-500'
                                    ) : association.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${association.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-gray-600">{association.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end">
                              <Tooltip 
                                title={hasAssociationNotice ? "View Notice" : "Add Notice"}
                                description={hasAssociationNotice ? association.notice || '' : "Add a notice to this association"}
                                icon={<Flag weight="regular" className="w-4 h-4" />}
                              >
                                <button
                                  ref={associationNoticeRef}
                                  onClick={() => openNoticePopover('summary', file.id, association.notice || '', associationNoticeRef, association.id)}
                                  className={`p-1.5 rounded hover:bg-gray-100 transition ${hasAssociationNotice ? 'text-orange-500' : textColor}`}
                                >
                                  <Flag weight={hasAssociationNotice ? "fill" : "regular"} className="w-3 h-3" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : [];

                return [mainRow, ...subRows];
              })}
            </tbody>
          </table>
        </div>
      )}

      {regularFiles.length > 0 && (
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
                      checked={regularFiles.length > 0 && regularFiles.every(file => selectedPdfs.has(file.id)) ? true : false}
                      onChange={() => {
                        const pdfIds = regularFiles.map(file => file.id);
                        onToggleSelectAllPdfs(pdfIds);
                      }}
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
              {regularFiles.map((file) => {
                const parentFolder = allFolders.find(f => f.id === file.folderId);
                const fileColor = parentFolder?.color || 'red';
                const colorClass = COLOR_MAP[fileColor] || 'bg-red-500';
                const textColor = TEXT_COLOR_MAP[fileColor] || 'text-red-700';
                const regularNoticeRef = { current: null } as React.RefObject<HTMLButtonElement | null>;
                
                const { totalArea, totalIrrigatedArea, totalPlantedArea } = calculateTotals(file);

                const hasNotice = file.notice && file.notice.trim().length > 0;
                const rowClassName = hasNotice 
                  ? `transition bg-gradient-to-l from-orange-100/60 to-transparent hover:from-orange-200/80 hover:to-transparent`
                  : `transition ${GRADIENT_HOVER_MAP[fileColor] || 'hover:bg-gradient-to-l hover:from-red-500/40 hover:to-transparent'}`;
                
                return (
                  <tr key={file.id} className={rowClassName}>
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
                          {file.status === 'scanned' ? 'Total Scanned' : 'Unscanned'}
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
                      {(file.status === 'scanned') && file.inputTokens && file.outputTokens && file.estimatedCost ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <ChartBar weight="fill" className={`w-3 h-3 ${
                              fileColor === 'red' ? 'text-red-600' :
                              fileColor === 'orange' ? 'text-orange-600' :
                              fileColor === 'yellow' ? 'text-yellow-600' :
                              fileColor === 'emerald' ? 'text-emerald-600' :
                              fileColor === 'blue' ? 'text-blue-600' :
                              fileColor === 'indigo' ? 'text-indigo-600' :
                              fileColor === 'purple' ? 'text-purple-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs font-mono text-gray-700">
                              {file.inputTokens.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ChartBar weight="fill" className={`w-3 h-3 ${
                              fileColor === 'red' ? 'text-red-600' :
                              fileColor === 'orange' ? 'text-orange-600' :
                              fileColor === 'yellow' ? 'text-yellow-600' :
                              fileColor === 'emerald' ? 'text-emerald-600' :
                              fileColor === 'blue' ? 'text-blue-600' :
                              fileColor === 'indigo' ? 'text-indigo-600' :
                              fileColor === 'purple' ? 'text-purple-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs font-mono text-gray-700">
                              {file.outputTokens.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollar weight="fill" className={`w-3 h-3 ${
                              fileColor === 'red' ? 'text-red-600' :
                              fileColor === 'orange' ? 'text-orange-600' :
                              fileColor === 'yellow' ? 'text-yellow-600' :
                              fileColor === 'emerald' ? 'text-emerald-600' :
                              fileColor === 'blue' ? 'text-blue-600' :
                              fileColor === 'indigo' ? 'text-indigo-600' :
                              fileColor === 'purple' ? 'text-purple-600' :
                              'text-pink-600'
                            }`} />
                            <span className="text-xs font-mono text-gray-700">
                              ₱{(file.estimatedCost * 58).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
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
                                file.confidence >= 80 ? (
                                  fileColor === 'red' ? 'bg-red-500' :
                                  fileColor === 'orange' ? 'bg-orange-500' :
                                  fileColor === 'yellow' ? 'bg-yellow-500' :
                                  fileColor === 'emerald' ? 'bg-emerald-500' :
                                  fileColor === 'blue' ? 'bg-blue-500' :
                                  fileColor === 'indigo' ? 'bg-indigo-500' :
                                  fileColor === 'purple' ? 'bg-purple-500' :
                                  'bg-pink-500'
                                ) : file.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
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
                          title={hasNotice ? "View Notice" : "Add Notice"}
                          description={hasNotice ? file.notice || '' : "Add a notice to this file"}
                          icon={<Flag weight="regular" className="w-4 h-4" />}
                        >
                          <button
                            ref={regularNoticeRef}
                            onClick={() => openNoticePopover('file', file.id, file.notice || '', regularNoticeRef)}
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${hasNotice ? 'text-orange-500' : textColor}`}
                          >
                            <Flag weight={hasNotice ? "fill" : "regular"} className="w-4 h-4" />
                          </button>
                        </Tooltip>
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
                        <RowActionsMenu
                          accentColor={fileColor}
                          actions={[
                            ...(file.status === 'scanned' && file.extractedData ? [{
                              icon: <ChartLineUp weight="regular" className="w-4 h-4" />,
                              label: 'View Summary',
                              onClick: () => setSummaryModal(file),
                            }] : []),
                            {
                              icon: <FilePdf weight="regular" className="w-4 h-4" />,
                              label: 'View Pages',
                              onClick: () => setPdfPageModal(file),
                            },
                            {
                              icon: <ArrowsDownUp weight="regular" className="w-4 h-4" />,
                              label: 'Move File',
                              onClick: () => setMovePdfModal(file),
                            },
                            {
                              icon: <ScanSmiley weight="regular" className="w-4 h-4" />,
                              label: file.status === 'scanned' ? 'Rescan' : 'Scan',
                              onClick: () => setScanOptionsModal(file),
                              disabled: scanning.includes(file.id) || batchScanning,
                            },
                            {
                              icon: <Trash weight="regular" className="w-4 h-4" />,
                              label: 'Delete File',
                              onClick: () => deletePdf(file.id, file.name),
                              color: 'text-red-600 hover:bg-red-50',
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {visibleFolders.length === 0 && summaryFiles.length === 0 && regularFiles.length === 0 && (
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
          onConfirm={(scanType, pageNumbers) => scanPdf(scanOptionsModal.id, scanType, pageNumbers)}
        />
      )}

      {summaryViewModal && (
        <SummaryViewModal
          isOpen={true}
          onClose={() => setSummaryViewModal(null)}
          file={summaryViewModal}
        />
      )}

      {pdfPageModal && (
        <PdfPageModal
          isOpen={true}
          onClose={() => setPdfPageModal(null)}
          pdfUrl={`/api/files/${pdfPageModal.id}/pdf`}
          scannedPages={pdfPageModal.scanType === 'summary' ? 
            pdfPageModal.pageNumbers : undefined}
          fileName={pdfPageModal.name}
        />
      )}

      {noticePopover && (
        <NoticePopover
          isOpen={noticePopover.isOpen}
          onClose={() => setNoticePopover(null)}
          onSave={saveNotice}
          currentNotice={noticePopover.currentNotice}
          anchorRef={noticePopover.anchorRef}
        />
      )}
    </div>
  );
}