"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Accessible modal: focus trap-ish (focuses the panel), Escape to close,
 * scrim click to dismiss, body scroll lock. Scrim is strong enough (50%)
 * to isolate foreground content.
 */
export default function ClayModal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without making it an effect dependency, so a parent
  // re-render (e.g. the exam's 1s timer) doesn't re-run the effects below.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus the panel once when it opens — NOT on every parent re-render, which
  // would steal focus away from inputs inside the modal while the user types.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  // Escape-to-close + body scroll lock while open. Depends only on `open` so it
  // subscribes once per open, not on each render.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center p-4"
      aria-hidden={false}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg animate-scale-in rounded-clay-lg border border-clay-line bg-cream p-7 shadow-clay-lg outline-none"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="clay-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay-line bg-clay text-ink hover:bg-clay-deep"
          >
            <X aria-hidden className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="text-sm leading-relaxed text-ink-muted">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
