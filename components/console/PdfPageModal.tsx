'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PdfPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  scannedPages?: string;
  fileName: string;
}

export default function PdfPageModal({ isOpen, onClose, pdfUrl, scannedPages, fileName }: PdfPageModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [pdfComponents, setPdfComponents] = useState<{
    Document: React.ComponentType<unknown>;
    Page: React.ComponentType<unknown>;
  } | null>(null);

  const parsedPages = scannedPages ? parsePageNumbers(scannedPages) : [];
  
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return parsedPages.length > 0 ? parsedPages[0] : 1;
  });

  useEffect(() => {
    let mounted = true;
    
    const loadPdfComponents = async () => {
      try {
        if (typeof window !== 'undefined') {
          const reactPdf = await import('react-pdf');
          
          reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
          
          if (mounted) {
            setPdfComponents({
              Document: reactPdf.Document,
              Page: reactPdf.Page
            });
          }
        }
      } catch (err) {
        console.error('Failed to load PDF components:', err);
        if (mounted) {
          setError('Failed to load PDF viewer');
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      loadPdfComponents();
    }

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setNumPages(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && parsedPages.length > 0 && !parsedPages.includes(currentPage)) {
      setCurrentPage(parsedPages[0]);
    }
  }, [isOpen, parsedPages, currentPage]);

  function parsePageNumbers(pageStr: string): number[] {
    const pages: number[] = [];
    const parts = pageStr.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            pages.push(i);
          }
        }
      } else {
        const pageNum = parseInt(trimmed);
        if (!isNaN(pageNum)) {
          pages.push(pageNum);
        }
      }
    }
    
    return [...new Set(pages)].sort((a, b) => a - b);
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('PDF viewer is having trouble loading this file');
    setLoading(false);
  }

  const goToPrevious = () => {
    if (parsedPages.length > 0) {
      const currentIndex = parsedPages.indexOf(currentPage);
      if (currentIndex > 0) {
        setCurrentPage(parsedPages[currentIndex - 1]);
      }
    } else {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  const goToNext = () => {
    if (parsedPages.length > 0) {
      const currentIndex = parsedPages.indexOf(currentPage);
      if (currentIndex < parsedPages.length - 1) {
        setCurrentPage(parsedPages[currentIndex + 1]);
      }
    } else {
      setCurrentPage(prev => Math.min(numPages, prev + 1));
    }
  };

  const canGoPrevious = parsedPages.length > 0 
    ? parsedPages.indexOf(currentPage) > 0 
    : currentPage > 1;

  const canGoNext = parsedPages.length > 0 
    ? parsedPages.indexOf(currentPage) < parsedPages.length - 1 
    : currentPage < numPages;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`PDF Pages - ${fileName}`} size="large">
      <div className="p-6">
        {scannedPages && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-700">
              <span className="font-semibold">Scanned Pages:</span> {scannedPages}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Showing {parsedPages.length} page{parsedPages.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <CaretLeft weight="regular" className="w-5 h-5" />
            </button>
            
            <span className="text-sm font-medium text-gray-700 px-3">
              Page {currentPage} of {numPages}
              {parsedPages.length > 0 && (
                <span className="text-gray-500 ml-1">
                  ({parsedPages.indexOf(currentPage) + 1}/{parsedPages.length} scanned)
                </span>
              )}
            </span>
            
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <CaretRight weight="regular" className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Zoom Out
            </button>
            <span className="text-sm text-gray-600 px-2">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(2.0, prev + 0.25))}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Zoom In
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <div className="flex justify-center p-4 min-h-[600px]">
            {!pdfComponents && (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading PDF viewer...</div>
              </div>
            )}

            {pdfComponents && loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-gray-500">Loading PDF...</div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center justify-center h-96">
                <div className="text-red-500">{error}</div>
              </div>
            )}

            {pdfComponents && !loading && !error && (
              <pdfComponents.Document
                file={{
                  url: pdfUrl,
                  httpHeaders: {
                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''}`
                  }
                }}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
                error=""
              >
                <pdfComponents.Page
                  pageNumber={currentPage}
                  scale={scale}
                  loading=""
                  error=""
                  className="shadow-lg"
                />
              </pdfComponents.Document>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}