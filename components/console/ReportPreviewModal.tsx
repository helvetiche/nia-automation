"use client";

import React, { useState } from "react";
import Modal from "../Modal";
import { FileXls, Download } from "@phosphor-icons/react/dist/ssr";

interface IrrigatorData {
  no: number;
  name: string;
  totalPlantedArea: number;
}

interface DivisionData {
  divisionName: string;
  irrigators: IrrigatorData[];
  total: number;
}

interface ReportData {
  title: string;
  season: string;
  divisions: DivisionData[];
}

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
  onConfirm: () => void;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  reportData,
  onConfirm,
}: ReportPreviewModalProps) {
  const [generating, setGenerating] = useState(false);

  const confirmGenerate = async () => {
    setGenerating(true);
    await onConfirm();
    setGenerating(false);
    onClose();
  };

  const grandTotal = reportData.divisions.reduce(
    (sum, div) => sum + div.total,
    0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Preview"
      description="Review the data before generating the Excel report"
      icon={<FileXls weight="regular" className="w-5 h-5" />}
      maxWidth="4xl"
    >
      <div className="p-6 space-y-4" style={{ fontFamily: 'Cambria, serif' }}>
        <div className="border border-gray-300 p-3 bg-gray-100">
          <h3 className="text-sm font-bold text-center text-gray-900">
            {reportData.title}
          </h3>
          <p className="text-sm font-bold text-center text-gray-900 mt-1">
            {reportData.season}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto border border-gray-300">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border border-gray-400">
                  NO.
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border border-gray-400">
                  IRRIGATORS ASSOCIATION
                </th>
                <th className="px-3 py-2 text-center text-xs font-bold text-gray-900 border border-gray-400">
                  TOTAL PLANTED AREA
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.divisions.map((division, divIndex) => (
                <React.Fragment key={`div-${divIndex}`}>
                  <tr className="bg-orange-100">
                    <td
                      colSpan={3}
                      className="px-3 py-2 font-bold text-gray-900 border border-gray-400"
                    >
                      {division.divisionName.replace(/\.pdf$/i, "")}
                    </td>
                  </tr>
                  {division.irrigators.map((irrigator, irrIndex) => (
                    <tr key={`irr-${irrIndex}`}>
                      <td className="px-3 py-2 text-left text-gray-900 border border-gray-400">
                        {irrigator.no}
                      </td>
                      <td className="px-3 py-2 text-left text-gray-900 border border-gray-400">
                        {irrigator.name}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-900 border border-gray-400">
                        {irrigator.totalPlantedArea.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-2 font-bold text-left text-gray-900 border border-gray-400"
                    >
                      TOTAL
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-gray-900 border border-gray-400">
                      {division.total.toFixed(2)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              <tr className="bg-green-200">
                <td
                  colSpan={2}
                  className="px-3 py-3 font-bold text-left text-gray-900 border border-gray-400"
                >
                  GRAND TOTAL
                </td>
                <td className="px-3 py-3 text-right font-bold text-gray-900 border border-gray-400">
                  {grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            data-modal-close="true"
            disabled={generating}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmGenerate}
            disabled={generating}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-800 rounded hover:bg-emerald-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download weight="regular" className="w-4 h-4" />
            {generating ? "Generating..." : "Generate Excel Report"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
