'use client';

import Modal from '@/components/Modal';
import SummaryGrid from './SummaryGrid';
import type { PdfFile } from '@/types';

interface SummaryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: PdfFile;
}

export default function SummaryViewModal({ isOpen, onClose, file }: SummaryViewModalProps) {
  if (!file.summaryData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Summary Data">
        <div className="p-6 text-center">
          <p className="text-gray-500">No summary data available for this file.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Summary: ${file.name}`} size="large">
      <div className="p-6">
        <SummaryGrid
          summaryData={file.summaryData}
          confidence={file.confidence || 0}
          totalTokens={file.totalTokens || 0}
          estimatedCost={file.estimatedCost || 0}
        />
      </div>
    </Modal>
  );
}