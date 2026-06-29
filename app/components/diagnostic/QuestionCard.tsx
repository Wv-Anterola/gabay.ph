"use client";

import { Flag } from "lucide-react";
import ChoiceOption from "./ChoiceOption";
import MathText from "@/app/components/shared/MathText";
import QuestionFigure from "@/app/components/shared/QuestionFigure";
import { cn } from "@/lib/cn";
import { getPassage } from "@/lib/questions";
import type { ChoiceId, Question } from "@/lib/types";

export default function QuestionCard({
  question,
  index,
  total,
  selected,
  flagged = false,
  onSelect,
  onToggleFlag,
  className,
}: {
  question: Question;
  index: number;
  total: number;
  selected?: ChoiceId;
  flagged?: boolean;
  onSelect: (id: ChoiceId) => void;
  onToggleFlag?: () => void;
  className?: string;
}) {
  const passage = getPassage(question.passageId);

  return (
    <div className={cn("rounded-clay-lg border border-clay-line bg-cream p-6 lg:p-8", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="tabular text-xs font-bold uppercase tracking-wide text-ink-faint">
          Question {index + 1} of {total}
        </span>
        {onToggleFlag ? (
          <button
            type="button"
            onClick={onToggleFlag}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold ${
              flagged
                ? "border-mango bg-mango-tint text-mango-deep"
                : "border-clay-line bg-clay text-ink-muted hover:bg-clay-deep"
            }`}
          >
            <Flag aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
            {flagged ? "Flagged" : "Flag"}
          </button>
        ) : null}
      </div>

      {passage ? (
        <div className="mt-4 rounded-clay border border-clay-line bg-clay px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-mango-deep">{passage.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            <MathText text={passage.body} />
          </p>
        </div>
      ) : null}

      <QuestionFigure image={question.image} />

      <h2 className="mt-5 text-lg font-semibold leading-relaxed text-ink lg:text-xl">
        <MathText text={question.stem} />
      </h2>

      <fieldset className="mt-5">
        <legend className="sr-only">Answer choices for question {index + 1}</legend>
        <div className="grid gap-3">
          {question.choices.map((c) => (
            <ChoiceOption
              key={c.id}
              name={`q-${question.id}`}
              choiceId={c.id}
              text={c.text}
              selected={selected === c.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}
