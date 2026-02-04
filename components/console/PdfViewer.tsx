'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Extracted Data</h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <pre className="text-sm text-gray-700">
                  {JSON.stringify(page.tableData, null, 2)}
                </pre>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Original Page</h3>
              <div className="relative w-full aspect-[8.5/11] border border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={page.screenshotUrl}
                  alt={`Page ${currentPage}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">No page data available</div>
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
