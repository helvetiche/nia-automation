import { useState } from "react";
import type { Folder, PdfFile } from "@/types";

export const useFileGridState = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  
  const [deleteModal, setDeleteModal] = useState<{
    folderId: string;
    folderName: string;
  } | null>(null);
  
  const [moveModal, setMoveModal] = useState<Folder | null>(null);
  const [deletedFolders, setDeletedFolders] = useState<string[]>([]);
  const [summaryModal, setSummaryModal] = useState<PdfFile | null>(null);
  const [summaryViewModal, setSummaryViewModal] = useState<PdfFile | null>(null);
  const [deletedPdfs, setDeletedPdfs] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionsMenu, setBulkActionsMenu] = useState(false);
  const [bulkMoveModal, setBulkMoveModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkReportModal, setBulkReportModal] = useState(false);
  const [syncingFolders, setSyncingFolders] = useState<Set<string>>(new Set());

  return {
    contextMenu,
    setContextMenu,
    deleteModal,
    setDeleteModal,
    moveModal,
    setMoveModal,
    deletedFolders,
    setDeletedFolders,
    summaryModal,
    setSummaryModal,
    summaryViewModal,
    setSummaryViewModal,
    deletedPdfs,
    setDeletedPdfs,
    isSelectMode,
    setIsSelectMode,
    selectedItems,
    setSelectedItems,
    bulkActionsMenu,
    setBulkActionsMenu,
    bulkMoveModal,
    setBulkMoveModal,
    bulkDeleteModal,
    setBulkDeleteModal,
    bulkReportModal,
    setBulkReportModal,
    syncingFolders,
    setSyncingFolders,
  };
};
