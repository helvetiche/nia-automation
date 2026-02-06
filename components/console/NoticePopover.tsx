'use client';

import { useState, useEffect } from 'react';
import { Flag, X } from '@phosphor-icons/react';
import Modal from '@/components/Modal';

interface NoticePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: string) => void;
  currentNotice?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const NOTICE_TEMPLATES = [
  'Wrong calculations',
  'Unreadable texts',
  'Missing data',
  'Incorrect format',
  'Needs verification',
  'Duplicate entry',
  'Incomplete information',
];

export default function NoticePopover({ isOpen, onClose, onSave, currentNotice = '' }: NoticePopoverProps) {
  const [notice, setNotice] = useState(currentNotice);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setNotice(currentNotice);
  }, [currentNotice]);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const saveNotice = () => {
    onSave(notice.trim());
    closeWithAnimation();
  };

  const removeNotice = () => {
    onSave('');
    closeWithAnimation();
  };

  const selectTemplate = (template: string) => {
    setNotice(template);
  };

  return (
    <Modal isOpen={isOpen && !isClosing} onClose={onClose} title="">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flag weight="fill" className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Add Notice</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {NOTICE_TEMPLATES.map((template) => (
              <button
                key={template}
                onClick={() => selectTemplate(template)}
                className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-orange-100 hover:text-orange-700 transition"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Notice
          </label>
          <textarea
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            placeholder="Write a notice about this item..."
            maxLength={100}
            rows={3}
            className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            autoFocus
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {notice.length}/100 characters
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {currentNotice && (
            <button
              onClick={removeNotice}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
            >
              Remove Notice
            </button>
          )}
          <button
            onClick={closeWithAnimation}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={saveNotice}
            disabled={notice.trim().length === 0}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Save Notice
          </button>
        </div>
      </div>
    </Modal>
  );
}