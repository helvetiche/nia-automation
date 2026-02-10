"use client";

import { useState } from "react";
import {
  FilePdf,
  Check,
  FileText,
  Gauge,
  CurrencyDollar,
  Flag,
  Eye,
  ArrowsDownUp,
  Trash,
  ChartLineUp,
} from "@phosphor-icons/react";
import type { PdfFile, Folder } from "@/types";
import {
  COLOR_MAP,
  TEXT_COLOR_MAP,
  GRADIENT_HOVER_MAP,
  ITEMS_PER_PAGE,
} from "./constants";
import { calculateTotals, getRowClassName } from "./utils";
import Tooltip from "@/components/Tooltip";
import RowActionsMenu from "../RowActionsMenu";
import Pagination from "./Pagination";

interface RegularFilesTableProps {
  files: PdfFile[];
  allFolders: Folder[];
  isSelectMode: boolean;
  selectedPdfs: Set<string>;
  scanning: string[];
  currentlyScanning: string | null;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  onToggleSelectPdf: (id: string) => void;
  onToggleSelectAllPdfs: (ids: string[]) => void;
  onOpenSummaryModal: (file: PdfFile) => void;
  onMovePdf: (file: PdfFile) => void;
  onDeletePdf: (pdfId: string, pdfName: string) => void;
  onOpenNoticePopover: (
    type: "file",
    id: string,
    currentNotice: string,
    anchorRef: React.RefObject<HTMLElement | null>,
  ) => void;
}

export default function RegularFilesTable({
  files,
  allFolders,
  isSelectMode,
  selectedPdfs,
  scanning,
  currentlyScanning,
  elapsedTime,
  estimatedTimeRemaining,
  onToggleSelectPdf,
  onToggleSelectAllPdfs,
  onOpenSummaryModal,
  onMovePdf,
  onDeletePdf,
  onOpenNoticePopover,
}: RegularFilesTableProps) {
  const [regularPage, setRegularPage] = useState(1);

  const paginatedFiles = files.slice(
    (regularPage - 1) * ITEMS_PER_PAGE,
    regularPage * ITEMS_PER_PAGE,
  );
  const regularTotalPages = Math.ceil(files.length / ITEMS_PER_PAGE);

  if (files.length === 0) return null;

  return (
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
                <Check weight="regular" className="w-4 h-4" />
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
          {paginatedFiles.map((file) => {
            const parentFolder = allFolders.find((f) => f.id === file.folderId);
            const fileColor = parentFolder?.color || "red";
            const colorClass = COLOR_MAP[fileColor] || "bg-red-500";
            const textColor = TEXT_COLOR_MAP[fileColor] || "text-red-700";
            const regularNoticeRef = {
              current: null,
            } as React.RefObject<HTMLButtonElement | null>;

            const { totalArea } = calculateTotals(file);
            const hasNotice = Boolean(
              file.notice && file.notice.trim().length > 0,
            );
            const rowClassName = getRowClassName(
              hasNotice,
              fileColor,
              GRADIENT_HOVER_MAP,
            );

            const isScanning =
              currentlyScanning === file.id || scanning.includes(file.id);

            return (
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
                    <div
                      className={`w-8 h-8 rounded ${colorClass} flex items-center justify-center flex-shrink-0`}
                    >
                      <FilePdf
                        weight="regular"
                        className="w-4 h-4 text-white"
                      />
                    </div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isScanning ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${textColor}`}>
                            {Math.floor(elapsedTime / 60)}:
                            {(elapsedTime % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                        <div
                          className={`w-24 h-1.5 rounded-full overflow-hidden bg-${fileColor}-200`}
                        >
                          <div
                            className={`h-full animate-pulse bg-${fileColor}-600`}
                            style={{ width: "100%" }}
                          />
                        </div>
                        {currentlyScanning === file.id &&
                          estimatedTimeRemaining > 0 && (
                            <p className={`text-xs mt-1 ${textColor}`}>
                              ~{estimatedTimeRemaining}s left
                            </p>
                          )}
                      </div>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${
                        file.status === "scanned"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          file.status === "scanned"
                            ? "bg-emerald-600"
                            : "bg-gray-400"
                        }`}
                      />
                      {file.status === "scanned"
                        ? "Total Scanned"
                        : "Unscanned"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-gray-900">
                    {file.pageCount ? `${file.pageCount}` : "--"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-gray-900">
                    {totalArea > 0 ? totalArea.toFixed(2) : "--"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {file.status === "scanned" && file.estimatedCost ? (
                    <span className="text-xs font-mono text-gray-900">
                      ₱
                      {(file.estimatedCost * 58).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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
                            file.confidence >= 80
                              ? colorClass
                              : file.confidence >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${file.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-600">
                        {file.confidence}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip
                      title={hasNotice ? "View Notice" : "Add Notice"}
                      description={
                        hasNotice
                          ? file.notice || ""
                          : "Add a notice to this file"
                      }
                      icon={<Flag weight="regular" className="w-4 h-4" />}
                    >
                      <button
                        ref={regularNoticeRef}
                        onClick={() =>
                          onOpenNoticePopover(
                            "file",
                            file.id,
                            file.notice || "",
                            regularNoticeRef,
                          )
                        }
                        className={`p-1.5 rounded hover:bg-gray-100 transition ${hasNotice ? "text-orange-500" : textColor}`}
                      >
                        <Flag
                          weight={hasNotice ? "fill" : "regular"}
                          className="w-4 h-4"
                        />
                      </button>
                    </Tooltip>
                    <Tooltip
                      title="View"
                      description="Open and view extracted table data"
                      icon={<Eye weight="regular" className="w-4 h-4" />}
                    >
                      <button
                        onClick={() => {}}
                        disabled={true}
                        className="p-1.5 rounded opacity-50 cursor-not-allowed"
                      >
                        <Eye weight="regular" className="w-4 h-4" />
                      </button>
                    </Tooltip>
                    <RowActionsMenu
                      accentColor={fileColor}
                      actions={[
                        ...(file.status === "scanned" && file.extractedData
                          ? [
                              {
                                icon: (
                                  <ChartLineUp
                                    weight="regular"
                                    className="w-4 h-4"
                                  />
                                ),
                                label: "View Summary",
                                onClick: () => onOpenSummaryModal(file),
                              },
                            ]
                          : []),
                        {
                          icon: (
                            <ArrowsDownUp
                              weight="regular"
                              className="w-4 h-4"
                            />
                          ),
                          label: "Move File",
                          onClick: () => onMovePdf(file),
                        },
                        {
                          icon: <Trash weight="regular" className="w-4 h-4" />,
                          label: "Delete File",
                          onClick: () => onDeletePdf(file.id, file.name),
                          color: "text-red-600 hover:bg-red-50",
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
      <Pagination
        currentPage={regularPage}
        totalPages={regularTotalPages}
        onPageChange={setRegularPage}
      />
    </div>
  );
}
