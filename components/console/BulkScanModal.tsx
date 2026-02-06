"use client";

import Modal from "@/components/Modal";
import { Lightning, MapPin } from "@phosphor-icons/react";
import { useState } from "react";

interface BulkScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scanType: "total" | "summary", pageNumbers?: string) => void;
  selectedCount: number;
}

export default function BulkScanModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}: BulkScanModalProps) {
  const [selectedScanType, setSelectedScanType] = useState<"total" | "summary">(
    "total",
  );
  const [pageNumbers, setPageNumbers] = useState("");

  const startBulkScan = () => {
    onConfirm(
      selectedScanType,
      selectedScanType === "summary" ? pageNumbers : undefined,
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Scan Options">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Scan{" "}
          <span className="font-semibold">{selectedCount} selected files</span>{" "}
          using Gemini 2.5 Lite
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">
            Scan Method
          </label>

          <div
            onClick={() => setSelectedScanType("total")}
            className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedScanType === "total"
                ? "border-emerald-800 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-emerald-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedScanType === "total"
                    ? "bg-emerald-800"
                    : "bg-gray-400"
                }`}
              >
                <Lightning weight="regular" className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Total Scanning
                </h3>
                <p className="text-sm text-gray-600">
                  Only checks the last page and gets the &quot;Total&quot; row.
                  Fast method for files with pre-calculated totals using Gemini
                  2.5 Lite.
                </p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedScanType("summary")}
            className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedScanType === "summary"
                ? "border-emerald-800 bg-emerald-50"
                : "border-gray-200 bg-white hover:border-emerald-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedScanType === "summary"
                    ? "bg-emerald-800"
                    : "bg-gray-400"
                }`}
              >
                <MapPin weight="regular" className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Summary Scanning
                </h3>
                <p className="text-sm text-gray-600">
                  Extracts &quot;Irrigation Association&quot; names and
                  &quot;Total Area&quot; values from specific pages. Creates a
                  grid view of irrigation associations.
                </p>
              </div>
            </div>
          </div>

          {selectedScanType === "summary" && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Page Numbers
              </label>
              <input
                type="text"
                value={pageNumbers}
                onChange={(e) => setPageNumbers(e.target.value)}
                placeholder="e.g., 1, 3-5, 8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800"
              />
              <p className="text-xs text-gray-600 mt-1">
                Specify which pages to scan for all selected files (e.g.,
                &quot;1&quot; for page 1, &quot;1,3,5&quot; for multiple pages,
                &quot;1-5&quot; for range)
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={startBulkScan}
            disabled={selectedScanType === "summary" && !pageNumbers.trim()}
            className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Bulk Scan
          </button>
        </div>
      </div>
    </Modal>
  );
}
