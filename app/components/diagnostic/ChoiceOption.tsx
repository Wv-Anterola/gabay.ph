"use client";

import { cn } from "@/lib/cn";
import type { ChoiceId } from "@/lib/types";

/**
 * A single answer choice rendered as a styled native radio for full keyboard
 * and screen-reader support. Selection is shown by border, fill, and the letter
 * badge (not color alone).
 */
export default function ChoiceOption({
  name,
  choiceId,
  text,
  selected,
  onSelect,
}: {
  name: string;
  choiceId: ChoiceId;
  text: string;
  selected: boolean;
  onSelect: (id: ChoiceId) => void;
}) {
  return (
    <label
      className={cn(
        "clay-press flex cursor-pointer items-start gap-3 rounded-clay border-2 bg-cream px-4 py-3.5 shadow-clay-sm transition-colors",
        selected
          ? "border-berry bg-berry-tint"
          : "border-clay-line hover:border-berry-soft hover:bg-clay",
      )}
    >
      <input
        type="radio"
        name={name}
        value={choiceId}
        checked={selected}
        onChange={() => onSelect(choiceId)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-bold uppercase",
          selected
            ? "border-berry bg-berry text-white"
            : "border-clay-line bg-clay text-ink-muted",
        )}
      >
        {choiceId}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed text-ink">{text}</span>
    </label>
  );
}
