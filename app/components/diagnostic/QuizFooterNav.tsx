"use client";

import { ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { cn } from "@/lib/cn";

/** Sticky Prev / Next / Submit bar for the diagnostic test. */
export default function QuizFooterNav({
  canPrev,
  isLast,
  onPrev,
  onNext,
  onSubmit,
  submitLabel = "Review & submit",
}: {
  canPrev: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="sticky bottom-0 z-30 mt-6 border-t border-clay-line bg-cream/90 px-1 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className={cn(
            "inline-flex min-h-[48px] items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors",
            canPrev
              ? "border-clay-line bg-clay text-ink hover:bg-clay-deep"
              : "cursor-not-allowed border-clay-line bg-clay text-ink-faint opacity-50",
          )}
        >
          <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
          Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-mango px-6 text-sm font-bold text-white transition-colors hover:bg-mango-deep"
          >
            <Flag aria-hidden className="h-4 w-4" strokeWidth={2} />
            {submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-berry px-6 text-sm font-bold text-white transition-colors hover:bg-berry-deep"
          >
            Next
            <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
