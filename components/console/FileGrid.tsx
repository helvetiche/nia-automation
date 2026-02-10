"use client";

import type { Folder, PdfFile } from "@/types";
import { Folder as FolderIcon } from "@phosphor-icons/react/dist/ssr";
import ContextMenu from "./ContextMenu";
import DeleteFolderModal from "./DeleteFolderModal";
import MoveFolderModal from "./MoveFolderModal";
import SummaryModal from "./SummaryModal";
import SummaryViewModal from "./SummaryViewModal";
import FileList from "./FileList";
import FileGridSkeleton from "./FileGridSkeleton";
import BulkMovePdfModal from "./BulkMovePdfModal";
import BulkDeleteModal from "./BulkDeleteModal";
import ReportConfigModal from "./ReportConfigModal";
import FileGridHeader from "./FileGridHeader";
import BulkActionsToolbar from "./BulkActionsToolbar";
import FolderCard from "./FolderCard";
import FileCard from "./FileCard";
import { useFileGridState } from "./hooks/useFileGridState";
import { useFileGridActions } from "./hooks/useFileGridActions";

interface FileGridProps {
  folders: Folder[];
  files: PdfFile[];
  currentFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onRefresh: () => void;
  onCreateFolder: () => void;
  onUploadFile: () => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  loading?: boolean;
  currentlyScanning: string | null;
  estimatedTimeRemaining: number;
  sidebarCollapsed?: boolean;
}

