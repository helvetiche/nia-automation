"use client";

import { useState, useEffect } from "react";
import type { Folder, PdfFile } from "@/types";
import type {
  FileListProps,
  NoticePopoverState,
  ConfirmDeleteState,
} from "./types";
import { useFileOperations } from "./hooks/useFileOperations";
import { useFolderOperations } from "./hooks/useFolderOperations";
import { useEditOperations } from "./hooks/useEditOperations";
import { useScanTimer } from "./hooks/useScanTimer";
import { useNoticeOperations } from "./hooks/useNoticeOperations";
import { useAssociationOperations } from "./hooks/useAssociationOperations";
import FolderTable from "./FolderTable";
import SummaryFilesTable from "./SummaryFilesTable";
import RegularFilesTable from "./RegularFilesTable";
import EmptyState from "./EmptyState";
import FileListSkeleton from "../FileListSkeleton";
import DeleteFolderModal from "../DeleteFolderModal";
import MoveFolderModal from "../MoveFolderModal";
import SummaryModal from "../SummaryModal";
import MovePdfModal from "../MovePdfModal";
import ScanOptionsModal from "../ScanOptionsModal";
import SummaryViewModal from "../SummaryViewModal";
import PdfPageModal from "../PdfPageModal";
import NoticePopover from "../NoticePopover";
import ConfirmPopover from "../ConfirmPopover";

