'use client';

import { useState, useEffect } from 'react';
import type { PdfFile, PdfPage } from '@/types';
import { apiCall } from '@/lib/api/client';
import Modal from '@/components/Modal';

interface PdfViewerProps {
  pdf: PdfFile;
  onClose: () => void;
}

export default function PdfViewer({ pdf, onClose }: PdfViewerProps) {
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const response = await apiCall(`/api/files/pages?pdfId=${pdf.id}`);
        const data = await response.json();
        console.log('Loaded pages:', data.pages);
        setPages(data.pages || []);
      } catch (error) {
        console.error('page load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPages();
  }, [pdf.id]);

  const page = pages.find((p) => p.pageNumber === currentPage);
  
  console.log('Current page:', currentPage);
  console.log('Page data:', page);
  console.log('Table data:', page?.tableData);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      description="View extracted table data and original page screenshots. Use the navigation buttons below to browse through pages."
      maxWidth="6xl"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{pdf.name}</h2>
          <p className="text-sm text-gray-600">
            Page {currentPage} of {pdf.pageCount || pages.length}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-600">Loading pages...</div>
          </div>
        ) : page ? (
          <div className="space-y-6">
            {page.summary && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Page Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {page.summary}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Extracted Table Data</h3>
              {page.tableData && Array.isArray(page.tableData) && page.tableData.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {Object.keys(page.tableData[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left font-semibold text-gray-900">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {page.tableData.map((row: Record<string, unknown>, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          {Object.values(row).map((value, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-3 text-gray-700">
                              {value === null || value === undefined || value === '' ? '--' : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-600">No table data found on this page</p>
                  <pre className="text-xs text-left mt-4 text-gray-500">
                    {JSON.stringify(page.tableData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No page data available</p>
            <p className="text-xs mt-2">Pages loaded: {pages.length}</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <button
          data-modal-close="true"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Close
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition text-sm font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pdf.pageCount || pages.length}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(pdf.pageCount || pages.length, currentPage + 1))
            }
            disabled={currentPage === (pdf.pageCount || pages.length)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </Modal>
  );
}