export default function FileGrid({
  folders,
  files,
  currentFolder,
  onSelectFolder,
  onRefresh,
  onCreateFolder,
  onUploadFile,
  viewMode,
  onViewModeChange,
  loading = false,
  currentlyScanning,
  estimatedTimeRemaining,
  sidebarCollapsed = false,
}: FileGridProps) {
  const state = useFileGridState();
  const actions = useFileGridActions({
    deletedFolders: state.deletedFolders,
    setDeletedFolders: state.setDeletedFolders,
    deletedPdfs: state.deletedPdfs,
    setDeletedPdfs: state.setDeletedPdfs,
    syncingFolders: state.syncingFolders,
    setSyncingFolders: state.setSyncingFolders,
    selectedItems: state.selectedItems,
    setSelectedItems: state.setSelectedItems,
    setIsSelectMode: state.setIsSelectMode,
    setBulkActionsMenu: state.setBulkActionsMenu,
    onRefresh,
  });

  const subfolders = folders.filter(
    (f) => f.parentId === currentFolder && !state.deletedFolders.includes(f.id),
  );

  const visibleFiles = files.filter((f) => !state.deletedPdfs.includes(f.id));

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(state.selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    state.setSelectedItems(newSelected);
  };

  const toggleSelectAllItems = (ids: string[]) => {
    const newSelected = new Set(state.selectedItems);
    const allSelected = ids.every((id) => newSelected.has(id));

    if (allSelected) {
      ids.forEach((id) => newSelected.delete(id));
    } else {
      ids.forEach((id) => newSelected.add(id));
    }
    state.setSelectedItems(newSelected);
  };

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    state.setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-6 relative"
      onContextMenu={openContextMenu}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(6, 78, 59, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(6, 78, 59, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "100px 100px",
        backgroundPosition: "0 0",
      }}
    >
      <FileGridHeader
        folders={folders}
        currentFolder={currentFolder}
        viewMode={viewMode}
        isSelectMode={state.isSelectMode}
        selectedCount={state.selectedItems.size}
        sidebarCollapsed={sidebarCollapsed}
        onSelectFolder={onSelectFolder}
        onViewModeChange={onViewModeChange}
        onToggleSelectMode={() => state.setIsSelectMode(!state.isSelectMode)}
      />

      {state.isSelectMode && state.selectedItems.size > 0 && (
        <div className="mb-4 flex justify-end">
          <BulkActionsToolbar
            isOpen={state.bulkActionsMenu}
            onClose={() => state.setBulkActionsMenu(!state.bulkActionsMenu)}
            onCreateReport={() => state.setBulkReportModal(true)}
            onDelete={() => state.setBulkDeleteModal(true)}
            onMove={() => state.setBulkMoveModal(true)}
          />
        </div>
      )}

      {viewMode === "table" ? (
        <FileList
          folders={subfolders}
          files={visibleFiles}
          allFolders={folders}
          onSelectFolder={onSelectFolder}
          onRefresh={onRefresh}
          isSelectMode={state.isSelectMode}
          selectedPdfs={state.selectedItems}
          onToggleSelectPdf={toggleSelectItem}
          onToggleSelectAllPdfs={toggleSelectAllItems}
          loading={loading}
          currentlyScanning={currentlyScanning}
          estimatedTimeRemaining={estimatedTimeRemaining}
        />
      ) : loading ? (
        <FileGridSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4">
            {subfolders.map((folder) => {
              const subfolderCount = folders.filter((f) => f.parentId === folder.id).length;
              const fileCount = files.filter((f) => f.folderId === folder.id).length;

              return (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  subfolderCount={subfolderCount}
                  fileCount={fileCount}
                  isSelectMode={state.isSelectMode}
                  isSelected={state.selectedItems.has(folder.id)}
                  isSyncing={state.syncingFolders.has(folder.id)}
                  onSelect={toggleSelectItem}
                  onOpen={onSelectFolder}
                  onMove={(folder) => state.setMoveModal(folder)}
                  onDelete={(folderId, folderName) =>
                    state.setDeleteModal({ folderId, folderName })
                  }
                  onSync={actions.syncFolder}
                />
              );
            })}

            {visibleFiles.map((file) => {
              const parentFolder = folders.find((f) => f.id === file.folderId);
              const fileColor = parentFolder?.color || "red";

              return (
                <FileCard
                  key={file.id}
                  file={file}
                  fileColor={fileColor}
                  isSelectMode={state.isSelectMode}
                  isSelected={state.selectedItems.has(file.id)}
                  onSelect={toggleSelectItem}
                  onDelete={actions.deletePdf}
                  onViewSummary={(file) => state.setSummaryModal(file)}
                  onViewExtracted={(file) => state.setSummaryViewModal(file)}
                />
              );
            })}

            {subfolders.length === 0 && visibleFiles.length === 0 && (
              <div className="col-span-4 text-center py-12 text-gray-500">
                <FolderIcon weight="regular" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>This folder is empty</p>
                <p className="text-sm">Create a folder or upload PDFs to get started</p>
              </div>
            )}
          </div>
        </>
      )}

      {state.contextMenu && (
        <ContextMenu
          x={state.contextMenu.x}
          y={state.contextMenu.y}
          onClose={() => state.setContextMenu(null)}
          onRefresh={onRefresh}
          onNewFolder={onCreateFolder}
          onUploadPdf={onUploadFile}
        />
      )}

      {state.deleteModal && (
        <DeleteFolderModal
          isOpen={true}
          onClose={() => state.setDeleteModal(null)}
          folderName={state.deleteModal.folderName}
          onConfirm={() => {
            actions.deleteFolder(state.deleteModal!.folderId, state.deleteModal!.folderName);
            state.setDeleteModal(null);
          }}
        />
      )}

      {state.moveModal && (
        <MoveFolderModal
          isOpen={true}
          onClose={() => state.setMoveModal(null)}
          folder={state.moveModal}
          allFolders={folders}
          onConfirm={(targetFolderId) => {
            actions.moveFolder(state.moveModal!, targetFolderId);
            state.setMoveModal(null);
          }}
        />
      )}

      {state.summaryModal && (
        <SummaryModal
          isOpen={true}
          onClose={() => state.setSummaryModal(null)}
          file={state.summaryModal}
        />
      )}

      {state.bulkMoveModal && (
        <BulkMovePdfModal
          isOpen={true}
          onClose={() => state.setBulkMoveModal(false)}
          allFolders={folders}
          onConfirm={(targetFolderId) => {
            actions.bulkMovePdfs(targetFolderId);
            state.setBulkMoveModal(false);
          }}
          selectedCount={state.selectedItems.size}
        />
      )}

      {state.bulkReportModal && (
        <ReportConfigModal
          onClose={() => state.setBulkReportModal(false)}
          onConfirm={(config) => {
            actions.generateBulkReport(config, visibleFiles, folders);
            state.setBulkReportModal(false);
          }}
        />
      )}

      {state.bulkDeleteModal && (
        <BulkDeleteModal
          isOpen={true}
          onClose={() => state.setBulkDeleteModal(false)}
          fileCount={
            Array.from(state.selectedItems).filter((id) => visibleFiles.some((f) => f.id === id))
              .length
          }
          onConfirm={async () => {
            await actions.bulkDeletePdfs(visibleFiles);
            state.setBulkDeleteModal(false);
          }}
        />
      )}

      {state.summaryViewModal && (
        <SummaryViewModal
          isOpen={true}
          onClose={() => state.setSummaryViewModal(null)}
          file={state.summaryViewModal}
        />
      )}
    </div>
  );
}
