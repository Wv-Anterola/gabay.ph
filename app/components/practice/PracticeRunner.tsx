"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RefreshCcw, Target, Trophy } from "lucide-react";
import PracticeQuestion from "./PracticeQuestion";
import ClayButton from "@/app/components/ui/ClayButton";
import { MODULES, getPracticeQuestions } from "@/lib/questions";
import { loadResult } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { ChoiceId, ModuleId } from "@/lib/types";

export default function PracticeRunner({ module }: { module: ModuleId }) {
  const meta = MODULES[module];

  // Weak topics for this module come from the stored diagnostic result, if any.
  const [weakTopics, setWeakTopics] = useState<string[] | null>(null);
  useEffect(() => {
    const r = loadResult();
    const topics = r
      ? r.weakTopics.filter((t) => t.module === module).map((t) => t.topic)
      : [];
    setWeakTopics(topics);
    trackEvent("practice_started", { module, weak_topic_count: topics.length });
  }, [module]);

  // Build the practice set once weak topics are known (prefer weak topics, else
  // fall back to general module practice). 10-15 items.
  const questions = useMemo(() => {
    if (weakTopics === null) return [];
    return getPracticeQuestions(module, weakTopics, 15);
  }, [module, weakTopics]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ChoiceId | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (weakTopics === null) {
    return <div className="mx-auto max-w-content px-5 py-24 text-center text-ink-muted">Loading…</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-content px-5 py-20 text-center">
        <h1 className="font-display text-h1 font-bold text-ink">No practice items yet</h1>
        <p className="mt-3 text-ink-muted">This module has no approved practice questions right now.</p>
        <div className="mt-6">
          <ClayButton href="/diagnostic" variant="primary">
            Back to diagnostic
          </ClayButton>
        </div>
      </div>
    );
  }

  const usingWeak = weakTopics.length > 0;
  const q = questions[index];

  function check() {
    if (selected === undefined) return;
    setRevealed(true);
    if (selected === q.answer) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      trackEvent("practice_completed", {
        module,
        correct: correctCount,
        total: questions.length,
      });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(undefined);
    setRevealed(false);
  }

  function restart() {
    setIndex(0);
    setSelected(undefined);
    setRevealed(false);
    setCorrectCount(0);
    setDone(false);
    trackEvent("practice_started", { module, restart: true });
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto max-w-content px-5 py-16 lg:py-20">
        <div className="rounded-clay-xl border-2 border-clay-line bg-clay p-8 text-center shadow-clay-lg">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-clay bg-mango text-ink shadow-clay-mango">
            <Trophy aria-hidden className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1 className="mt-5 font-display text-h1 font-bold text-ink">Practice complete</h1>
          <p className="tabular mt-3 text-lg text-ink-muted">
            You got <span className="font-bold text-ink">{correctCount}</span> of {questions.length}{" "}
            correct ({pct}%) in {meta.name}.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-faint">
            Practice works best in small, regular doses. Come back tomorrow for another set, and watch
            your weak topics shrink.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <ClayButton onClick={restart} variant="primary">
              <RefreshCcw aria-hidden className="h-4 w-4" strokeWidth={2} />
              Practice again
            </ClayButton>
            <ClayButton href="/results" variant="secondary">
              Back to my results
            </ClayButton>
            <ClayButton href="/waitlist" variant="ghost">
              I want more practice
            </ClayButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-5 py-8 lg:py-12">
      <div className="flex items-center justify-between">
        <Link
          href="/results"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-berry"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={2} />
          My results
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-clay-line bg-clay px-3 py-1 text-xs font-bold text-ink">
          <Target aria-hidden className="h-3.5 w-3.5 text-berry" strokeWidth={2} />
          {usingWeak ? "Weak-area practice" : "Module practice"}
        </span>
      </div>

      <div className="mt-3">
        <h1 className="font-display text-h2 font-bold text-ink">{meta.name} practice</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {usingWeak
            ? "Focused on the topics your diagnostic flagged as weak."
            : "General practice for this module. Take the diagnostic to target your weak topics."}
        </p>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-clay-deep">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300"
          style={{ width: `${((index + (revealed ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="mt-6">
        <PracticeQuestion
          question={q}
          index={index}
          total={questions.length}
          selected={selected}
          revealed={revealed}
          onSelect={setSelected}
        />
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        {!revealed ? (
          <button
            type="button"
            onClick={check}
            disabled={selected === undefined}
            className="clay-press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-berry px-6 text-sm font-bold text-white shadow-clay-berry hover:bg-berry-deep disabled:opacity-50"
          >
            Check answer
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="clay-press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-mango px-6 text-sm font-bold text-ink shadow-clay-mango hover:bg-mango-deep hover:text-white"
          >
            {index + 1 >= questions.length ? "Finish" : "Next question"}
            <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
