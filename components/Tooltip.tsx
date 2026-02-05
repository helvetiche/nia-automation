'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

interface TooltipProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function Tooltip({ title, description, icon, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
        setIsVisible(true);
      }
    }, 500);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (!tooltipRef.current) return;

    if (isVisible) {
      gsap.fromTo(
        tooltipRef.current,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed pointer-events-none z-[9999]"
            style={{
              bottom: `${window.innerHeight - position.top + 8}px`,
              left: `${position.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-gray-700">{icon}</div>
                <p className="text-xs font-semibold text-gray-900">{title}</p>
              </div>
              <p className="text-xs text-gray-600">{description}</p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
              <div className="w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45 shadow-sm" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
