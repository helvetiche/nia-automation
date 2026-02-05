'use client';

import Modal from '@/components/Modal';
import { Lightning } from '@phosphor-icons/react';

interface ScanOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pdfName: string;
}

export default function ScanOptionsModal({ isOpen, onClose, onConfirm, pdfName }: ScanOptionsModalProps) {
  const startScan = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scan Options">
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Scan <span className="font-semibold">{pdfName}</span> using Gemini 2.5 Lite
        </p>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900">Scan Method</label>
          <div className="w-full text-left p-4 rounded-lg border-2 border-emerald-800 bg-emerald-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-800">
                <Lightning weight="regular" className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Scan Last Page Only</h3>
                <p className="text-sm text-gray-600">
                  Only checks the last page and gets the &quot;Total&quot; row. 
                  Fast method for files with pre-calculated totals using Gemini 2.5 Lite.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={startScan}
            className="flex-1 px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition"
          >
            Start Scan
          </button>
        </div>
      </div>
    </Modal>
  );
}