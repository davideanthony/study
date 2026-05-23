"use client";

import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,24rem)] rounded-2xl border border-gray-light bg-surface p-0 text-foreground shadow-[var(--shadow-lift)] backdrop:bg-foreground/30"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="p-6">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-6 w-full py-2.5 text-sm"
        >
          Ok
        </button>
      </div>
    </dialog>
  );
}
