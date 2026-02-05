'use client';

import { useState, useRef, useEffect } from 'react';
import { Flag } from '@phosphor-icons/react';

interface NoticePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: string) => void;
  currentNotice?: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export default function NoticePopover({ isOpen, onClose, onSave, currentNotice = '', anchorRef }: NoticePopoverProps) {
  const [notice, setNotice] = useState(currentNotice);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotice(currentNotice);
  }, [currentNotice]);

  useEffect(() => {
    if (isOpen && anchorRef.current && popoverRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      
      let top = anchorRect.bottom + 8;
      let left = anchorRect.left - popoverRect.width + anchorRect.width;
      
      if (left < 8) {
        left = 8;
      }
      
      if (top + popoverRect.height > window.innerHeight - 8) {
        top = anchorRect.top - popoverRect.height - 8;
      }
      
      setPosition({ top, left });
      
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, anchorRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  const saveNotice = () => {
    onSave(notice.trim());
    onClose();
  };

  const removeNotice = () => {
    onSave('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flag weight="fill" className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-gray-900">Add Notice</h3>
        </div>
        
        <textarea
          ref={textareaRef}
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          placeholder="Write a notice about this item..."
          maxLength={100}
          rows={3}
          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {notice.length}/100 characters
          </span>
          
          <div className="flex items-center gap-2">
            {currentNotice && (
              <button
                onClick={removeNotice}
                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition"
              >
                Remove
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition"
            >
              Cancel
            </button>
            <button
              onClick={saveNotice}
              disabled={notice.trim().length === 0}
              className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}