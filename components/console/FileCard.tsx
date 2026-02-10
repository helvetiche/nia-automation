"use client";

import type { PdfFile } from "@/types";
import {
  FilePdf,
  Eye,
  Trash,
  ChartLineUp,
  Lightning,
  ChartBar,
  CurrencyDollar,
} from "@phosphor-icons/react/dist/ssr";
import Tooltip from "@/components/Tooltip";
import {
  COLOR_MAP,
  PILL_COLOR_MAP,
  TEXT_COLOR_MAP,
  BORDER_COLOR_MAP,
  GRADIENT_COLOR_MAP,
} from "@/lib/constants/colorMaps";

interface FileCardProps {
  file: PdfFile;
  fileColor: string;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onDelete: (fileId: string, fileName: string) => void;
  onViewSummary: (file: PdfFile) => void;
  onViewExtracted: (file: PdfFile) => void;
}

export default function FileCard({
  file,
  fileColor,
  isSelectMode,
  isSelected,
  onSelect,
  onDelete,
  onViewSummary,
  onViewExtracted,
}: FileCardProps) {
  const colorClass = COLOR_MAP[fileColor] || COLOR_MAP.red;
  const textColor = TEXT_COLOR_MAP[fileColor] || TEXT_COLOR_MAP.red;
  const borderColor = BORDER_COLOR_MAP[fileColor] || BORDER_COLOR_MAP.red;
  const pillColors = PILL_COLOR_MAP[fileColor] || PILL_COLOR_MAP.red;
  const gradientColor = GRADIENT_COLOR_MAP[fileColor] || GRADIENT_COLOR_MAP.red;

  const totalArea = file.totalArea || 0;
  const totalIrrigatedArea = file.totalIrrigatedArea || 0;
  const totalPlantedArea = file.totalPlantedArea || 0;

  const hasTotals = totalArea > 0 || totalIrrigatedArea > 0 || totalPlantedArea > 0;
  const hasUsageData = file.inputTokens && file.outputTokens && file.estimatedCost;

  return (
    <div
      onClick={() => isSelectMode && onSelect(file.id)}
      className={`group relative bg-white rounded-xl border-2 border-gray-200 ${borderColor} p-5 transition-all duration-200 overflow-hidden ${
        isSelectMode ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-emerald-800" : ""}`}
    >
      {isSelectMode && (
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(file.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-gray-300 text-emerald-800 cursor-pointer"
          />
        </div>
      )}

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${gradientColor}, transparent)`,
        }}
      />

      <div className="relative flex items-start gap-3 mb-3">
        <div
          className={`w-14 h-14 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}
        >
          <FilePdf weight="regular" className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${colorClass} flex-shrink-0`} />
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {file.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
            >
              {file.status === "scanned" ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Total Scanned
                </>
              ) : file.status === "summary-scanned" ? (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Summary Scanned
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Unscanned
                </>
              )}
            </span>

            {file.pageCount && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
                {file.pageCount} {file.pageCount === 1 ? "Page" : "Pages"}
              </span>
            )}

            {file.status === "summary-scanned" && file.summaryData && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${pillColors.bg} ${pillColors.text} ${pillColors.border}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
                {file.summaryData.length} Associations
              </span>
            )}
          </div>
        </div>
      </div>

      {file.status === "scanned" && hasTotals && (
        <div className="relative flex flex-col gap-1 mb-3">
          {totalArea > 0 && (
            <span className="text-xs font-mono text-gray-600">
              Total Area:{" "}
              <span className="font-semibold">{totalArea.toFixed(2)}</span>
            </span>
          )}
          {totalIrrigatedArea > 0 && (
            <span className="text-xs font-mono text-gray-600">
              Irrigated:{" "}
              <span className="font-semibold">
                {totalIrrigatedArea.toFixed(2)}
              </span>
            </span>
          )}
          {totalPlantedArea > 0 && (
            <span className="text-xs font-mono text-gray-600">
              Planted:{" "}
              <span className="font-semibold">{totalPlantedArea.toFixed(2)}</span>
            </span>
          )}
        </div>
      )}

      {file.status === "summary-scanned" &&
        file.summaryData &&
        file.summaryData.length > 0 && (
          <div className="relative mb-3">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              Irrigation Associations ({file.summaryData.length})
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {file.summaryData.slice(0, 3).map((assoc) => (
                <div
                  key={assoc.id}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="font-mono text-gray-600 truncate flex-1 mr-2">
                    {assoc.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {assoc.totalArea.toFixed(2)}
                  </span>
                </div>
              ))}
              {file.summaryData.length > 3 && (
                <div className="text-xs text-gray-500 font-mono">
                  +{file.summaryData.length - 3} more associations
                </div>
              )}
            </div>
          </div>
        )}

      {(file.status === "scanned" || file.status === "summary-scanned") &&
        file.confidence !== undefined && (
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-gray-600">
                Confidence
              </span>
              <span className="text-xs font-mono font-semibold text-gray-900">
                {file.confidence}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  file.confidence >= 80
                    ? "bg-emerald-500"
                    : file.confidence >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${file.confidence}%` }}
              />
            </div>
          </div>
        )}

      {(file.status === "scanned" || file.status === "summary-scanned") &&
        hasUsageData && (
          <div className="relative mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-600">Usage</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                <Lightning
                  weight="fill"
                  className="w-3 h-3 text-emerald-600 mb-1"
                />
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  {((file.inputTokens || 0) / 1000).toFixed(1)}K
                </span>
                <span className="text-xs text-emerald-600">Input</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                <ChartBar
                  weight="fill"
                  className="w-3 h-3 text-emerald-600 mb-1"
                />
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  {((file.outputTokens || 0) / 1000).toFixed(1)}K
                </span>
                <span className="text-xs text-emerald-600">Output</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-emerald-50 border border-emerald-200 rounded">
                <CurrencyDollar
                  weight="fill"
                  className="w-3 h-3 text-emerald-600 mb-1"
                />
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  ₱{((file.estimatedCost || 0) * 58).toFixed(2)}
                </span>
                <span className="text-xs text-emerald-600">Cost</span>
              </div>
            </div>
          </div>
        )}

      <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip
          title="View"
          description="Open and view extracted table data"
          icon={<Eye weight="regular" className="w-4 h-4" />}
        >
          <button
            onClick={() => {
              if (file.status === "summary-scanned") {
                onViewExtracted(file);
              }
            }}
            disabled={file.status !== "summary-scanned"}
            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${textColor}`}
          >
            <Eye weight="regular" className="w-4 h-4" />
          </button>
        </Tooltip>

        {file.status === "scanned" && file.extractedData && (
          <Tooltip
            title="Summary"
            description="View page-by-page breakdown of totals"
            icon={<ChartLineUp weight="regular" className="w-4 h-4" />}
          >
            <button
              onClick={() => onViewSummary(file)}
              className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
            >
              <ChartLineUp weight="regular" className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        <Tooltip
          title="Delete"
          description="Remove this file permanently"
          icon={<Trash weight="regular" className="w-4 h-4" />}
        >
          <button
            onClick={() => onDelete(file.id, file.name)}
            className={`p-2 bg-white rounded-lg hover:bg-gray-50 transition ${textColor}`}
          >
            <Trash weight="regular" className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
