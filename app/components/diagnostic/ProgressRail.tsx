"use client";

import { cn } from "@/lib/cn";
import { Clock } from "lucide-react";

/**
 * Question navigation rail: a numbered grid showing answered / unanswered /
 * current, plus an optional soft timer. Each cell is a real button so any
 * question is reachable directly (keyboard + pointer).
 */
export default function ProgressRail({
  total,
  current,
  answeredIds,
  flaggedIds = new Set<string>(),
  questionIds,
  onJump,
  elapsedLabel,
}: {
  total: number;
  current: number;
  answeredIds: Set<string>;
  flaggedIds?: Set<string>;
  questionIds: string[];
  onJump: (index: number) => void;
  elapsedLabel?: string;
}) {
  const answeredCount = answeredIds.size;

  return (
    <aside className="rounded-clay-lg border-2 border-clay-line bg-cream p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">Your progress</p>
        {elapsedLabel ? (
          <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-ink-muted">
            <Clock aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
            {elapsedLabel}
          </span>
        ) : null}
      </div>

      <p className="tabular mt-1 text-xs text-ink-muted">
        {answeredCount} of {total} answered
      </p>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-clay-deep">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300"
          style={{ width: `${(answeredCount / total) * 100}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2" role="group" aria-label="Jump to question">
        {questionIds.map((id, i) => {
          const answered = answeredIds.has(id);
          const flagged = flaggedIds.has(id);
          const isCurrent = i === current;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ", not answered"}${isCurrent ? ", current" : ""}`}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "tabular flex h-10 items-center justify-center rounded-xl border-2 text-sm font-bold transition-colors",
                isCurrent
                  ? "border-berry bg-berry text-white"
                  : flagged
                      ? "border-mango bg-mango-tint text-mango-deep"
                    : answered
                      ? "border-teal-soft/40 bg-teal-tint text-teal-deep"
                      : "border-clay-line bg-clay text-ink-muted hover:bg-clay-deep",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-1.5 text-xs text-ink-muted">
        <p className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border-2 border-teal-soft/40 bg-teal-tint" />
          Answered
        </p>
        <p className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border-2 border-clay-line bg-clay" />
          Not yet answered
        </p>
        <p className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border-2 border-mango bg-mango-tint" />
          Flagged
        </p>
      </div>
    </aside>
  );
}
