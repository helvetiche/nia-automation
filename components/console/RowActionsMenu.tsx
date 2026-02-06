'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DotsThree } from '@phosphor-icons/react';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
}

interface RowActionsMenuProps {
  actions: ActionItem[];
  accentColor?: string;
}

const COLOR_MAP: Record<string, string> = {
  red: 'text-red-600 hover:bg-red-50',
  orange: 'text-orange-600 hover:bg-orange-50',
  yellow: 'text-yellow-600 hover:bg-yellow-50',
  emerald: 'text-emerald-600 hover:bg-emerald-50',
  blue: 'text-blue-600 hover:bg-blue-50',
  indigo: 'text-indigo-600 hover:bg-indigo-50',
  purple: 'text-purple-600 hover:bg-purple-50',
  pink: 'text-pink-600 hover:bg-pink-50',
};

export default function RowActionsMenu({ actions, accentColor = 'emerald' }: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.right - 192,
      });
    }
  };

  const closeMenu = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    if (!isOpen) return;
    
    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleScroll = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const colorClass = COLOR_MAP[accentColor] || COLOR_MAP.emerald;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded hover:bg-gray-100 transition ${colorClass.split(' ')[0]}`}
      >
        <DotsThree weight="bold" className="w-5 h-5" />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 transition-opacity duration-200 opacity-100"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                closeMenu();
              }}
              disabled={action.disabled}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                action.color || colorClass
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {action.icon}
              </span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
