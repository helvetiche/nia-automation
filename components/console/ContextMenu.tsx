"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import {
  ArrowsClockwise,
  FolderPlus,
  FilePlus,
} from "@phosphor-icons/react/dist/ssr";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRefresh: () => void;
  onNewFolder: () => void;
  onUploadPdf: () => void;
}

export default function ContextMenu({
  x,
  y,
  onClose,
  onRefresh,
  onNewFolder,
  onUploadPdf,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    if (!menuRef.current) return;

    gsap.to(menuRef.current, {
      opacity: 0,
      scale: 0.95,
      filter: "blur(4px)",
      duration: 0.15,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose]);

  useEffect(() => {
    if (!menuRef.current) return;

    gsap.fromTo(
      menuRef.current,
      {
        opacity: 0,
        scale: 0.95,
        filter: "blur(4px)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.2,
        ease: "power2.out",
      },
    );

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu]);

  const handleAction = (action: () => void) => {
    action();
    closeMenu();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[180px]"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <button
        onClick={() => handleAction(onRefresh)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
      >
        <ArrowsClockwise weight="regular" className="w-4 h-4 text-gray-600" />
        Refresh
      </button>

      <div className="h-px bg-gray-200 my-1" />

      <button
        onClick={() => handleAction(onNewFolder)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
      >
        <FolderPlus weight="regular" className="w-4 h-4 text-emerald-800" />
        New Folder
      </button>

      <button
        onClick={() => handleAction(onUploadPdf)}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
      >
        <FilePlus weight="regular" className="w-4 h-4 text-emerald-800" />
        Upload PDF
      </button>
    </div>
  );
}
