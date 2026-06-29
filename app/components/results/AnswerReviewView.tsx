"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Flag, XCircle } from "lucide-react";
import MathText from "@/app/components/shared/MathText";
import QuestionFigure from "@/app/components/shared/QuestionFigure";
import Tag from "@/app/components/ui/Tag";
import { getPassage, getQuestionById } from "@/lib/questions";
import { formatDuration } from "@/lib/mockExam";
import { loadMockResult } from "@/lib/storage";
import type { MockExamResult } from "@/lib/types";

type Filter = "missed" | "all" | "flagged";

export default function AnswerReviewView({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<MockExamResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("missed");

  useEffect(() => {
    setResult(loadMockResult(attemptId));
    setLoaded(true);
  }, [attemptId]);

  const reviews = useMemo(() => {
    if (!result) return [];
    if (filter === "all") return result.questionReviews;
    if (filter === "flagged") return result.questionReviews.filter((r) => r.isFlagged);
    return result.questionReviews.filter((r) => !r.isCorrect);
  }, [filter, result]);

  if (!loaded) {
    return <div className="mx-auto max-w-content px-5 py-24 text-center text-ink-muted">Loading…</div>;
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-content px-5 py-20 text-center">
        <h1 className="font-display text-h1 font-bold text-ink">Review not found</h1>
        <p className="mt-3 text-ink-muted">This browser does not have that submitted mock exam.</p>
        <div className="mt-6">
          <Link href="/results" className="text-sm font-semibold text-berry hover:text-berry-deep">
            Back to results
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-wide px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/results?attemptId=${attemptId}`}
            className="text-sm font-semibold text-ink-muted hover:text-berry"
          >
            ← Back to results
          </Link>
          <h1 className="mt-3 font-display text-h1 font-bold text-ink">Answer review</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Review explanations, topics, difficulty, and time spent for every question.
          </p>
        </div>
        <span className="tabular rounded-xl border border-clay-line bg-clay px-3 py-1 text-xs font-bold text-ink">
          {result.overall.correct}/{result.overall.total} correct
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          ["missed", "Incorrect & unanswered"],
          ["all", "All questions"],
          ["flagged", "Flagged"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value as Filter)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
              filter === value
                ? "border-berry bg-berry text-white"
                : "border-clay-line bg-cream text-ink-muted hover:bg-clay"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ol className="mt-8 space-y-5">
        {reviews.map((review, index) => {
          const question = getQuestionById(review.questionId);
          if (!question) return null;
          const passage = getPassage(question.passageId);
          const selected = review.selectedAnswer
            ? question.choices.find((choice) => choice.id === review.selectedAnswer)
            : undefined;
          const correct = question.choices.find((choice) => choice.id === review.correctAnswer);

          return (
            <li
              key={review.questionId}
              className="rounded-clay-lg border border-clay-line bg-cream p-6 shadow-clay"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="tabular text-xs font-bold uppercase tracking-wide text-ink-faint">
                  Review {index + 1}
                </span>
                <Tag>{question.topic}</Tag>
                {question.subtopic ? <Tag>{question.subtopic}</Tag> : null}
                <Tag>{question.difficulty}</Tag>
                {review.isFlagged ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-mango-tint px-2 py-1 text-xs font-bold text-mango-deep">
                    <Flag aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                    Flagged
                  </span>
                ) : null}
              </div>

              {passage ? (
                <div className="mt-4 rounded-clay border border-clay-line bg-clay px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-mango-deep">
                    {passage.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink">
                    <MathText text={passage.body} />
                  </p>
                </div>
              ) : null}

              <QuestionFigure image={question.image} />

              <h2 className="mt-5 text-lg font-bold leading-relaxed text-ink">
                <MathText text={question.stem} />
              </h2>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div
                  className={`rounded-clay border px-4 py-3 ${
                    review.isCorrect
                      ? "border-teal-soft/40 bg-teal-tint"
                      : "border-berry-soft/30 bg-berry-tint"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {review.isCorrect ? (
                      <CheckCircle2 aria-hidden className="h-5 w-5 text-state-strong" />
                    ) : (
                      <XCircle aria-hidden className="h-5 w-5 text-state-weak" />
                    )}
                    <p className="text-sm font-bold text-ink">Your answer</p>
                  </div>
                  <p className="mt-2 text-sm text-ink-muted">
                    {selected ? (
                      <>
                        <span className="font-bold uppercase">{selected.id}</span>:{" "}
                        <MathText text={selected.text} />
                      </>
                    ) : (
                      "Unanswered"
                    )}
                  </p>
                </div>
                <div className="rounded-clay border border-teal-soft/40 bg-teal-tint px-4 py-3">
                  <p className="text-sm font-bold text-ink">Correct answer</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {correct ? (
                      <>
                        <span className="font-bold uppercase">{correct.id}</span>:{" "}
                        <MathText text={correct.text} />
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-clay border border-clay-line bg-clay px-4 py-3">
                <p className="text-sm font-bold text-ink">Explanation</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  <MathText text={question.explanation} />
                </p>
              </div>

              <p className="tabular mt-3 text-xs font-semibold text-ink-faint">
                Time spent: {formatDuration(review.timeSpentSeconds)}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
