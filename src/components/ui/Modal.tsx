"use client";

import { X } from "lucide-react";
import { clsx } from "clsx";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/55 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal
        className={clsx(
          "max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-2xl shadow-primary/15",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-secondary/15 bg-secondary px-4 py-3 text-white">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            className="rounded-full p-1.5 text-white/90 transition hover:bg-white/15"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-3rem)] overflow-y-auto bg-background/30 p-4">{children}</div>
      </div>
    </div>
  );
}
