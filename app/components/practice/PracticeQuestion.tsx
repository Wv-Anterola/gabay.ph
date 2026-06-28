"use client";

import { Check, X } from "lucide-react";
import MathText from "@/app/components/shared/MathText";
import PracticeFeedback from "./PracticeFeedback";
import { getPassage } from "@/lib/questions";
import { cn } from "@/lib/cn";
import type { ChoiceId, Question } from "@/lib/types";

export default function PracticeQuestion({
  question,
  index,
  total,
  selected,
  revealed,
  onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  selected?: ChoiceId;
  revealed: boolean;
  onSelect: (id: ChoiceId) => void;
}) {
  const passage = getPassage(question.passageId);
  const isCorrect = selected === question.answer;

  return (
    <div className="rounded-clay-lg border border-clay-line bg-clay p-6 shadow-clay lg:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tabular text-xs font-bold uppercase tracking-wide text-ink-faint">
          {index + 1} of {total}
        </span>
      </div>

      {passage ? (
        <div className="mt-4 rounded-clay border border-clay-line bg-cream px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-mango-deep">{passage.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            <MathText text={passage.body} />
          </p>
        </div>
      ) : null}

      {question.image ? (
        <figure className="mt-4 rounded-clay border border-clay-line bg-cream px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.image.src}
            alt={question.image.alt}
            className="max-h-80 w-full rounded-xl object-contain"
          />
          {question.image.caption ? (
            <figcaption className="mt-2 text-xs text-ink-muted">{question.image.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}

      <h2 className="mt-5 text-lg font-semibold leading-relaxed text-ink lg:text-xl">
        <MathText text={question.stem} />
      </h2>

      <fieldset className="mt-5" disabled={revealed}>
        <legend className="sr-only">Answer choices</legend>
        <div className="grid gap-3">
          {question.choices.map((c) => {
            const chosen = selected === c.id;
            const isAnswer = c.id === question.answer;
            const showCorrect = revealed && isAnswer;
            const showWrong = revealed && chosen && !isAnswer;
            return (
              <label
                key={c.id}
                className={cn(
                  "flex items-start gap-3 rounded-clay border bg-cream px-4 py-3.5 shadow-clay-sm transition-colors",
                  revealed ? "cursor-default" : "clay-press cursor-pointer hover:border-berry-soft hover:bg-clay",
                  showCorrect && "border-state-strong bg-teal-tint",
                  showWrong && "border-state-weak bg-berry-tint",
                  !revealed && chosen && "border-berry bg-berry-tint",
                  !showCorrect && !showWrong && !chosen && "border-clay-line",
                )}
              >
                <input
                  type="radio"
                  name={`pq-${question.id}`}
                  value={c.id}
                  checked={chosen}
                  onChange={() => !revealed && onSelect(c.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm font-bold uppercase",
                    showCorrect
                      ? "border-state-strong bg-state-strong text-white"
                      : showWrong
                        ? "border-state-weak bg-state-weak text-white"
                        : chosen
                          ? "border-berry bg-berry text-white"
                          : "border-clay-line bg-clay text-ink-muted",
                  )}
                >
                  {showCorrect ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : showWrong ? (
                    <X className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    c.id
                  )}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-ink">
                  <MathText text={c.text} />
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {revealed ? <PracticeFeedback question={question} correct={isCorrect} /> : null}
    </div>
  );
}
