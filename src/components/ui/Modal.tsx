'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  // Keep latest onClose in a ref so the effect below does not re-run (and
  // re-lock the body / re-bind listeners) every time the parent re-renders
  // with a new inline `onClose` function.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    // Lock scroll and compensate for the scrollbar width to avoid a
    // full-page layout shift (reflow) when the modal opens.
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  // Rendered in a portal so the modal is isolated from the page's layout tree
  // (no expensive full-page backdrop-filter blur; only opacity/transform animate).
  return createPortal(
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={() => onCloseRef.current()}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto overscroll-contain flex-1">{children}</div>

        {/* Modal Footer */}
        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
