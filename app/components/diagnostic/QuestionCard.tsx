"use client";

import ChoiceOption from "./ChoiceOption";
import Tag from "@/app/components/ui/Tag";
import { getPassage } from "@/lib/questions";
import type { ChoiceId, Question } from "@/lib/types";

export default function QuestionCard({
  question,
  index,
  total,
  selected,
  onSelect,
}: {
  question: Question;
  index: number;
  total: number;
  selected?: ChoiceId;
  onSelect: (id: ChoiceId) => void;
}) {
  const passage = getPassage(question.passageId);

  return (
    <div className="rounded-clay-lg border-2 border-clay-line bg-clay p-6 shadow-clay lg:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tabular text-xs font-bold uppercase tracking-wide text-ink-faint">
          Question {index + 1} of {total}
        </span>
        <Tag>{question.topic}</Tag>
        {question.subtopic ? <Tag>{question.subtopic}</Tag> : null}
      </div>

      {passage ? (
        <div className="mt-4 rounded-clay border-2 border-clay-line bg-cream px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-mango-deep">{passage.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{passage.body}</p>
        </div>
      ) : null}

      <h2 className="mt-5 text-lg font-semibold leading-relaxed text-ink lg:text-xl">
        {question.stem}
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
