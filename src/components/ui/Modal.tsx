"use client";

import type { ReactNode } from "react";

// Lightweight bottom-sheet modal with a scrim. Slides up on open (CSS only).
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      {/* scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="sheet-scrim absolute inset-0 bg-black/40"
      />
      {/* sheet */}
      <div className="sheet-in relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 pb-8 shadow-xl dark:bg-[#16213a]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-light-gray" />
        {title && <h2 className="mb-4 text-base font-bold text-navy">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
