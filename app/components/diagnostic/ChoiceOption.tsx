"use client";

import { Check } from "lucide-react";
import MathText from "@/app/components/shared/MathText";
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
        "flex cursor-pointer items-start gap-3 rounded-clay border bg-clay px-4 py-3.5 transition-colors",
        selected
          ? "border-berry bg-berry-tint"
          : "border-clay-line hover:border-berry-soft hover:bg-clay-deep",
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
          "tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm font-bold uppercase",
          selected
            ? "border-berry bg-berry text-white"
            : "border-clay-line bg-cream text-ink-muted",
        )}
      >
        {choiceId}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed text-ink">
        <MathText text={text} />
      </span>
      {selected ? (
        <Check
          aria-hidden
          className="ml-auto h-5 w-5 shrink-0 animate-pop-check self-center text-berry"
          strokeWidth={3}
        />
      ) : null}
    </label>
  );
}
