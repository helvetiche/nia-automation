"use client";

import {
  FilePdf,
  CaretDown,
  CaretRight,
  PencilSimple,
  Check,
  X as XIcon,
  Flag,
  Leaf,
  ArrowsDownUp,
  Trash,
} from "@phosphor-icons/react";
import type { PdfFile, Folder } from "@/types";
import { COLOR_MAP, TEXT_COLOR_MAP, GRADIENT_HOVER_MAP } from "./constants";
import { getRowClassName } from "./utils";
import Tooltip from "@/components/Tooltip";
import RowActionsMenu from "../RowActionsMenu";
import type { EditingAreaState, EditingNameState } from "./types";

interface SummaryFileRowProps {
  file: PdfFile;
  allFolders: Folder[];
  isSelectMode: boolean;
  selectedPdfs: Set<string>;
  expandedSummaries: Set<string>;
  editingArea: EditingAreaState | null;
  editValue: string;
  editingName: EditingNameState | null;
  editNameValue: string;
  onToggleSelectPdf: (id: string) => void;
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

export default function SummaryFileRow({
  file,
  allFolders,
  isSelectMode,
  selectedPdfs,
  expandedSummaries,
  editingArea,
  editValue,
  editingName,
  editNameValue,
  onToggleSelectPdf,
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
}: SummaryFileRowProps) {
  const parentFolder = allFolders.find((f) => f.id === file.folderId);
  const fileColor = parentFolder?.color || "red";
  const colorClass = COLOR_MAP[fileColor] || "bg-red-500";
  const textColor = TEXT_COLOR_MAP[fileColor] || "text-red-700";
  const summaryNoticeRef = {
    current: null,
  } as React.RefObject<HTMLButtonElement | null>;

  const hasNotice = Boolean(file.notice && file.notice.trim().length > 0);
  const rowClassName = getRowClassName(
    hasNotice,
    fileColor,
    GRADIENT_HOVER_MAP,
  );

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
            onClick={() => onToggleSummaryExpansion(file.id)}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            {expandedSummaries.has(file.id) ? (
              <CaretDown weight="regular" className="w-4 h-4 text-gray-600" />
            ) : (
              <CaretRight weight="regular" className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <div
            className={`w-8 h-8 rounded ${colorClass} flex items-center justify-center flex-shrink-0`}
          >
            <FilePdf weight="regular" className="w-4 h-4 text-white" />
          </div>
          {editingName?.fileId === file.id && !editingName.associationId ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                className="px-2 py-1 text-sm font-medium border border-emerald-500 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                autoFocus={true}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveNameEdit();
                  if (e.key === "Escape") onCancelEditingName();
                }}
              />
              <button
                onClick={onSaveNameEdit}
                className="p-1 rounded hover:bg-emerald-100 transition text-emerald-600"
              >
                <Check weight="bold" className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEditingName}
                className="p-1 rounded hover:bg-gray-100 transition text-gray-600"
              >
                <XIcon weight="bold" className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">{file.name}</p>
              <button
                onClick={() => onStartEditingName(file.id, file.name)}
                className={`p-1 rounded hover:bg-gray-100 transition ${textColor}`}
              >
                <PencilSimple weight="regular" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-gray-900">
          {file.summaryData?.length || 0} Associations
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {editingArea?.fileId === file.id && !editingArea.associationId ? (
            <>
              <input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-24 px-2 py-1 text-sm font-mono border border-emerald-500 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                autoFocus={true}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveAreaEdit();
                  if (e.key === "Escape") onCancelEditingArea();
                }}
              />
              <button
                onClick={onSaveAreaEdit}
                className="p-1 rounded hover:bg-emerald-100 transition text-emerald-600"
              >
                <Check weight="bold" className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelEditingArea}
                className="p-1 rounded hover:bg-gray-100 transition text-gray-600"
              >
                <XIcon weight="bold" className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <span className="font-mono text-gray-900">
                {file.summaryData
                  ? file.summaryData
                      .reduce((sum, assoc) => sum + assoc.totalArea, 0)
                      .toFixed(2)
                  : "--"}
              </span>
              {file.summaryData && (
                <button
                  onClick={() =>
                    onStartEditingArea(
                      file.id,
                      file.summaryData!.reduce(
                        (sum, assoc) => sum + assoc.totalArea,
                        0,
                      ),
                    )
                  }
                  className={`p-1 rounded hover:bg-gray-100 transition ${textColor}`}
                >
                  <PencilSimple weight="regular" className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {file.estimatedCost ? (
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
              hasNotice ? file.notice || "" : "Add a notice to this file"
            }
            icon={<Flag weight="regular" className="w-4 h-4" />}
          >
            <button
              ref={summaryNoticeRef}
              onClick={() =>
                onOpenNoticePopover(
                  "file",
                  file.id,
                  file.notice || "",
                  summaryNoticeRef,
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
          <RowActionsMenu
            accentColor={fileColor}
            actions={[
              {
                icon: <Leaf weight="regular" className="w-4 h-4" />,
                label: "Add Association",
                onClick: () => onAddAssociation(file.id),
              },
              {
                icon: <ArrowsDownUp weight="regular" className="w-4 h-4" />,
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

  const subRows =
    file.summaryData && expandedSummaries.has(file.id)
      ? file.summaryData.map((association, index) => {
          const associationNoticeRef = {
            current: null,
          } as React.RefObject<HTMLButtonElement | null>;
          const deleteButtonRef = {
            current: null,
          } as React.RefObject<HTMLButtonElement | null>;
          const hasAssociationNotice = Boolean(
            association.notice && association.notice.trim().length > 0,
          );
          const subRowClassName = hasAssociationNotice
            ? "bg-gradient-to-l from-orange-100/40 to-gray-50 hover:from-orange-200/60 hover:to-gray-100 transition"
            : "bg-gray-50 hover:bg-gray-100 transition";

          return (
            <tr key={`${file.id}-sub-${index}`} className={subRowClassName}>
              {isSelectMode && <td className="px-4 py-2"></td>}
              <td className="px-4 py-2">
                <div className="flex items-center gap-3 pl-8">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-${fileColor}-100`}
                  >
                    <Leaf
                      weight="regular"
                      className={`w-3 h-3 text-${fileColor}-600`}
                    />
                  </div>
                  {editingName?.fileId === file.id &&
                  editingName.associationId === association.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="px-2 py-1 text-sm font-medium border border-emerald-500 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        autoFocus={true}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSaveNameEdit();
                          if (e.key === "Escape") onCancelEditingName();
                        }}
                      />
                      <button
                        onClick={onSaveNameEdit}
                        className="p-0.5 rounded hover:bg-emerald-100 transition text-emerald-600"
                      >
                        <Check weight="bold" className="w-3 h-3" />
                      </button>
                      <button
                        onClick={onCancelEditingName}
                        className="p-0.5 rounded hover:bg-gray-100 transition text-gray-600"
                      >
                        <XIcon weight="bold" className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-700">
                        {association.name}
                      </p>
                      <button
                        onClick={() =>
                          onStartEditingName(
                            file.id,
                            association.name,
                            association.id,
                          )
                        }
                        className={`p-0.5 rounded hover:bg-gray-100 transition ${textColor}`}
                      >
                        <PencilSimple weight="regular" className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono bg-${fileColor}-50 text-${fileColor}-700`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-${fileColor}-500`}
                  />
                  Association
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {editingArea?.fileId === file.id &&
                  editingArea.associationId === association.id ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 text-sm font-mono border border-emerald-500 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        autoFocus={true}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSaveAreaEdit();
                          if (e.key === "Escape") onCancelEditingArea();
                        }}
                      />
                      <button
                        onClick={onSaveAreaEdit}
                        className="p-0.5 rounded hover:bg-emerald-100 transition text-emerald-600"
                      >
                        <Check weight="bold" className="w-3 h-3" />
                      </button>
                      <button
                        onClick={onCancelEditingArea}
                        className="p-0.5 rounded hover:bg-gray-100 transition text-gray-600"
                      >
                        <XIcon weight="bold" className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-gray-900 text-sm">
                        {association.totalArea.toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          onStartEditingArea(
                            file.id,
                            association.totalArea,
                            association.id,
                          )
                        }
                        className={`p-0.5 rounded hover:bg-gray-100 transition ${textColor}`}
                      >
                        <PencilSimple weight="regular" className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
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
                        association.confidence >= 80
                          ? colorClass
                          : association.confidence >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${association.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-600">
                    {association.confidence}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-end gap-1">
                  <Tooltip
                    title={hasAssociationNotice ? "View Notice" : "Add Notice"}
                    description={
                      hasAssociationNotice
                        ? association.notice || ""
                        : "Add a notice to this association"
                    }
                    icon={<Flag weight="regular" className="w-4 h-4" />}
                  >
                    <button
                      ref={associationNoticeRef}
                      onClick={() =>
                        onOpenNoticePopover(
                          "summary",
                          file.id,
                          association.notice || "",
                          associationNoticeRef,
                          association.id,
                        )
                      }
                      className={`p-1.5 rounded hover:bg-gray-100 transition ${hasAssociationNotice ? "text-orange-500" : textColor}`}
                    >
                      <Flag
                        weight={hasAssociationNotice ? "fill" : "regular"}
                        className="w-3 h-3"
                      />
                    </button>
                  </Tooltip>
                  <Tooltip
                    title="Delete"
                    description="Remove this association"
                    icon={<Trash weight="regular" className="w-4 h-4" />}
                  >
                    <button
                      ref={deleteButtonRef}
                      onClick={() =>
                        onOpenDeleteConfirm(
                          file.id,
                          association.id,
                          association.name || "Unnamed Association",
                          deleteButtonRef,
                        )
                      }
                      className="p-1.5 rounded hover:bg-red-50 transition text-red-600"
                    >
                      <Trash weight="regular" className="w-3 h-3" />
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          );
        })
      : [];

  return [mainRow, ...subRows];
}
