'use client';

import { useState } from 'react';
import type { PdfFile } from '@/types';
import Modal from '@/components/Modal';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: PdfFile;
}

export default function SummaryModal({ isOpen, onClose, file }: SummaryModalProps) {
  const [showAverage, setShowAverage] = useState(false);
  const pageData = [];

  if (file.extractedData && Array.isArray(file.extractedData)) {
    for (const page of file.extractedData) {
      let totalArea = 0;
      let totalIrrigatedArea = 0;
      let totalPlantedArea = 0;
      let areaCount = 0;
      let irrigatedCount = 0;
      let plantedCount = 0;

      if (page.tableData && Array.isArray(page.tableData)) {
        for (const row of page.tableData) {
          const rowValues = Object.values(row).map(v => String(v).toLowerCase());
          const isTotalRow = rowValues.some(v => 
            v.includes('total') || 
            v.includes('subtotal') || 
            v.includes('grand total') ||
            v.includes('sum')
          );
          
          if (isTotalRow) continue;

          const areaKeys = ['area', 'Area', 'AREA', 'total area', 'Total Area', 'TOTAL AREA'];
          const irrigatedKeys = ['irrigated', 'Irrigated', 'IRRIGATED', 'irrigated area', 'Irrigated Area', 'IRRIGATED AREA'];
          const plantedKeys = ['planted', 'Planted', 'PLANTED', 'planted area', 'Planted Area', 'PLANTED AREA'];

          for (const key of areaKeys) {
            if (key in row && row[key]) {
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              if (!isNaN(value) && value > 0) {
                totalArea += value;
                areaCount++;
                break;
              }
            }
          }

          for (const key of irrigatedKeys) {
            if (key in row && row[key]) {
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              if (!isNaN(value) && value > 0) {
                totalIrrigatedArea += value;
                irrigatedCount++;
                break;
              }
            }
          }

          for (const key of plantedKeys) {
            if (key in row && row[key]) {
              const value = parseFloat(String(row[key]).replace(/[^0-9.-]/g, ''));
              if (!isNaN(value) && value > 0) {
                totalPlantedArea += value;
                plantedCount++;
                break;
              }
            }
          }
        }
      }

      pageData.push({
        pageNumber: page.pageNumber,
        totalArea,
        totalIrrigatedArea,
        totalPlantedArea,
        avgArea: areaCount > 0 ? totalArea / areaCount : 0,
        avgIrrigatedArea: irrigatedCount > 0 ? totalIrrigatedArea / irrigatedCount : 0,
        avgPlantedArea: plantedCount > 0 ? totalPlantedArea / plantedCount : 0,
        rowCount: Math.max(areaCount, irrigatedCount, plantedCount),
      });
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      description="Page-by-page breakdown of average values extracted from the PDF"
      maxWidth="4xl"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{file.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Page-by-Page Breakdown</p>
          </div>
          <button
            onClick={() => setShowAverage(!showAverage)}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition text-sm font-medium"
          >
            {showAverage ? 'Show Totals' : 'Show Averages'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Page</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">
                  {showAverage ? 'Avg ' : ''}Area
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">
                  {showAverage ? 'Avg ' : ''}Irrigated
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">
                  {showAverage ? 'Avg ' : ''}Planted
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Rows</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((page) => (
                <tr key={page.pageNumber} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">Page {page.pageNumber}</td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {showAverage
                      ? page.avgArea > 0 ? page.avgArea.toFixed(2) : '--'
                      : page.totalArea > 0 ? page.totalArea.toFixed(2) : '--'
                    }
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {showAverage
                      ? page.avgIrrigatedArea > 0 ? page.avgIrrigatedArea.toFixed(2) : '--'
                      : page.totalIrrigatedArea > 0 ? page.totalIrrigatedArea.toFixed(2) : '--'
                    }
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {showAverage
                      ? page.avgPlantedArea > 0 ? page.avgPlantedArea.toFixed(2) : '--'
                      : page.totalPlantedArea > 0 ? page.totalPlantedArea.toFixed(2) : '--'
                    }
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 font-mono text-xs">
                    {page.rowCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-end">
        <button
          data-modal-close="true"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
