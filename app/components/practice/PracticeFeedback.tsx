import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "@/lib/types";

/** Immediate, deterministic explanation shown after a practice answer. */
export default function PracticeFeedback({
  question,
  correct,
}: {
  question: Question;
  correct: boolean;
}) {
  const answerText = question.choices.find((c) => c.id === question.answer)?.text ?? "";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-5 rounded-clay border-2 px-5 py-4 ${
        correct ? "border-teal-soft/40 bg-teal-tint" : "border-berry-soft/30 bg-berry-tint"
      }`}
    >
      <div className="flex items-center gap-2">
        {correct ? (
          <CheckCircle2 aria-hidden className="h-5 w-5 text-state-strong" strokeWidth={2} />
        ) : (
          <XCircle aria-hidden className="h-5 w-5 text-state-weak" strokeWidth={2} />
        )}
        <p className={`text-sm font-bold ${correct ? "text-teal-deep" : "text-berry-deep"}`}>
          {correct ? "Correct!" : "Not quite."}
        </p>
      </div>
      {!correct ? (
        <p className="mt-2 text-sm text-ink">
          The correct answer is{" "}
          <span className="font-bold uppercase">{question.answer}</span>: {answerText}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{question.explanation}</p>
    </div>
  );
}