export default function FileList({
  folders,
  files,
  allFolders,
  onSelectFolder,
  onRefresh,
  isSelectMode,
  selectedPdfs,
  onToggleSelectPdf,
  onToggleSelectAllPdfs,
  currentlyScanning,
  estimatedTimeRemaining,
  loading = false,
}: FileListProps) {
  const [deleteModal, setDeleteModal] = useState<{
    folderId: string;
    folderName: string;
  } | null>(null);
  const [moveModal, setMoveModal] = useState<Folder | null>(null);
  const [summaryModal, setSummaryModal] = useState<PdfFile | null>(null);
  const [summaryViewModal, setSummaryViewModal] = useState<PdfFile | null>(
    null,
  );
  const [pdfPageModal, setPdfPageModal] = useState<PdfFile | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(
    new Set(),
  );
  const [movePdfModal, setMovePdfModal] = useState<PdfFile | null>(null);
  const [scanOptionsModal, setScanOptionsModal] = useState<PdfFile | null>(
    null,
  );
  const [noticePopover, setNoticePopover] = useState<NoticePopoverState | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(
    null,
  );

  const {
    scanning,
    movedPdfs,
    deletedPdfs,
    localFiles,
    setLocalFiles,
    scanPdf,
    movePdf: movePdfOperation,
    deletePdf,
  } = useFileOperations(onRefresh);

  const {
    deletedFolders,
    movedFolders,
    syncingFolders,
    deleteFolder: deleteFolderOperation,
    moveFolder: moveFolderOperation,
    syncFolder,
  } = useFolderOperations(onRefresh);

  const {
    editingArea,
    editValue,
    setEditValue,
    editingName,
    editNameValue,
    setEditNameValue,
    startEditingArea,
    cancelEditingArea,
    saveAreaEdit,
    startEditingName,
    cancelEditingName,
    saveNameEdit,
  } = useEditOperations(onRefresh, setLocalFiles);

  const { elapsedTime } = useScanTimer(scanning, currentlyScanning);

  const { updateFolderNotice, updateFileNotice } =
    useNoticeOperations(onRefresh);

  const { addAssociation, deleteAssociation } = useAssociationOperations(
    setLocalFiles,
    expandedSummaries,
    setExpandedSummaries,
  );

  useEffect(() => {
    setLocalFiles(files);
  }, [files, setLocalFiles]);

  const toggleSummaryExpansion = (fileId: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedSummaries(newExpanded);
  };

  const openNoticePopover = (
    type: "folder" | "file" | "summary",
    id: string,
    currentNotice: string = "",
    anchorRef: React.RefObject<HTMLElement | null>,
    summaryId?: string,
  ) => {
    setNoticePopover({
      isOpen: true,
      type,
      id,
      summaryId,
      currentNotice,
      anchorRef,
    });
  };

  const saveNotice = (notice: string) => {
    if (!noticePopover) return;

    if (noticePopover.type === "folder") {
      updateFolderNotice(noticePopover.id, notice);
    } else {
      updateFileNotice(noticePopover.id, notice, noticePopover.summaryId);
    }
  };

  const openDeleteConfirm = (
    fileId: string,
    associationId: string,
    associationName: string,
    anchorRef: React.RefObject<HTMLElement | null>,
  ) => {
    setConfirmDelete({
      isOpen: true,
      fileId,
      associationId,
      associationName,
      anchorRef,
    });
  };

  const confirmDeleteAssociation = () => {
    if (confirmDelete) {
      deleteAssociation(confirmDelete.fileId, confirmDelete.associationId);
    }
  };

  const deleteFolder = async () => {
    if (!deleteModal) return;
    await deleteFolderOperation(deleteModal.folderId, deleteModal.folderName);
  };

  const moveFolder = async (targetFolderId: string | null) => {
    if (!moveModal) return;
    await moveFolderOperation(moveModal.id, targetFolderId, moveModal.name);
    setMoveModal(null);
  };

  const movePdf = async (targetFolderId: string) => {
    if (!movePdfModal) return;
    await movePdfOperation(movePdfModal.id, targetFolderId, movePdfModal.name);
    setMovePdfModal(null);
  };

  const visibleFolders = folders.filter((f) => !deletedFolders.includes(f.id));
  const summaryFiles = localFiles.filter(
    (file) =>
      !movedPdfs[file.id] &&
      !deletedPdfs.includes(file.id) &&
      file.status === "summary-scanned" &&
      file.summaryData &&
      file.summaryData.length > 0,
  );
  const regularFiles = localFiles.filter(
    (file) =>
      !movedPdfs[file.id] &&
      !deletedPdfs.includes(file.id) &&
      file.status !== "summary-scanned",
  );

  if (loading) {
    return <FileListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <FolderTable
        folders={visibleFolders}
        movedFolders={movedFolders}
        syncingFolders={syncingFolders}
        onSelectFolder={onSelectFolder}
        onSyncFolder={syncFolder}
        onMoveFolder={setMoveModal}
        onDeleteFolder={(folderId, folderName) =>
          setDeleteModal({ folderId, folderName })
        }
        onOpenNoticePopover={openNoticePopover}
      />

      <SummaryFilesTable
        files={summaryFiles}
        allFolders={allFolders}
        isSelectMode={isSelectMode}
        selectedPdfs={selectedPdfs}
        expandedSummaries={expandedSummaries}
        editingArea={editingArea}
        editValue={editValue}
        editingName={editingName}
        editNameValue={editNameValue}
        onToggleSelectPdf={onToggleSelectPdf}
        onToggleSelectAllPdfs={onToggleSelectAllPdfs}
        onToggleSummaryExpansion={toggleSummaryExpansion}
        onStartEditingArea={startEditingArea}
        onSaveAreaEdit={saveAreaEdit}
        onCancelEditingArea={cancelEditingArea}
        setEditValue={setEditValue}
        onStartEditingName={startEditingName}
        onSaveNameEdit={saveNameEdit}
        onCancelEditingName={cancelEditingName}
        setEditNameValue={setEditNameValue}
        onAddAssociation={addAssociation}
        onMovePdf={setMovePdfModal}
        onDeletePdf={deletePdf}
        onOpenNoticePopover={openNoticePopover}
        onOpenDeleteConfirm={openDeleteConfirm}
      />

      <RegularFilesTable
        files={regularFiles}
        allFolders={allFolders}
        isSelectMode={isSelectMode}
        selectedPdfs={selectedPdfs}
        scanning={scanning}
        currentlyScanning={currentlyScanning}
        elapsedTime={elapsedTime}
        estimatedTimeRemaining={estimatedTimeRemaining}
        onToggleSelectPdf={onToggleSelectPdf}
        onToggleSelectAllPdfs={onToggleSelectAllPdfs}
        onOpenSummaryModal={setSummaryModal}
        onMovePdf={setMovePdfModal}
        onDeletePdf={deletePdf}
        onOpenNoticePopover={openNoticePopover}
      />

      {visibleFolders.length === 0 &&
        summaryFiles.length === 0 &&
        regularFiles.length === 0 && <EmptyState />}

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
          onConfirm={(scanType, pageNumbers) =>
            scanPdf(scanOptionsModal.id, scanType, pageNumbers)
          }
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
          scannedPages={
            pdfPageModal.scanType === "summary"
              ? pdfPageModal.pageNumbers
              : undefined
          }
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

      {confirmDelete && (
        <ConfirmPopover
          isOpen={confirmDelete.isOpen}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAssociation}
          title="Delete Association?"
          message={`Are you sure you want to remove "${confirmDelete.associationName}"? This cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          anchorRef={confirmDelete.anchorRef}
        />
      )}
    </div>
  );
}
