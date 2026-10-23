"use client";

import { useEffect, useRef } from "react";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
};

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: keyof typeof SIZES;
  label: string;
  className?: string;
}

/** Bottom sheet on phones, centered dialog on larger screens. Escape or backdrop click closes it. */
export default function Modal({ onClose, children, size = "md", label, className = "" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Move focus into the dialog, and give it back to whatever had it when the dialog closes.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in sm:items-center sm:p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-lift outline-none animate-slide-up sm:rounded-3xl ${SIZES[size]} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
