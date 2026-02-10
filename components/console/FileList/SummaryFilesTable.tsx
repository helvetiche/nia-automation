"use client";

import { useState } from "react";
import { FilePdf, Leaf, Gauge, CurrencyDollar } from "@phosphor-icons/react";
import type { PdfFile, Folder } from "@/types";
import { ITEMS_PER_PAGE } from "./constants";
import Pagination from "./Pagination";
import SummaryFileRow from "./SummaryFileRow";
import type { EditingAreaState, EditingNameState } from "./types";

interface SummaryFilesTableProps {
  files: PdfFile[];
  allFolders: Folder[];
  isSelectMode: boolean;
  selectedPdfs: Set<string>;
  expandedSummaries: Set<string>;
  editingArea: EditingAreaState | null;
  editValue: string;
  editingName: EditingNameState | null;
  editNameValue: string;
  onToggleSelectPdf: (id: string) => void;
  onToggleSelectAllPdfs: (ids: string[]) => void;
  onToggleSummaryExpansion: (fileId: string) => void;
  onStartEditingArea: (
    fileId: string,
    currentValue: number,
    associationId?: string,
  ) => void;
  onSaveAreaEdit: () => void;
  onCancelEditingArea: () => void;
  setEditValue: (value: string) => void;
  onStartEditingName: (
    fileId: string,
    currentValue: string,
    associationId?: string,
  ) => void;
  onSaveNameEdit: () => void;
  onCancelEditingName: () => void;
  setEditNameValue: (value: string) => void;
  onAddAssociation: (fileId: string) => void;
  onMovePdf: (file: PdfFile) => void;
  onDeletePdf: (pdfId: string, pdfName: string) => void;
  onOpenNoticePopover: (
    type: "file" | "summary",
    id: string,
    currentNotice: string,
    anchorRef: React.RefObject<HTMLElement | null>,
    summaryId?: string,
  ) => void;
  onOpenDeleteConfirm: (
    fileId: string,
    associationId: string,
    associationName: string,
    anchorRef: React.RefObject<HTMLElement | null>,
  ) => void;
}

export default function SummaryFilesTable({
  files,
  allFolders,
  isSelectMode,
  selectedPdfs,
  expandedSummaries,
  editingArea,
  editValue,
  editingName,
  editNameValue,
  onToggleSelectPdf,
  onToggleSelectAllPdfs,
  onToggleSummaryExpansion,
  onStartEditingArea,
  onSaveAreaEdit,
  onCancelEditingArea,
  setEditValue,
  onStartEditingName,
  onSaveNameEdit,
  onCancelEditingName,
  setEditNameValue,
  onAddAssociation,
  onMovePdf,
  onDeletePdf,
  onOpenNoticePopover,
  onOpenDeleteConfirm,
}: SummaryFilesTableProps) {
  const [summaryPage, setSummaryPage] = useState(1);

  const paginatedFiles = files.slice(
    (summaryPage - 1) * ITEMS_PER_PAGE,
    summaryPage * ITEMS_PER_PAGE,
  );
  const summaryTotalPages = Math.ceil(files.length / ITEMS_PER_PAGE);

  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Summary Scanned Files
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {isSelectMode && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={
                    files.length > 0 &&
                    files.every((file) => selectedPdfs.has(file.id))
                  }
                  onChange={() => {
                    const pdfIds = files.map((file) => file.id);
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
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedFiles.flatMap((file) => (
            <SummaryFileRow
              key={file.id}
              file={file}
              allFolders={allFolders}
              isSelectMode={isSelectMode}
              selectedPdfs={selectedPdfs}
              expandedSummaries={expandedSummaries}
              editingArea={editingArea}
              editValue={editValue}
              editingName={editingName}
              editNameValue={editNameValue}
              onToggleSelectPdf={onToggleSelectPdf}
              onToggleSummaryExpansion={onToggleSummaryExpansion}
              onStartEditingArea={onStartEditingArea}
              onSaveAreaEdit={onSaveAreaEdit}
              onCancelEditingArea={onCancelEditingArea}
              setEditValue={setEditValue}
              onStartEditingName={onStartEditingName}
              onSaveNameEdit={onSaveNameEdit}
              onCancelEditingName={onCancelEditingName}
              setEditNameValue={setEditNameValue}
              onAddAssociation={onAddAssociation}
              onMovePdf={onMovePdf}
              onDeletePdf={onDeletePdf}
              onOpenNoticePopover={onOpenNoticePopover}
              onOpenDeleteConfirm={onOpenDeleteConfirm}
            />
          ))}
        </tbody>
      </table>
      <Pagination
        currentPage={summaryPage}
        totalPages={summaryTotalPages}
        onPageChange={setSummaryPage}
      />
    </div>
  );
}
