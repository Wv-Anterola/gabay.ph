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
}: {
  canPrev: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-30 mt-6 border-t-2 border-clay-line bg-cream/90 px-1 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className={cn(
            "clay-press inline-flex min-h-[48px] items-center gap-2 rounded-2xl border-2 px-5 text-sm font-semibold",
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
            className="clay-press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-mango px-6 text-sm font-bold text-ink shadow-clay-mango hover:bg-mango-deep hover:text-white"
          >
            <Flag aria-hidden className="h-4 w-4" strokeWidth={2} />
            Review &amp; submit
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="clay-press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-berry px-6 text-sm font-bold text-white shadow-clay-berry hover:bg-berry-deep"
          >
            Next
            <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
