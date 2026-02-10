"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { DotsThree, FileXls, Trash, ArrowsDownUp } from "@phosphor-icons/react/dist/ssr";

interface BulkActionsToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReport: () => void;
  onDelete: () => void;
  onMove: () => void;
}

export default function BulkActionsToolbar({
  isOpen,
  onClose,
  onCreateReport,
  onDelete,
  onMove,
}: BulkActionsToolbarProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, scale: 0.95, y: -10, pointerEvents: "none" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          pointerEvents: "auto",
          duration: 0.2,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(menuRef.current, {
        opacity: 0,
        scale: 0.95,
        y: -10,
        pointerEvents: "none",
        duration: 0.15,
        ease: "power2.in",
      });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => (isOpen ? onClose() : onClose())}
        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 rounded transition"
      >
        <DotsThree weight="regular" className="w-4 h-4" />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        >
          <button
            onClick={() => {
              onCreateReport();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
          >
            <FileXls weight="regular" className="w-4 h-4" />
            Create Report
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-gray-100"
          >
            <Trash weight="regular" className="w-4 h-4" />
            Delete Selected
          </button>
          <button
            onClick={() => {
              onMove();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowsDownUp weight="regular" className="w-4 h-4" />
            Move Selected
          </button>
        </div>
      )}
    </div>
  );
}
