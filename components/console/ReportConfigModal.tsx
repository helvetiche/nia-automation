"use client";

import { useState } from "react";
import Modal from "../Modal";
import { X, FileText, CloudSun, CloudRain, CalendarBlank } from "@phosphor-icons/react";

interface ReportConfigModalProps {
  onClose: () => void;
  onConfirm: (config: {
    title: string;
    season: string;
    year: number;
  }) => void;
}

export default function ReportConfigModal({
  onClose,
  onConfirm,
}: ReportConfigModalProps) {
  const currentYear = new Date().getFullYear();
  const [title, setTitle] = useState(
    "LIST OF IRRIGATED AND PLANTED AREA (LIPA)",
  );
  const [season, setSeason] = useState<"DRY" | "WET">("DRY");
  const [year, setYear] = useState(currentYear);

  const generateReport = () => {
    const seasonText = `${season} CROPPING SEASON ${year}`;
    onConfirm({ title, season: seasonText, year });
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText weight="duotone" className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Report
              </h2>
              <p className="text-sm text-gray-500">
                Configure your Excel report settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <X weight="regular" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText weight="duotone" className="w-4 h-4 text-gray-600" />
              Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="LIST OF IRRIGATED AND PLANTED AREA (LIPA)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Main heading for your report
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CloudSun weight="duotone" className="w-4 h-4 text-gray-600" />
                Season
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeason("DRY")}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition text-sm font-medium flex items-center justify-center gap-2 ${
                    season === "DRY"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <CloudSun weight="duotone" className="w-5 h-5" />
                  DRY
                </button>
                <button
                  onClick={() => setSeason("WET")}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition text-sm font-medium flex items-center justify-center gap-2 ${
                    season === "WET"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <CloudRain weight="duotone" className="w-5 h-5" />
                  WET
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cropping season type
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarBlank weight="duotone" className="w-4 h-4 text-gray-600" />
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || currentYear)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min={2020}
                max={2100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Report year
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
            <p className="text-xs font-medium text-emerald-700 mb-2">Preview</p>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-700">
              {season} CROPPING SEASON {year}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <FileText weight="bold" className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>
    </Modal>
  );
}
