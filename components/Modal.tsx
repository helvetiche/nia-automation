'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X } from '@phosphor-icons/react/dist/ssr';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  size?: 'default' | 'large';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  icon,
  maxWidth = 'md',
  size = 'default',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';

      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          y: 100,
          filter: 'blur(10px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
        }
      );
    }
  }, [isOpen]);

  const closeModal = () => {
    if (isAnimatingRef.current) return;

    const overlay = overlayRef.current;
    const content = contentRef.current;
    
    if (!overlay || !content) {
      onCloseRef.current();
      return;
    }

    isAnimatingRef.current = true;

    const timeline = gsap.timeline({    
      onComplete: () => {
        document.body.style.overflow = '';
        isAnimatingRef.current = false;
        onCloseRef.current();
      },
    });

    timeline.to(content, {
      opacity: 0,
      y: 100,
      filter: 'blur(10px)',
      duration: 0.4,
      ease: 'power2.in',
    });
    timeline.to(overlay, { opacity: 0, duration: 0.2 }, '-=0.2');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
      data-modal-close="true"
    >
      <div
        ref={contentRef}
        className={`bg-white rounded-xl shadow-2xl w-full ${
          size === 'large' ? 'max-w-6xl' : maxWidthClasses[maxWidth]
        } flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                {icon && <div className="text-emerald-800">{icon}</div>}
                <h3 className="font-bold text-gray-900">{title}</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X weight="regular" className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {description && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto" onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.hasAttribute('data-modal-close')) {
            closeModal();
          }
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}
